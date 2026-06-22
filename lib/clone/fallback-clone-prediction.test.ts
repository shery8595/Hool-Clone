import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fallbackClonePrediction } from "@/lib/clone/fallback-clone-prediction";
import { makeMatch, makeRecalledMemory } from "@/lib/test/fixtures";

const match = makeMatch({
  id: "m071",
  homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
  awayTeam: { code: "FRA", name: "France", flag: "fr" },
});

describe("fallbackClonePrediction", () => {
  it("returns training question when memory is weak", () => {
    const result = fallbackClonePrediction({
      match,
      recalledMemories: [],
      memoriesCount: 1,
      favoriteTeam: "Brazil",
    });
    assert.ok(result.trainingQuestion);
    assert.equal(result.confidence, 25);
    assert.ok(result.reasoning.includes("too thin"));
  });

  it("backs favorite team when memory is sufficient", () => {
    const result = fallbackClonePrediction({
      match,
      recalledMemories: [
        makeRecalledMemory({
          id: "11111111-2222-4333-8444-555555555555",
          text: "Always back Brazil with loyalty",
          score: 0.8,
        }),
      ],
      memoriesCount: 10,
      favoriteTeam: "Brazil",
      rivalTeam: "Argentina",
    });
    assert.equal(result.predictedWinner, "BRA");
    assert.ok(result.memoryReceipts.length > 0);
    assert.equal(result.trainingQuestion, null);
  });

  it("picks against rival when rival is home team", () => {
    const engFra = makeMatch({
      homeTeam: { code: "ENG", name: "England", flag: "eng" },
      awayTeam: { code: "FRA", name: "France", flag: "fra" },
    });
    const result = fallbackClonePrediction({
      match: engFra,
      recalledMemories: [
        makeRecalledMemory({
          id: "22222222-3333-4333-8444-666666666666",
          text: "Distrust England",
          score: 0.7,
        }),
      ],
      memoriesCount: 12,
      rivalTeam: "England",
    });
    assert.equal(result.predictedWinner, "FRA");
  });
});
