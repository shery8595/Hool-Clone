import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findPredictionRebuttal } from "@/lib/debate/prediction-rebuttal";
import { makeMatch } from "@/lib/test/fixtures";
import type { PredictionHistoryItem } from "@/lib/db/predictions";

describe("findPredictionRebuttal", () => {
  const match = makeMatch({
    id: "m001",
    homeTeam: { code: "ENG", name: "England", flag: "eng" },
    awayTeam: { code: "FRA", name: "France", flag: "fra" },
    stage: "Group Stage",
  });

  const history: PredictionHistoryItem[] = [
    {
      match,
      prediction: {
        matchId: "m001",
        winner: "ENG",
        homeScore: 2,
        awayScore: 1,
        confidence: 70,
        reasoning: "England at home",
        emotion: "hyped",
      },
    },
  ];

  it("returns rebuttal when user claims never pick but history shows pick", () => {
    const rebuttal = findPredictionRebuttal(
      "I would never pick England",
      history,
      { favorite_team: "Brazil", rival_team: "England" },
    );
    assert.ok(rebuttal);
    assert.ok(rebuttal!.includes("England"));
    assert.ok(rebuttal!.includes("prediction history"));
  });

  it("returns null without absolute claim language", () => {
    const rebuttal = findPredictionRebuttal(
      "England might win",
      history,
      { favorite_team: "Brazil", rival_team: "England" },
    );
    assert.equal(rebuttal, null);
  });

  it("returns null when no team mention resolves", () => {
    const rebuttal = findPredictionRebuttal(
      "I would never pick anyone",
      history,
      { favorite_team: "Brazil", rival_team: "Argentina" },
    );
    assert.equal(rebuttal, null);
  });
});
