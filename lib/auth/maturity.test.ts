import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeMaturityProgress,
  maturityLevelToLabel,
  memoryCountToMaturity,
} from "@/lib/auth/maturity";

describe("memoryCountToMaturity", () => {
  it("returns Stranger below 3 memories", () => {
    assert.deepEqual(memoryCountToMaturity(0), { level: 0, label: "Stranger" });
    assert.deepEqual(memoryCountToMaturity(2), { level: 0, label: "Stranger" });
  });

  it("returns Learner at 3-8 memories", () => {
    assert.deepEqual(memoryCountToMaturity(5), { level: 1, label: "Learner" });
  });

  it("returns Full HoolClone at 40+ memories", () => {
    assert.deepEqual(memoryCountToMaturity(50), {
      level: 4,
      label: "Full HoolClone",
    });
  });
});

describe("maturityLevelToLabel", () => {
  it("clamps out-of-range levels", () => {
    assert.equal(maturityLevelToLabel(-1), "Stranger");
    assert.equal(maturityLevelToLabel(99), "Full HoolClone");
  });
});

describe("computeMaturityProgress", () => {
  it("returns 100 progress at max level", () => {
    const result = computeMaturityProgress(100);
    assert.equal(result.level, 4);
    assert.equal(result.progress, 100);
  });

  it("computes partial progress within level", () => {
    const result = computeMaturityProgress(5);
    assert.equal(result.level, 1);
    assert.ok(result.progress > 0 && result.progress < 100);
  });
});
