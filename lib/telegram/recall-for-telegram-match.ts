import type { RankedMemory } from "@/lib/clone/memory-rerank";
import {
  recallRankedMemoriesForMatch,
  type RecalledMemory,
} from "@/lib/clone/recall-memories";
import { getPredictionMemoryForMatch } from "@/lib/clone/remember-prediction";
import type { Match } from "@/lib/mock/types";

export type TelegramRankedMemory = RankedMemory & {
  walrusBlobId?: string;
};

export type RecallTelegramMatchOptions = {
  favoriteTeam?: string | null;
  rivalTeam?: string | null;
  preferredStyle?: string | null;
  userPick?: string | null;
  emphasizeLive?: boolean;
};

function toTelegramRanked(memory: RecalledMemory | RankedMemory): TelegramRankedMemory {
  const ranked = memory as RankedMemory;
  return {
    id: memory.id,
    text: memory.text,
    type: memory.type,
    score: memory.score,
    recallSource: memory.recallSource,
    createdAt: memory.createdAt,
    source: memory.source,
    metadataMatchId: memory.metadataMatchId,
    walrusBlobId: memory.walrusBlobId,
    rrfScore: ranked.rrfScore ?? 1,
    finalScore: ranked.finalScore ?? memory.score,
  };
}

function buildLiveExtraQueries(
  match: Match,
  options: RecallTelegramMatchOptions,
): string[] {
  if (!options.emphasizeLive || !match.homeTeam || !match.awayTeam) {
    return [];
  }

  const queries = [
    `${match.homeTeam.name} ${match.awayTeam.name} live goal reaction`,
  ];

  if (options.userPick) {
    queries.push(
      `why I picked ${options.userPick} for ${match.homeTeam.name} vs ${match.awayTeam.name}`,
    );
  }

  if (options.favoriteTeam) {
    queries.push(`${options.favoriteTeam} scoring conceding emotional take`);
  }

  return queries;
}

function pinPredictionMemory(
  ranked: TelegramRankedMemory[],
  pinned: NonNullable<Awaited<ReturnType<typeof getPredictionMemoryForMatch>>>,
  matchId: string,
): TelegramRankedMemory[] {
  const pinnedMemory: TelegramRankedMemory = {
    id: pinned.id,
    text: pinned.text,
    type: pinned.type,
    source: pinned.source,
    score: 1,
    rrfScore: 2,
    finalScore: 10,
    recallSource: pinned.walrusBlobId ? "walrus" : undefined,
    createdAt: pinned.createdAt,
    metadataMatchId: matchId,
    walrusBlobId: pinned.walrusBlobId,
  };

  const filtered = ranked.filter(
    (m) => (m.id ?? m.text) !== (pinnedMemory.id ?? pinnedMemory.text),
  );

  return [pinnedMemory, ...filtered].slice(0, 8);
}

export async function recallMemoriesForTelegramMatch(
  userId: string,
  match: Match,
  options: RecallTelegramMatchOptions = {},
): Promise<TelegramRankedMemory[]> {
  if (!match.homeTeam || !match.awayTeam) return [];

  const extraQueries = buildLiveExtraQueries(match, options);

  const [ranked, pinned] = await Promise.all([
    recallRankedMemoriesForMatch(userId, match, {
      favoriteTeam: options.favoriteTeam,
      rivalTeam: options.rivalTeam,
      preferredStyle: options.preferredStyle,
      extraQueries,
      liveMatchId: match.id,
    }),
    getPredictionMemoryForMatch(userId, match.id),
  ]);

  let memories = ranked.map(toTelegramRanked);

  if (pinned) {
    memories = pinPredictionMemory(memories, pinned, match.id);
  }

  return memories;
}

export function primaryRecallSource(
  memories: TelegramRankedMemory[],
): "walrus" | "postgres_fallback" | undefined {
  if (memories.some((m) => m.recallSource === "walrus")) return "walrus";
  if (memories.some((m) => m.recallSource === "postgres_fallback")) {
    return "postgres_fallback";
  }
  return undefined;
}
