import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBiasRadar,
  extractMemoryDrivers,
  hasBiasRadarData,
} from "@/lib/stats/bias-radar";
import { makeMatch } from "@/lib/test/fixtures";
import type { PredictionHistoryItem } from "@/lib/db/predictions";

function predictionHistory(
  winner: string,
  favorite: string,
): PredictionHistoryItem {
  const match = makeMatch({
    homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
    awayTeam: { code: "ARG", name: "Argentina", flag: "arg" },
    status: "final",
    winnerCode: winner,
  });
  return {
    match,
    prediction: {
      matchId: match.id,
      winner,
      homeScore: 2,
      awayScore: 1,
      confidence: 70,
      reasoning: "test",
      emotion: "calm",
    },
    matchResult: {
      status: "final",
      winner,
      homeScore: 2,
      awayScore: 1,
    },
  };
}

describe("extractMemoryDrivers", () => {
  it("collects valid driver chips from metadata", () => {
    const drivers = extractMemoryDrivers([
      { metadata: { driver: "loyalty" } },
      { metadata: { driver: "stats" } },
      { metadata: { driver: "invalid" } },
    ]);
    assert.deepEqual(drivers, ["loyalty", "stats"]);
  });
});

describe("hasBiasRadarData", () => {
  it("returns true when profile and history exist", () => {
    assert.equal(
      hasBiasRadarData({
        profile: {
          favorite_team: "Brazil",
          rival_team: "Argentina",
          preferred_style: "loyalty",
        },
        memoriesCount: 5,
        history: [predictionHistory("BRA", "Brazil")],
        cloneByMatchId: new Map(),
        memoryDrivers: ["loyalty"],
      }),
      true,
    );
  });
});

describe("buildBiasRadar", () => {
  it("returns five bias axes", () => {
    const match = predictionHistory("BRA", "Brazil").match;
    const axes = buildBiasRadar({
      profile: {
        favorite_team: "Brazil",
        rival_team: "Argentina",
        preferred_style: "loyalty",
      },
      memoriesCount: 8,
      history: [
        predictionHistory("BRA", "Brazil"),
        predictionHistory("BRA", "Brazil"),
        predictionHistory("ARG", "Brazil"),
      ],
      cloneByMatchId: new Map(),
      memoryDrivers: ["loyalty", "loyalty", "vibes"],
    });
    assert.equal(axes.length, 6);
    assert.ok(axes.every((axis) => axis.you >= 1 && axis.you <= 10));
    assert.ok(axes.every((axis) => axis.clone >= 1 && axis.clone <= 10));
    void match;
  });
});
