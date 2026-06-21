import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPostMatchResolutionMemoryText } from "@/lib/clone/post-match-resolution";

describe("buildPostMatchResolutionMemoryText", () => {
  it("formats correct human pick", () => {
    const text = buildPostMatchResolutionMemoryText({
      matchLabel: "Brazil vs France",
      predictedWinner: "BRA",
      predictedScore: "2-1",
      actualWinner: "BRA",
      actualScore: "2-1",
      humanCorrect: true,
      cloneAgreed: true,
    });
    assert.ok(text.includes("[post_match]"));
    assert.ok(text.includes("correct"));
    assert.ok(text.includes("Clone agreed"));
  });

  it("formats incorrect pick with clone disagreement", () => {
    const text = buildPostMatchResolutionMemoryText({
      matchLabel: "Brazil vs France",
      predictedWinner: "BRA",
      predictedScore: "2-0",
      actualWinner: "FRA",
      actualScore: "1-2",
      humanCorrect: false,
      cloneAgreed: false,
    });
    assert.ok(text.includes("incorrect"));
    assert.ok(text.includes("Clone disagreed"));
  });

  it("handles missing clone prediction", () => {
    const text = buildPostMatchResolutionMemoryText({
      matchLabel: "Brazil vs France",
      predictedWinner: null,
      predictedScore: null,
      actualWinner: "FRA",
      actualScore: "1-0",
      humanCorrect: false,
      cloneAgreed: null,
    });
    assert.ok(text.includes("no pick"));
    assert.ok(text.includes("unavailable"));
  });
});
