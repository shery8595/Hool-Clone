import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatSourceLabel,
  parseMatchLabel,
  primaryQuoteFromBody,
  splitQuoteHighlight,
} from "@/lib/telegram/parse-share-card";

describe("parseMatchLabel", () => {
  it("parses team codes and score", () => {
    const parsed = parseMatchLabel("BRA vs FRA (2-1)");
    assert.equal(parsed?.teamA, "BRA");
    assert.equal(parsed?.teamB, "FRA");
    assert.equal(parsed?.scoreA, 2);
    assert.equal(parsed?.scoreB, 1);
  });

  it("returns null for empty label", () => {
    assert.equal(parseMatchLabel(""), null);
  });

  it("returns placeholder teams for non-standard label", () => {
    const parsed = parseMatchLabel("Final showdown");
    assert.equal(parsed?.teamA, "?");
  });
});

describe("primaryQuoteFromBody", () => {
  it("strips receipt footer lines", () => {
    const quote = primaryQuoteFromBody(
      "You were wrong again.\nMemory Receipts:\n#A cited",
    );
    assert.equal(quote, "You were wrong again.");
  });
});

describe("splitQuoteHighlight", () => {
  it("splits lead and highlight sentence", () => {
    const { lead, highlight } = splitQuoteHighlight(
      "You picked Portugal. Colombia ran right through you.",
    );
    assert.ok(lead.includes("Portugal"));
    assert.ok(highlight?.includes("Colombia"));
  });
});

describe("formatSourceLabel", () => {
  it("replaces underscores with spaces", () => {
    assert.equal(formatSourceLabel("telegram_post_match"), "telegram post match");
  });
});
