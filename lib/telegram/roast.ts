import { z } from "zod";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import { getFanProfile, countMemories } from "@/lib/db/users";
import { listUserPredictions } from "@/lib/db/predictions";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import { extractMemoryDrivers } from "@/lib/stats/user-analytics";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import type { Match } from "@/lib/mock/types";
import {
  finalizeTelegramMessage,
  recallMemoriesForTelegramMessage,
  type TelegramMessageAssembly,
} from "@/lib/telegram/assemble-telegram-message";
import { recallMemoriesForTelegram } from "@/lib/telegram/recall-for-telegram";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";
import {
  buildRoastPrompt,
  ROAST_SYSTEM,
  roastResponseSchema,
} from "@/lib/prompts/roast";
import { memoryCountToMaturity } from "@/lib/auth/maturity";

const roastSchema = z.object({
  message: z.string().min(1),
  citedMemoryIds: z.array(z.string()).optional(),
});

export type BuildRoastInput = {
  userId: string;
  match?: Match;
  publicSlug?: string | null;
  appUrl?: string;
  matchContext?: string;
  wrongPick?: string;
  actualWinner?: string;
};

export async function buildRoastMessage(
  input: BuildRoastInput,
): Promise<TelegramMessageAssembly> {
  const [profile, history, memories, memoriesCount, onboardingDrivers] =
    await Promise.all([
      getFanProfile(input.userId),
      listUserPredictions(input.userId),
      listMemoriesChronologicalForUser(input.userId, 20),
      countMemories(input.userId),
      getOnboardingDrivers(input.userId),
    ]);

  const memoryDrivers = [
    ...extractMemoryDrivers(memories),
    ...onboardingDrivers,
  ];

  const contradictions = huntContradictions({
    profile,
    history,
    memoryDrivers,
    memoryTexts: memories.map((m) => m.text),
  });

  let recalledMemories: TelegramRankedMemory[];
  if (input.match?.homeTeam && input.match.awayTeam) {
    recalledMemories = await recallMemoriesForTelegramMessage({
      userId: input.userId,
      match: input.match,
      favoriteTeam: profile?.favorite_team,
      rivalTeam: profile?.rival_team,
      preferredStyle: profile?.preferred_style,
      userPick: input.wrongPick,
    });
  } else {
    const basic = await recallMemoriesForTelegram(input.userId);
    recalledMemories = basic.map((m) => ({
      id: m.id,
      text: m.text,
      score: 0.5,
      rrfScore: 0.5,
      finalScore: 0.5,
    }));
  }

  const contradictionText = contradictions[0]?.text ?? null;
  const maturity = memoryCountToMaturity(memoriesCount);

  const fallbackMessage =
    contradictionText ??
    (profile?.favorite_team
      ? `Your clone remembers you bleed ${profile.favorite_team}. ${maturity.label} level and still arguing with the receipts.`
      : "Your clone barely knows you yet — train it on the web before I can roast you properly.");

  const llm = getLlmAdapter();
  let llmMessage = fallbackMessage;
  let citedMemoryIds: string[] | undefined;

  if (llm) {
    try {
      const raw = await llm.generateJson<unknown>({
        system: ROAST_SYSTEM,
        user: buildRoastPrompt({
          profileSummary: profile?.summary ?? null,
          favoriteTeam: profile?.favorite_team ?? null,
          rivalTeam: profile?.rival_team ?? null,
          recalledMemories: recalledMemories.map((m) => ({
            id: m.id,
            text: m.text,
            type: m.type,
            source: m.source,
            score: m.finalScore ?? m.score,
          })),
          contradictionText,
          matchContext: input.matchContext,
          wrongPick: input.wrongPick,
          actualWinner: input.actualWinner,
        }),
        schemaName: "Roast",
        schema: roastResponseSchema,
      });
      const parsed = roastSchema.parse(raw);
      llmMessage = parsed.message;
      citedMemoryIds = parsed.citedMemoryIds;
    } catch {
      llmMessage = fallbackMessage;
    }
  }

  return finalizeTelegramMessage({
    recalledMemories,
    llmMessage,
    citedMemoryIds,
    publicSlug: input.publicSlug,
    appUrl: input.appUrl,
    requireStrongCitations: true,
  });
}
