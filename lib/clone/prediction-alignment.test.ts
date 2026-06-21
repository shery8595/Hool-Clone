import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  averagePredictionAlignment,
  computePredictionAlignment,
} from "@/lib/clone/prediction-alignment";

describe("computePredictionAlignment", () => {
  it("returns 100 for identical picks", () => {
    const score = computePredictionAlignment(
      { winner: "BRA", homeScore: 2, awayScore: 1 },
      { winner: "BRA", homeScore: 2, awayScore: 1 },
    );
    assert.equal(score, 100);
  });

  it("returns 0 when winners differ", () => {
    const score = computePredictionAlignment(
      { winner: "BRA", homeScore: 2, awayScore: 1 },
      { winner: "FRA", homeScore: 1, awayScore: 2 },
    );
    assert.equal(score, 0);
  });

  it("gives partial credit for same winner different scoreline", () => {
    const score = computePredictionAlignment(
      { winner: "BRA", homeScore: 2, awayScore: 1 },
      { winner: "BRA", homeScore: 3, awayScore: 1 },
    );
    assert.ok(score > 70 && score < 100);
  });
});

describe("averagePredictionAlignment", () => {
  it("averages multiple pairs", () => {
    const avg = averagePredictionAlignment([
      {
        human: { winner: "BRA", homeScore: 2, awayScore: 1 },
        clone: { winner: "BRA", homeScore: 2, awayScore: 1 },
      },
      {
        human: { winner: "FRA", homeScore: 0, awayScore: 1 },
        clone: { winner: "BRA", homeScore: 2, awayScore: 0 },
      },
    ]);
    assert.equal(avg, 50);
  });

  it("returns 0 for empty input", () => {
    assert.equal(averagePredictionAlignment([]), 0);
  });
});
