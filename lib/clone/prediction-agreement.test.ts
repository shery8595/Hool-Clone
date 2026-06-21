import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";

describe("predictionsAgree", () => {
  it("returns true when winner and scores match", () => {
    assert.equal(
      predictionsAgree(
        { winner: "BRA", homeScore: 2, awayScore: 1 },
        { winner: "BRA", homeScore: 2, awayScore: 1 },
      ),
      true,
    );
  });

  it("returns false when winner differs", () => {
    assert.equal(
      predictionsAgree(
        { winner: "BRA", homeScore: 2, awayScore: 1 },
        { winner: "FRA", homeScore: 2, awayScore: 1 },
      ),
      false,
    );
  });
});
