import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCloneMood } from "@/lib/clone/clone-mood";
import { makeMatch } from "@/lib/test/fixtures";
import type { PredictionHistoryItem } from "@/lib/db/predictions";

function resolvedPick(correct: boolean): PredictionHistoryItem {
  const winner = correct ? "BRA" : "ARG";
  const match = makeMatch({
    status: "final",
    winnerCode: winner,
    homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
    awayTeam: { code: "ARG", name: "Argentina", flag: "arg" },
    homeScore: winner === "BRA" ? 2 : 0,
    awayScore: winner === "ARG" ? 2 : 1,
  });
  return {
    match,
    prediction: {
      matchId: match.id,
      winner: "BRA",
      homeScore: 2,
      awayScore: 1,
      confidence: 70,
      reasoning: "test",
      emotion: "calm",
    },
    matchResult: {
      status: "final",
      winner,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
    },
  };
}

describe("computeCloneMood", () => {
  it("returns contradiction_hunter when contradictions are high", () => {
    const mood = computeCloneMood({
      history: [],
      memoryDrivers: [],
      contradictionCount: 3,
      favoriteTeam: "Brazil",
    });
    assert.equal(mood.id, "contradiction_hunter");
  });

  it("returns salty after recent wrong picks", () => {
    const mood = computeCloneMood({
      history: [resolvedPick(false), resolvedPick(false)],
      memoryDrivers: [],
      contradictionCount: 0,
      favoriteTeam: "Brazil",
    });
    assert.equal(mood.id, "salty");
  });

  it("returns on_fire after recent correct picks", () => {
    const mood = computeCloneMood({
      history: [resolvedPick(true), resolvedPick(true)],
      memoryDrivers: [],
      contradictionCount: 0,
      favoriteTeam: "Brazil",
    });
    assert.equal(mood.id, "on_fire");
  });

  it("returns loyalist with loyalty-heavy drivers", () => {
    const mood = computeCloneMood({
      history: [],
      memoryDrivers: ["loyalty", "loyalty"],
      contradictionCount: 0,
      favoriteTeam: "Brazil",
    });
    assert.equal(mood.id, "loyalist");
  });
});
