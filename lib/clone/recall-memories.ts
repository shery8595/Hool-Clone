import { getMemoryAdapter } from "@/lib/memory";
import type { MemorySearchResult } from "@/lib/memory/memory-adapter";
import type { Match, RecallSource } from "@/lib/mock/types";
import {
  reciprocalRankFusion,
  rerankMemoriesForMatch,
  selectDiverseMemories,
  type RankedMemory,
} from "@/lib/clone/memory-rerank";
import { isCurrentMatchSubmittedPick } from "@/lib/clone/prediction-memory-filter";

export type RecalledMemory = {
  id?: string;
  text: string;
  type?: string;
  score: number;
  recallSource?: RecallSource;
  createdAt?: string;
  source?: string;
  metadataMatchId?: string;
  walrusBlobId?: string;
};

export type RecallMemoriesOptions = {
  favoriteTeam?: string | null;
  rivalTeam?: string | null;
  preferredStyle?: string | null;
  emphasizeCorrections?: boolean;
  extraQueries?: string[];
  liveMatchId?: string;
  /** Omit the user's saved pick for this fixture (clone must predict independently). */
  excludeCurrentMatchPick?: boolean;
};

function filterExcludedMemories(
  memories: RankedMemory[],
  match: Match,
  options: RecallMemoriesOptions,
): RankedMemory[] {
  if (!options.excludeCurrentMatchPick) return memories;
  return memories.filter((m) => !isCurrentMatchSubmittedPick(m, match.id));
}

function toRecalled(result: MemorySearchResult): RecalledMemory {
  const metadata = result.metadata ?? {};
  const memorySource =
    typeof metadata.source === "string" ? metadata.source : undefined;
  const backendSource =
    typeof metadata.backendSource === "string"
      ? metadata.backendSource
      : undefined;
  const walrusBlobId =
    typeof metadata.blobId === "string"
      ? metadata.blobId
      : typeof metadata.walrusBlobId === "string"
        ? metadata.walrusBlobId
        : undefined;

  return {
    id:
      typeof metadata.memoryId === "string" ? metadata.memoryId : undefined,
    text: result.text,
    type:
      typeof metadata.memoryType === "string" ? metadata.memoryType : undefined,
    score: result.score ?? 0.5,
    recallSource:
      backendSource === "walrus"
        ? "walrus"
        : backendSource === "postgres_fallback"
          ? "postgres_fallback"
          : undefined,
    createdAt:
      typeof metadata.createdAt === "string" ? metadata.createdAt : undefined,
    source: memorySource,
    metadataMatchId:
      typeof metadata.matchId === "string" ? metadata.matchId : undefined,
    walrusBlobId,
  };
}

function toRankedLists(
  batches: MemorySearchResult[][],
): RecalledMemory[][] {
  return batches.map((results) => results.map(toRecalled));
}

function buildQueries(
  match: Match,
  options: RecallMemoriesOptions,
): string[] {
  if (!match.homeTeam || !match.awayTeam) return [];

  const queries = [
    `${match.homeTeam.name} ${match.awayTeam.name} World Cup prediction`,
    `favorite team ${options.favoriteTeam ?? match.homeTeam.name} loyalty bias`,
    `distrust ${options.rivalTeam ?? ""} knockout rival bias`,
    `prediction style ${options.preferredStyle ?? "vibes loyalty chaos"}`,
  ];

  if (options.emphasizeCorrections) {
    queries.push(
      "user correction clone disagreement trust my instinct",
      `correction ${match.homeTeam.name} ${match.awayTeam.name}`,
    );
  }

  queries.push(
    "recent post match prediction outcome result",
    "what happened after my last World Cup prediction",
  );

  if (!options.excludeCurrentMatchPick) {
    queries.push(
      `prediction submit ${match.homeTeam.name} ${match.awayTeam.name}`,
    );
  }

  if (options.extraQueries?.length) {
    queries.push(...options.extraQueries);
  }

  return queries;
}

export async function recallRankedMemoriesForMatch(
  userId: string,
  match: Match,
  options: RecallMemoriesOptions = {},
): Promise<RankedMemory[]> {
  if (!match.homeTeam || !match.awayTeam) return [];

  const adapter = getMemoryAdapter();
  const queries = buildQueries(match, options);

  const batches = await Promise.all(
    queries.map((query) => adapter.recall(userId, query)),
  );

  const rankedLists = toRankedLists(batches);
  const fused = reciprocalRankFusion(rankedLists);
  const reranked = rerankMemoriesForMatch([...fused.values()], match, {
    liveMatchId: options.liveMatchId ?? match.id,
    excludeCurrentMatchPick: options.excludeCurrentMatchPick,
  });
  const filtered = filterExcludedMemories(reranked, match, options);
  return selectDiverseMemories(filtered, 8);
}

export async function recallMemoriesForMatch(
  userId: string,
  match: Match,
  options: RecallMemoriesOptions = {},
): Promise<RecalledMemory[]> {
  const diverse = await recallRankedMemoriesForMatch(userId, match, options);
  return diverse.map(stripRankFields);
}

function stripRankFields(memory: RankedMemory): RecalledMemory {
  return {
    id: memory.id,
    text: memory.text,
    type: memory.type,
    score: memory.finalScore,
    recallSource: memory.recallSource,
    createdAt: memory.createdAt,
    source: memory.source,
    metadataMatchId: memory.metadataMatchId,
    walrusBlobId: memory.walrusBlobId,
  };
}
