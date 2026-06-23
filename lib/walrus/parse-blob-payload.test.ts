import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseBlobPayload,
  tokenizeBlobPayload,
} from "@/lib/walrus/parse-blob-payload";

describe("parseBlobPayload", () => {
  it("parses type, text, and tags", () => {
    const parsed = parseBlobPayload(
      "[fan_profile] Brazil loyalty matters source:onboarding driver:loyalty",
    );
    assert.equal(parsed.type, "fan_profile");
    assert.ok(parsed.text.includes("Brazil loyalty"));
    assert.equal(parsed.tags.source, "onboarding");
    assert.equal(parsed.tags.driver, "loyalty");
  });

  it("handles empty payload", () => {
    const parsed = parseBlobPayload("");
    assert.equal(parsed.type, "unknown");
    assert.equal(parsed.text, "");
  });

  it("parses payload without type bracket", () => {
    const parsed = parseBlobPayload("Plain memory text matchId:m071");
    assert.equal(parsed.tags.matchid, "m071");
    assert.ok(parsed.text.includes("Plain memory"));
  });
});

describe("tokenizeBlobPayload", () => {
  it("parses encrypted envelope", () => {
    const parsed = parseBlobPayload(
      '[emotional_memory] search:"World Cup heartbreak bias" enc:v1:abc123:nonce456 source:onboarding team:Brazil',
    );
    assert.equal(parsed.type, "emotional_memory");
    assert.equal(parsed.text, "World Cup heartbreak bias");
    assert.equal(parsed.encrypted?.ciphertextB64, "abc123");
    assert.equal(parsed.tags.source, "onboarding");
  });

  it("tokenizes parsed payload for display", () => {
    const tokens = tokenizeBlobPayload("[bias] Skeptical of England");
    assert.ok(tokens.some((t) => t.kind === "type" && t.value === "bias"));
    assert.ok(tokens.some((t) => t.kind === "text"));
  });
});
