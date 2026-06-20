import { z } from "zod";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import { getFanProfile, countMemories } from "@/lib/db/users";
import { listUserPredictions } from "@/lib/db/predictions";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import { extractMemoryDrivers } from "@/lib/stats/user-analytics";
import { getMemoryAdapter } from "@/lib/memory";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
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

export type RoastResult = {
  message: string;
  citedMemoryIds: string[];
  publicProfileUrl?: string;
};

export type BuildRoastInput = {
  userId: string;
  publicSlug?: string | null;
  appUrl?: string;
  matchContext?: string;
  wrongPick?: string;
  actualWinner?: string;
};

export async function buildRoastMessage(
  input: BuildRoastInput,
): Promise<RoastResult> {
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

  const adapter = getMemoryAdapter();
  const recallQueries = [
    "What is this user's football prediction style and biases?",
    "What teams does this user trust or distrust?",
    "What contradictions exist in this user's football takes?",
  ];

  const recallResults = await Promise.all(
    recallQueries.map((q) => adapter.recall(input.userId, q)),
  );

  const recalledMemories = recallResults
    .flat()
    .slice(0, 6)
    .map((r) => ({
      text: r.text,
      id:
        typeof r.metadata?.memoryId === "string"
          ? r.metadata.memoryId
          : undefined,
    }));

  const contradictionText = contradictions[0]?.text ?? null;
  const maturity = memoryCountToMaturity(memoriesCount);

  const fallbackMessage =
    contradictionText ??
    (profile?.favorite_team
      ? `Your clone remembers you bleed ${profile.favorite_team}. ${maturity.label} level and still arguing with the receipts.`
      : "Your clone barely knows you yet — train it on the web before I can roast you properly.");

  const llm = getLlmAdapter();
  let message = fallbackMessage;

  if (llm) {
    try {
      const raw = await llm.generateJson<unknown>({
        system: ROAST_SYSTEM,
        user: buildRoastPrompt({
          profileSummary: profile?.summary ?? null,
          favoriteTeam: profile?.favorite_team ?? null,
          rivalTeam: profile?.rival_team ?? null,
          recalledMemories,
          contradictionText,
          matchContext: input.matchContext,
          wrongPick: input.wrongPick,
          actualWinner: input.actualWinner,
        }),
        schemaName: "Roast",
        schema: roastResponseSchema,
      });
      message = roastSchema.parse(raw).message;
    } catch {
      message = fallbackMessage;
    }
  }

  const profilePath =
    input.publicSlug && input.appUrl
      ? `${input.appUrl.replace(/\/$/, "")}/u/${input.publicSlug}`
      : input.publicSlug
        ? `/u/${input.publicSlug}`
        : undefined;

  const footer = profilePath
    ? `\n\nClone evidence: ${profilePath}`
    : "";

  return {
    message: `${message.trim()}${footer}`,
    citedMemoryIds: [],
    publicProfileUrl: profilePath,
  };
}
