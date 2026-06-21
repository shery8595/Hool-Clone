import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  storedMemoriesToReceipts,
  storedMemoryToReceipt,
} from "@/lib/api/memory-mapper";
import type { StoredMemory } from "@/lib/memory/memory-adapter";

function stored(overrides: Partial<StoredMemory> & Pick<StoredMemory, "id" | "text">): StoredMemory {
  return {
    type: "fan_profile",
    metadata: {},
    storageStatus: "stored",
    publicVisible: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("storedMemoryToReceipt", () => {
  it("maps walrus-backed memory with provenance", () => {
    const receipt = storedMemoryToReceipt(
      stored({
        id: "m1",
        text: "Brazil loyalty",
        metadata: {
          source: "onboarding",
          walrusBlobId: "abc123realblob",
          backendSource: "walrus",
        },
      }),
      0,
    );
    assert.equal(receipt.number, 1);
    assert.equal(receipt.recallSource, "walrus");
    assert.equal(receipt.walrusBlobId, "abc123realblob");
    assert.ok(receipt.provenanceLabel?.includes("Onboarding"));
  });

  it("maps correction memories as remembered type", () => {
    const receipt = storedMemoryToReceipt(
      stored({
        id: "c1",
        text: "Correction text",
        type: "correction",
        metadata: { source: "debate" },
      }),
      1,
    );
    assert.equal(receipt.type, "remembered");
    assert.equal(receipt.memorySource, "debate");
  });
});

describe("storedMemoriesToReceipts", () => {
  it("numbers receipts sequentially", () => {
    const receipts = storedMemoriesToReceipts([
      stored({ id: "a", text: "one" }),
      stored({ id: "b", text: "two" }),
    ]);
    assert.equal(receipts[0]?.number, 1);
    assert.equal(receipts[1]?.number, 2);
  });

  it("includes lineage steps when context exists", () => {
    const receipts = storedMemoriesToReceipts([
      stored({
        id: "a",
        text: "onboarding fact",
        metadata: { source: "onboarding", questionId: "favorite_team" },
      }),
    ]);
    assert.ok(receipts[0]?.lineage?.length);
  });
});
