import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCloneMatchPercent,
  computeLearningScore,
} from "@/lib/leaderboard/compute-learning-score";

describe("computeLearningScore", () => {
  it("adds memories and clone agreement counts", () => {
    assert.equal(computeLearningScore(20, 15), 35);
    assert.equal(computeLearningScore(0, 0), 0);
  });
});

describe("computeCloneMatchPercent", () => {
  it("matches computeCloneAgreementPercent semantics", () => {
    assert.equal(computeCloneMatchPercent(8, 11), 73);
    assert.equal(computeCloneMatchPercent(0, 0), 0);
  });
});
