import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractDebateEntities,
  extractSearchTerms,
  isCorrectionReceipt,
  pickReceiptsBySearchTerms,
  receiptsMatchSearchTerms,
} from "@/lib/debate/extract-entities";
import { makeReceipt } from "@/lib/test/fixtures";

describe("isCorrectionReceipt", () => {
  it("detects correction prefix", () => {
    assert.equal(
      isCorrectionReceipt(makeReceipt({ id: "c1", text: "Correction: Brazil is not a rival" })),
      true,
    );
    assert.equal(
      isCorrectionReceipt(makeReceipt({ id: "c2", text: "You love Brazil" })),
      false,
    );
  });
});

describe("extractSearchTerms", () => {
  it("extracts known entities from message", () => {
    const terms = extractSearchTerms("Brazil will beat France in the World Cup", {});
    assert.ok(terms.includes("brazil"));
    assert.ok(terms.includes("france"));
  });

  it("includes favorite team when mentioned", () => {
    const terms = extractSearchTerms("My Brazil pick is solid", {
      favoriteTeam: "Brazil",
    });
    assert.ok(terms.includes("brazil"));
  });

  it("adds rival team on hate phrasing", () => {
    const terms = extractSearchTerms("I hate most Argentina fans", {
      rivalTeam: "Argentina",
    });
    assert.ok(terms.includes("argentina"));
  });

  it("resolves Ronaldo alias to portugal", () => {
    const terms = extractSearchTerms("Ronaldo is the GOAT", {});
    assert.ok(terms.includes("ronaldo"));
    assert.ok(terms.includes("portugal"));
  });
});

describe("extractDebateEntities", () => {
  it("returns same terms as extractSearchTerms", () => {
    const message = "England vs Portugal who wins?";
    const entities = extractDebateEntities(message, {});
    assert.ok(entities.includes("england"));
    assert.ok(entities.includes("portugal"));
  });
});

describe("pickReceiptsBySearchTerms", () => {
  const catalog = [
    makeReceipt({
      id: "r1",
      number: 1,
      text: "You never trust England in knockouts",
    }),
    makeReceipt({
      id: "r2",
      number: 2,
      text: "Correction: Match: m071 — Brazil loyalty matters",
    }),
    makeReceipt({ id: "r3", number: 3, text: "You love chaos football" }),
  ];

  it("ranks receipts matching search terms", () => {
    const picked = pickReceiptsBySearchTerms(catalog, ["england"], {
      limit: 1,
    });
    assert.equal(picked[0]?.id, "r1");
  });

  it("can exclude corrections", () => {
    const picked = pickReceiptsBySearchTerms(catalog, ["brazil"], {
      includeCorrections: false,
      limit: 2,
    });
    assert.ok(picked.every((r) => !r.text.startsWith("Correction:")));
  });
});

describe("receiptsMatchSearchTerms", () => {
  it("returns true when any receipt matches", () => {
    const receipts = [
      makeReceipt({ id: "a", text: "Brazil star power" }),
    ];
    assert.equal(receiptsMatchSearchTerms(receipts, ["brazil"]), true);
  });

  it("returns true for empty search terms when receipts exist", () => {
    const receipts = [makeReceipt({ id: "a", text: "anything" })];
    assert.equal(receiptsMatchSearchTerms(receipts, []), true);
  });
});
