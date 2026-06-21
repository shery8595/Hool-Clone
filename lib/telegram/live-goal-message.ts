import { z } from "zod";
import { getFanProfile } from "@/lib/db/users";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import type { Match } from "@/lib/mock/types";
import {
  buildLiveGoalPrompt,
  LIVE_GOAL_SYSTEM,
  liveGoalResponseSchema,
} from "@/lib/prompts/live-goal";
import {
  finalizeTelegramMessage,
  recallMemoriesForTelegramMessage,
  type TelegramMessageAssembly,
} from "@/lib/telegram/assemble-telegram-message";

const liveGoalSchema = z.object({
  message: z.string().min(1),
  citedMemoryIds: z.array(z.string()).optional(),
});

export type BuildLiveGoalInput = {
  userId: string;
  match: Match;
  publicSlug?: string | null;
  appUrl?: string;
  matchContext: string;
  scoringTeamCode?: string | null;
  favoriteTeam?: string | null;
  userPick?: string | null;
  situation: "scored" | "conceded" | "neutral";
};

export async function buildLiveGoalMessage(
  input: BuildLiveGoalInput,
): Promise<TelegramMessageAssembly> {
  const profile = await getFanProfile(input.userId);
  const favoriteTeam = input.favoriteTeam ?? profile?.favorite_team ?? null;

  const recalledMemories = await recallMemoriesForTelegramMessage({
    userId: input.userId,
    match: input.match,
    favoriteTeam,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    userPick: input.userPick,
    emphasizeLive: true,
  });

  const fallbackBySituation: Record<BuildLiveGoalInput["situation"], string> = {
    scored: favoriteTeam
      ? `GOAL! ${favoriteTeam} are on the board — your clone saw this energy coming.`
      : "GOAL! Your pick is looking dangerous right now.",
    conceded: favoriteTeam
      ? `They scored against ${favoriteTeam}. Your clone is already rewriting the narrative.`
      : "Goal against your side — your clone remembers you've been here before.",
    neutral:
      "Goal in your match — your clone is watching how this shifts your prediction.",
  };

  const llm = getLlmAdapter();
  let llmMessage = fallbackBySituation[input.situation];
  let citedMemoryIds: string[] | undefined;

  if (llm) {
    try {
      const raw = await llm.generateJson<unknown>({
        system: LIVE_GOAL_SYSTEM,
        user: buildLiveGoalPrompt({
          profileSummary: profile?.summary ?? null,
          favoriteTeam,
          recalledMemories: recalledMemories.map((m) => ({
            id: m.id,
            text: m.text,
            type: m.type,
            source: m.source,
            score: m.finalScore ?? m.score,
          })),
          matchContext: input.matchContext,
          scoringTeam: input.scoringTeamCode ?? undefined,
          userPick: input.userPick ?? undefined,
          situation: input.situation,
        }),
        schemaName: "LiveGoal",
        schema: liveGoalResponseSchema,
      });
      const parsed = liveGoalSchema.parse(raw);
      llmMessage = parsed.message;
      citedMemoryIds = parsed.citedMemoryIds;
    } catch {
      llmMessage = fallbackBySituation[input.situation];
    }
  }

  return finalizeTelegramMessage({
    recalledMemories,
    llmMessage,
    citedMemoryIds,
    publicSlug: input.publicSlug,
    appUrl: input.appUrl,
  });
}
