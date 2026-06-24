import type { LeaderboardEntry } from "@/lib/leaderboard/types";

export const MIN_ARENA_MEMORIES = 3;

export type ArenaOpponent = LeaderboardEntry & {
  clashEligible: boolean;
  rivalryTag?: string;
  arenaWins?: number;
  arenaLosses?: number;
  /** Curated judge-facing demo with verified Mainnet memories */
  featuredLabel?: string;
};

export function isClashEligible(entry: LeaderboardEntry): boolean {
  return entry.memoriesCount >= MIN_ARENA_MEMORIES;
}

export function buildArenaOpponent(
  entry: LeaderboardEntry,
  viewerEntry: LeaderboardEntry | null,
): ArenaOpponent {
  let rivalryTag: string | undefined;
  if (viewerEntry) {
    if (
      viewerEntry.favoriteTeam &&
      entry.favoriteTeam &&
      viewerEntry.favoriteTeam === entry.favoriteTeam
    ) {
      rivalryTag = "Same team";
    } else if (
      viewerEntry.rivalTeam &&
      entry.favoriteTeam &&
      viewerEntry.rivalTeam === entry.favoriteTeam
    ) {
      rivalryTag = "Rival team";
    } else if (
      viewerEntry.favoriteTeam &&
      entry.rivalTeam &&
      viewerEntry.favoriteTeam === entry.rivalTeam
    ) {
      rivalryTag = "Rival team";
    }
  }

  return {
    ...entry,
    clashEligible: isClashEligible(entry),
    rivalryTag,
    arenaWins: entry.arenaWins,
    arenaLosses: entry.arenaLosses,
  };
}

export function enrichArenaOpponents(
  entries: LeaderboardEntry[],
  viewerEntry: LeaderboardEntry | null,
): ArenaOpponent[] {
  return entries.map((entry) => buildArenaOpponent(entry, viewerEntry));
}

function excludeViewer(
  entries: LeaderboardEntry[],
  viewerEntry: LeaderboardEntry | null,
): LeaderboardEntry[] {
  if (!viewerEntry) return entries;
  return entries.filter((entry) => entry.userId !== viewerEntry.userId);
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

function uniqueByUserId(
  items: LeaderboardEntry[],
  limit: number,
): LeaderboardEntry[] {
  const seen = new Set<string>();
  const result: LeaderboardEntry[] = [];
  for (const item of items) {
    if (seen.has(item.userId)) continue;
    seen.add(item.userId);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

export function pickQuickMatch(
  entries: LeaderboardEntry[],
  viewerEntry: LeaderboardEntry | null,
): ArenaOpponent | null {
  const pool = excludeViewer(entries, viewerEntry);
  if (pool.length === 0) return null;

  const eligible = pool.filter(isClashEligible);
  const rankWindow = viewerEntry
    ? pool.filter(
        (entry) => Math.abs(entry.rank - viewerEntry.rank) <= 5,
      )
    : pool;

  const eligibleInWindow = rankWindow.filter(isClashEligible);
  const pickFrom =
    eligibleInWindow.length > 0
      ? eligibleInWindow
      : eligible.length > 0
        ? eligible
        : rankWindow.length > 0
          ? rankWindow
          : pool;

  const picked = pickRandom(pickFrom);
  return picked ? buildArenaOpponent(picked, viewerEntry) : null;
}

export function suggestOpponents(
  entries: LeaderboardEntry[],
  viewerEntry: LeaderboardEntry | null,
  limit = 8,
  options?: { excludeSlugs?: string[] },
): ArenaOpponent[] {
  const exclude = new Set(options?.excludeSlugs ?? []);
  const pool = excludeViewer(entries, viewerEntry).filter(
    (entry) => !exclude.has(entry.slug),
  );
  if (pool.length === 0) return [];

  const suggestions: LeaderboardEntry[] = [];

  if (viewerEntry) {
    const neighbors = pool
      .filter((entry) => Math.abs(entry.rank - viewerEntry.rank) <= 3)
      .sort(
        (a, b) =>
          Math.abs(a.rank - viewerEntry.rank) -
          Math.abs(b.rank - viewerEntry.rank),
      );
    suggestions.push(...neighbors.slice(0, 2));

    const above = pool
      .filter(
        (entry) =>
          entry.rank < viewerEntry.rank &&
          entry.learningScore > viewerEntry.learningScore,
      )
      .sort((a, b) => a.rank - b.rank);
    suggestions.push(...above.slice(0, 2));

    const sameTeam = pool.filter(
      (entry) =>
        viewerEntry.favoriteTeam &&
        entry.favoriteTeam === viewerEntry.favoriteTeam,
    );
    suggestions.push(...sameTeam.slice(0, 1));

    const rivalTeam = pool.filter(
      (entry) =>
        viewerEntry.rivalTeam && entry.favoriteTeam === viewerEntry.rivalTeam,
    );
    suggestions.push(...rivalTeam.slice(0, 1));
  }

  const eligibleRandom = pool.filter(isClashEligible);
  suggestions.push(...eligibleRandom.slice(0, 2));

  const ranked = uniqueByUserId(
    [...suggestions, ...pool.filter(isClashEligible), ...pool],
    limit,
  );

  return ranked.map((entry) => buildArenaOpponent(entry, viewerEntry));
}

export function buildClashHref(
  challengerSlug: string,
  opponentSlug: string,
  fromArena = true,
): string {
  const params = new URLSearchParams({
    opponent: opponentSlug,
  });
  if (fromArena) params.set("from", "arena");
  return `/u/${challengerSlug}/clash?${params.toString()}`;
}
