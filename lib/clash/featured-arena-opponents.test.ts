import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildJudgeDemoClashHref,
  isFeaturedArenaSlug,
  pickFeaturedArenaOpponents,
} from "@/lib/clash/featured-arena-opponents";
import { DEMO_SLUG, RIVAL_SLUG } from "@/lib/db/demo-memories";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

function entry(
  overrides: Partial<LeaderboardEntry> & Pick<LeaderboardEntry, "userId" | "slug" | "rank">,
): LeaderboardEntry {
  return {
    displayName: overrides.slug,
    maturityLabel: "Learner",
    tierProgress: 50,
    memoriesCount: 10,
    cloneAgreementCount: 2,
    comparablePredictions: 4,
    cloneMatchPercent: 50,
    learningScore: 7,
    favoriteTeam: null,
    rivalTeam: null,
    joinedAt: "2025-01-01T00:00:00.000Z",
    arenaWins: 0,
    arenaLosses: 0,
    arenaDraws: 0,
    ...overrides,
  };
}

describe("featured-arena-opponents", () => {
  it("flags demo slugs", () => {
    assert.equal(isFeaturedArenaSlug(DEMO_SLUG), true);
    assert.equal(isFeaturedArenaSlug(RIVAL_SLUG), true);
    assert.equal(isFeaturedArenaSlug("random-fan"), false);
  });

  it("builds judge clash href", () => {
    assert.equal(
      buildJudgeDemoClashHref(),
      `/u/${DEMO_SLUG}/clash?opponent=${RIVAL_SLUG}&from=arena`,
    );
  });

  it("returns demo and rival with featured labels", () => {
    const entries = [
      entry({ userId: "1", slug: DEMO_SLUG, rank: 1 }),
      entry({ userId: "2", slug: RIVAL_SLUG, rank: 2 }),
      entry({ userId: "3", slug: "other", rank: 3 }),
    ];
    const featured = pickFeaturedArenaOpponents(entries, null);
    assert.equal(featured.length, 2);
    assert.equal(featured[0]?.slug, DEMO_SLUG);
    assert.equal(featured[0]?.featuredLabel, "Live Mainnet Walrus");
    assert.equal(featured[1]?.slug, RIVAL_SLUG);
  });

  it("excludes viewer from featured challengable opponents", () => {
    const viewer = entry({ userId: "1", slug: DEMO_SLUG, rank: 1 });
    const entries = [
      viewer,
      entry({ userId: "2", slug: RIVAL_SLUG, rank: 2 }),
    ];
    const featured = pickFeaturedArenaOpponents(entries, viewer);
    assert.equal(featured.length, 1);
    assert.equal(featured[0]?.slug, RIVAL_SLUG);
  });
});
