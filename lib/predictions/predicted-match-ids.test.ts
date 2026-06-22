import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPredictedMatchIdSet,
  hasPredictedMatch,
} from "@/lib/predictions/predicted-match-ids";
import { makeMatch } from "@/lib/test/fixtures";

describe("predicted match ids", () => {
  it("merges history and api ids with case-insensitive lookup", () => {
    const ids = buildPredictedMatchIdSet(
      [
        {
          match: makeMatch({ id: "m038" }),
          prediction: {
            matchId: "M038",
            winner: "ESP",
            homeScore: 2,
            awayScore: 1,
            confidence: 70,
            reasoning: "",
          },
          savedAt: new Date().toISOString(),
        },
      ],
      ["m041"],
    );

    assert.equal(hasPredictedMatch(ids, "m038"), true);
    assert.equal(hasPredictedMatch(ids, "M041"), true);
    assert.equal(hasPredictedMatch(ids, "m099"), false);
  });
});
