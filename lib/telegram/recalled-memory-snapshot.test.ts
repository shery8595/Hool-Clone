import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  excerptMemoryText,
  parseRecalledMemorySnapshots,
  toRecalledMemorySnapshots,
} from "@/lib/telegram/recalled-memory-snapshot";

describe("excerptMemoryText", () => {
  it("truncates long text", () => {
    const long = "a".repeat(200);
    const excerpt = excerptMemoryText(long, 50);
    assert.ok(excerpt.endsWith("…"));
    assert.equal(excerpt.length, 51);
  });
});

describe("toRecalledMemorySnapshots", () => {
  it("maps ranked memories to snapshots", () => {
    const snapshots = toRecalledMemorySnapshots([
      {
        id: "m1",
        text: "Brazil loyalty",
        score: 0.9,
        rrfScore: 1,
        finalScore: 1.1,
        recallSource: "walrus",
        walrusBlobId: "blob-1",
      },
    ]);
    assert.equal(snapshots[0]?.id, "m1");
    assert.equal(snapshots[0]?.recallSource, "walrus");
    assert.equal(snapshots[0]?.walrusBlobId, "blob-1");
  });
});

describe("parseRecalledMemorySnapshots", () => {
  it("parses stored snapshot JSON", () => {
    const parsed = parseRecalledMemorySnapshots([
      {
        id: "m1",
        textExcerpt: "Brazil pick",
        recallSource: "walrus",
      },
    ]);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]?.textExcerpt, "Brazil pick");
  });

  it("returns empty for invalid input", () => {
    assert.deepEqual(parseRecalledMemorySnapshots(null), []);
  });
});
