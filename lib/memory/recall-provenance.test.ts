import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { recallSourceFromMetadata } from "@/lib/memory/recall-provenance";

describe("recallSourceFromMetadata", () => {
  it("reads backendSource walrus", () => {
    assert.equal(
      recallSourceFromMetadata({ backendSource: "walrus" }),
      "walrus",
    );
  });

  it("infers walrus from walrusBlobId", () => {
    assert.equal(
      recallSourceFromMetadata({ walrusBlobId: "abc123" }),
      "walrus",
    );
  });

  it("reads postgres fallback backend", () => {
    assert.equal(
      recallSourceFromMetadata({ backendSource: "postgres_fallback" }),
      "postgres_fallback",
    );
  });
});
