import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFallbackDebateReply } from "@/lib/debate/fallback-debate-reply";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { makeReceipt } from "@/lib/test/fixtures";

const catalog = [
  makeReceipt({ id: "r1", number: 1, text: "You back Brazil with loyalty" }),
  makeReceipt({ id: "r2", number: 2, text: "You distrust England" }),
];

describe("buildFallbackDebateReply", () => {
  it("concedes with cited receipts", () => {
    const message = "You're right about that";
    const analysis = analyzeDebateTurn(message, []);
    const result = buildFallbackDebateReply({
      userMessage: message,
      analysis,
      catalog,
      contradictions: [],
      allContradictions: [],
      predictionRebuttal: null,
      maturityLabel: "Imitator",
    });
    assert.ok(result.text.includes("Fair"));
    assert.ok(result.citedReceipts.length > 0);
  });

  it("uses prediction rebuttal when provided", () => {
    const message = "That is completely wrong";
    const analysis = analyzeDebateTurn(message, []);
    const result = buildFallbackDebateReply({
      userMessage: message,
      analysis,
      catalog,
      contradictions: [],
      allContradictions: [],
      predictionRebuttal: "You picked England twice last week.",
      maturityLabel: "Imitator",
    });
    assert.equal(result.text, "You picked England twice last week.");
  });

  it("returns stranger message when catalog empty", () => {
    const analysis = analyzeDebateTurn("Hello", []);
    const result = buildFallbackDebateReply({
      userMessage: "Hello",
      analysis,
      catalog: [],
      contradictions: [],
      allContradictions: [],
      predictionRebuttal: null,
      maturityLabel: "Stranger",
    });
    assert.ok(result.text.includes("don't have enough memory"));
    assert.equal(result.citedReceipts.length, 0);
  });
});
