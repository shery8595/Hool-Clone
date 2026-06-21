import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import {
  rankMemoriesForTurn,
  scoreMemoryRelevance,
} from "@/lib/debate/score-memory-relevance";
import { makeReceipt } from "@/lib/test/fixtures";

function analysisFor(message: string) {
  return analyzeDebateTurn(message, [], {
    favoriteTeam: "Brazil",
    rivalTeam: "Argentina",
  });
}

describe("scoreMemoryRelevance", () => {
  const catalog = [
    makeReceipt({
      id: "england",
      number: 1,
      text: "You never trust England in emotional matches",
    }),
    makeReceipt({
      id: "brazil",
      number: 2,
      text: "You are loyal to Brazil through heartbreak",
    }),
    makeReceipt({
      id: "corr",
      number: 3,
      text: "Correction: Match: m071 — I do trust stats sometimes",
    }),
  ];

  it("scores entity mentions higher", () => {
    const message = "England always lets me down";
    const analysis = analysisFor(message);
    const englandScore = scoreMemoryRelevance(catalog[0]!, message, analysis);
    const brazilScore = scoreMemoryRelevance(catalog[1]!, message, analysis);
    assert.ok(englandScore > brazilScore);
  });

  it("boosts correction when disputing memory", () => {
    const message = "That memory is wrong about stats";
    const analysis = analysisFor(message);
    const corrScore = scoreMemoryRelevance(catalog[2]!, message, analysis);
    assert.ok(corrScore > 0);
  });

  it("penalizes prior cited receipts", () => {
    const message = "England again";
    const analysis = {
      ...analysisFor(message),
      priorCitedIds: ["england"],
    };
    const withPenalty = scoreMemoryRelevance(catalog[0]!, message, analysis);
    const without = scoreMemoryRelevance(
      catalog[0]!,
      message,
      analysisFor(message),
    );
    assert.ok(withPenalty < without);
  });
});

describe("rankMemoriesForTurn", () => {
  it("orders catalog by relevance score", () => {
    const catalog = [
      makeReceipt({ id: "a", text: "Generic football take" }),
      makeReceipt({ id: "b", text: "You despise Argentina in every rivalry" }),
    ];
    const message = "Argentina is my rival";
    const ranked = rankMemoriesForTurn(catalog, message, analysisFor(message));
    assert.equal(ranked[0]?.id, "b");
  });
});
