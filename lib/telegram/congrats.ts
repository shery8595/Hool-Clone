import { z } from "zod";
import { getFanProfile } from "@/lib/db/users";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import type { Match } from "@/lib/mock/types";
import {
  buildCongratsPrompt,
  CONGRATS_SYSTEM,
  congratsResponseSchema,
} from "@/lib/prompts/congrats";
import {
  finalizeTelegramMessage,
  recallMemoriesForTelegramMessage,
  type TelegramMessageAssembly,
} from "@/lib/telegram/assemble-telegram-message";

const congratsSchema = z.object({
  message: z.string().min(1),
  citedMemoryIds: z.array(z.string()).optional(),
});

export type BuildCongratsInput = {
  userId: string;
  match: Match;
  publicSlug?: string | null;
  appUrl?: string;
  matchContext?: string;
  userPick?: string;
  actualWinner?: string;
};

function isTeamInMatch(team: string | null | undefined, match: Match): boolean {
  if (!team) return false;
  return match.homeTeam?.code === team || match.awayTeam?.code === team;
}

function buildCongratsFallback(
  match: Match,
  favoriteTeam: string | null | undefined,
  userPick?: string,
  actualWinner?: string,
): string {
  const winner = actualWinner ?? match.winnerCode ?? undefined;

  if (userPick && winner && userPick === winner) {
    return `Nailed it — you had ${winner} and they delivered. Your clone is impressed.`;
  }

  if (favoriteTeam && isTeamInMatch(favoriteTeam, match) && winner === favoriteTeam) {
    return `${favoriteTeam} got the W. You saw it coming.`;
  }

  return "You got this one right. Your clone has to give you that.";
}

export async function buildCongratsMessage(
  input: BuildCongratsInput,
): Promise<TelegramMessageAssembly> {
  const profile = await getFanProfile(input.userId);

  const recalledMemories = await recallMemoriesForTelegramMessage({
    userId: input.userId,
    match: input.match,
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    userPick: input.userPick,
  });

  const fallbackMessage = buildCongratsFallback(
    input.match,
    profile?.favorite_team,
    input.userPick,
    input.actualWinner,
  );

  const llm = getLlmAdapter();
  let llmMessage = fallbackMessage;
  let citedMemoryIds: string[] | undefined;

  if (llm) {
    try {
      const raw = await llm.generateJson<unknown>({
        system: CONGRATS_SYSTEM,
        user: buildCongratsPrompt({
          profileSummary: profile?.summary ?? null,
          favoriteTeam: profile?.favorite_team ?? null,
          recalledMemories: recalledMemories.map((m) => ({
            id: m.id,
            text: m.text,
            type: m.type,
            source: m.source,
            score: m.finalScore ?? m.score,
          })),
          matchContext: input.matchContext,
          userPick: input.userPick,
          actualWinner: input.actualWinner,
        }),
        schemaName: "Congrats",
        schema: congratsResponseSchema,
      });
      const parsed = congratsSchema.parse(raw);
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
  });
}
