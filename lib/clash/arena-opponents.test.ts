import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClashHref,
  isClashEligible,
  pickQuickMatch,
  suggestOpponents,
} from "@/lib/clash/arena-opponents";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

function entry(
  overrides: Partial<LeaderboardEntry> & Pick<LeaderboardEntry, "userId" | "slug" | "rank">,
): LeaderboardEntry {
  return {
    displayName: overrides.slug,
    maturityLabel: "Learner",
    tierProgress: 50,
    memoriesCount: 5,
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

describe("arena-opponents", () => {
  it("isClashEligible requires 3+ memories", () => {
    assert.equal(isClashEligible(entry({ userId: "1", slug: "a", rank: 1, memoriesCount: 2 })), false);
    assert.equal(isClashEligible(entry({ userId: "1", slug: "a", rank: 1, memoriesCount: 3 })), true);
  });

  it("pickQuickMatch excludes viewer", () => {
    const viewer = entry({ userId: "me", slug: "me", rank: 2 });
    const entries = [
      viewer,
      entry({ userId: "b", slug: "b", rank: 1 }),
    ];
    const result = pickQuickMatch(entries, viewer);
    assert.ok(result);
    assert.notEqual(result.userId, "me");
  });

  it("suggestOpponents excludes viewer and caps limit", () => {
    const viewer = entry({ userId: "me", slug: "me", rank: 3 });
    const entries = Array.from({ length: 12 }, (_, i) =>
      entry({ userId: `u${i}`, slug: `u${i}`, rank: i + 1 }),
    );
    const suggestions = suggestOpponents(entries, viewer, 4);
    assert.equal(suggestions.length, 4);
    assert.ok(suggestions.every((s) => s.userId !== "me"));
  });

  it("buildClashHref includes arena marker", () => {
    assert.equal(
      buildClashHref("alice", "bob"),
      "/u/alice/clash?opponent=bob&from=arena",
    );
  });
});
