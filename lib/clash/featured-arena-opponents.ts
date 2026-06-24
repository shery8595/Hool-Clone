import { DEMO_SLUG, RIVAL_SLUG } from "@/lib/db/demo-memories";
import {
  buildArenaOpponent,
  buildClashHref,
  type ArenaOpponent,
} from "@/lib/clash/arena-opponents";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

export const FEATURED_ARENA_SLUGS = [DEMO_SLUG, RIVAL_SLUG] as const;

export const FEATURED_ARENA_LABEL = "Live Mainnet Walrus";

export function isFeaturedArenaSlug(slug: string): boolean {
  return (FEATURED_ARENA_SLUGS as readonly string[]).includes(slug);
}

export function buildJudgeDemoClashHref(fromArena = true): string {
  return buildClashHref(DEMO_SLUG, RIVAL_SLUG, fromArena);
}

export function pickFeaturedArenaOpponents(
  entries: LeaderboardEntry[],
  viewerEntry: LeaderboardEntry | null,
): ArenaOpponent[] {
  const featured: ArenaOpponent[] = [];

  for (const slug of FEATURED_ARENA_SLUGS) {
    if (viewerEntry?.slug === slug) continue;

    const entry = entries.find((row) => row.slug === slug);
    if (!entry) continue;

    featured.push({
      ...buildArenaOpponent(entry, viewerEntry),
      featuredLabel: FEATURED_ARENA_LABEL,
      rivalryTag:
        slug === RIVAL_SLUG ? "Judge demo rival" : "Judge demo",
    });
  }

  return featured;
}

export function pickFeaturedArenaProfiles(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  return FEATURED_ARENA_SLUGS.map((slug) =>
    entries.find((row) => row.slug === slug),
  ).filter((row): row is LeaderboardEntry => Boolean(row));
}
