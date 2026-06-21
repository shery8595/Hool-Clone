import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alignCitationsToTurn } from "@/lib/debate/align-citations";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { makeReceipt } from "@/lib/test/fixtures";

const catalog = [
  makeReceipt({
    id: "11111111-2222-3333-4444-555555555555",
    number: 1,
    text: "You never trust England in knockouts",
  }),
  makeReceipt({
    id: "22222222-3333-4444-5555-666666666666",
    number: 2,
    text: "You love Brazil loyalty picks",
  }),
  makeReceipt({
    id: "33333333-4444-5555-6666-777777777777",
    number: 3,
    text: "Correction: England can surprise",
  }),
];

describe("alignCitationsToTurn", () => {
  it("prefers search-term matches over unrelated explicit ids", () => {
    const message = "England always chokes";
    const analysis = analyzeDebateTurn(message, []);
    const aligned = alignCitationsToTurn(
      "Take that",
      ["22222222-3333-4444-5555-666666666666"],
      catalog,
      message,
      analysis,
    );
    assert.ok(
      aligned.some((r) => r.text.toLowerCase().includes("england")),
    );
  });

  it("uses valid explicit citations when they match search terms", () => {
    const message = "England again";
    const analysis = analyzeDebateTurn(message, []);
    const aligned = alignCitationsToTurn(
      "Receipt",
      ["11111111-2222-3333-4444-555555555555"],
      catalog,
      message,
      analysis,
    );
    assert.ok(
      aligned.some((r) => r.id === "11111111-2222-3333-4444-555555555555"),
    );
  });

  it("falls back to top ranked non-correction receipt", () => {
    const message = "Random football chat";
    const analysis = analyzeDebateTurn(message, []);
    const aligned = alignCitationsToTurn(
      "Hmm",
      undefined,
      catalog,
      message,
      analysis,
    );
    assert.ok(aligned.length >= 1);
    assert.ok(!aligned[0]?.text.startsWith("Correction:"));
  });
});
