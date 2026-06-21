import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { trySpecializedDebateReply } from "@/lib/debate/specialized-replies";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { makeReceipt } from "@/lib/test/fixtures";

const catalog = [
  makeReceipt({
    id: "r1",
    number: 1,
    text: "You despise Argentina in every rivalry match",
  }),
  makeReceipt({
    id: "r2",
    number: 2,
    text: "You predict with stats and xG models",
  }),
  makeReceipt({
    id: "r3",
    number: 3,
    text: "You are loyal to Brazil through heartbreak",
  }),
  makeReceipt({
    id: "r4",
    number: 4,
    text: "You never trust England — they always choke",
  }),
];

describe("trySpecializedDebateReply", () => {
  it("handles rival hate phrasing", () => {
    const message = "I hate Argentina the most";
    const analysis = analyzeDebateTurn(message, [], { rivalTeam: "Argentina" });
    const result = trySpecializedDebateReply({
      userMessage: message,
      analysis,
      catalog,
    });
    assert.ok(result);
    assert.ok(result.text.toLowerCase().includes("receipt"));
    assert.ok(result.citedReceipts.length > 0);
  });

  it("handles denying style with conflicting receipts", () => {
    const message = "I never said I predict with stats";
    const analysis = analyzeDebateTurn(message, []);
    const result = trySpecializedDebateReply({
      userMessage: message,
      analysis,
      catalog,
    });
    assert.ok(result);
    assert.ok(result.citedReceipts.length >= 2);
  });

  it("returns null when no specialized pattern matches", () => {
    const message = "Nice weather today";
    const analysis = analyzeDebateTurn(message, []);
    const result = trySpecializedDebateReply({
      userMessage: message,
      analysis,
      catalog: [],
    });
    assert.equal(result, null);
  });
});
