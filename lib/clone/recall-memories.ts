import { getMemoryAdapter } from "@/lib/memory";
import type { MemorySearchResult } from "@/lib/memory/memory-adapter";
import type { Match, RecallSource } from "@/lib/mock/types";

export type RecalledMemory = {
  id?: string;
  text: string;
  type?: string;
  score: number;
  recallSource?: RecallSource;
};

export type RecallMemoriesOptions = {
  favoriteTeam?: string | null;
  rivalTeam?: string | null;
  preferredStyle?: string | null;
  emphasizeCorrections?: boolean;
};

function toRecalled(result: MemorySearchResult): RecalledMemory {
  const metadata = result.metadata ?? {};
  return {
    id:
      typeof metadata.memoryId === "string" ? metadata.memoryId : undefined,
    text: result.text,
    type:
      typeof metadata.memoryType === "string" ? metadata.memoryType : undefined,
    score: result.score ?? 0.5,
    recallSource:
      metadata.source === "walrus"
        ? "walrus"
        : metadata.source === "postgres_fallback"
          ? "postgres_fallback"
          : undefined,
  };
}

function mergeRecalled(
  byKey: Map<string, RecalledMemory>,
  results: MemorySearchResult[],
): void {
  for (const result of results) {
    const recalled = toRecalled(result);
    const key = recalled.id ?? recalled.text;
    const existing = byKey.get(key);
    if (!existing || recalled.score > existing.score) {
      byKey.set(key, recalled);
    }
  }
}

export async function recallMemoriesForMatch(
  userId: string,
  match: Match,
  options: RecallMemoriesOptions = {},
): Promise<RecalledMemory[]> {
  if (!match.homeTeam || !match.awayTeam) return [];

  const adapter = getMemoryAdapter();
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

  const byKey = new Map<string, RecalledMemory>();
  const batches = await Promise.all(
    queries.map((query) => adapter.recall(userId, query)),
  );
  for (const results of batches) {
    mergeRecalled(byKey, results);
  }

  return [...byKey.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
