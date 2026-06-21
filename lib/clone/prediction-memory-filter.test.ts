import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCurrentMatchSubmittedPick } from "@/lib/clone/prediction-memory-filter";

describe("isCurrentMatchSubmittedPick", () => {
  it("matches prediction_submit for same match", () => {
    assert.equal(
      isCurrentMatchSubmittedPick(
        {
          metadataMatchId: "m071",
          source: "prediction_submit",
          text: "Brazil to win",
        },
        "m071",
      ),
      true,
    );
  });

  it("matches prediction_pattern with [prediction] prefix", () => {
    assert.equal(
      isCurrentMatchSubmittedPick(
        {
          metadataMatchId: "m071",
          type: "prediction_pattern",
          text: "[prediction] Brazil 2-1",
        },
        "m071",
      ),
      true,
    );
  });

  it("returns false for different match", () => {
    assert.equal(
      isCurrentMatchSubmittedPick(
        {
          metadataMatchId: "m072",
          source: "prediction_submit",
          text: "Pick",
        },
        "m071",
      ),
      false,
    );
  });
});
