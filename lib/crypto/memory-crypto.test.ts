import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decryptMemoryForUser,
  encryptMemoryForUser,
} from "@/lib/crypto/memory-crypto";
import { buildEncryptedWalrusPayload, parseEncryptedEnvelope } from "@/lib/crypto/walrus-envelope";

describe("memory-crypto", () => {
  it("round-trips encrypt and decrypt", async () => {
    process.env.AUTH_SECRET ??= "test-auth-secret-for-crypto";
    const userId = "00000000-0000-0000-0000-000000000001";
    const plaintext = "Brazil 2014 broke me — still not over it.";

    const encrypted = await encryptMemoryForUser(userId, plaintext);
    const decrypted = await decryptMemoryForUser(
      userId,
      encrypted.ciphertextB64,
      encrypted.nonceB64,
    );

    assert.equal(decrypted, plaintext);
  });
});

describe("walrus-envelope", () => {
  it("builds and parses encrypted payload", () => {
    const payload = buildEncryptedWalrusPayload(
      {
        type: "emotional_memory",
        text: "abstract surrogate",
        metadata: { source: "onboarding", team: "Brazil" },
      },
      {
        searchText: "World Cup heartbreak emotional bias",
        ciphertextB64: "abc123",
        nonceB64: "nonce456",
      },
    );

    assert.ok(payload.includes('search:"World Cup heartbreak emotional bias"'));
    assert.ok(payload.includes("enc:v1:abc123:nonce456"));

    const parsed = parseEncryptedEnvelope(payload);
    assert.equal(parsed.searchText, "World Cup heartbreak emotional bias");
    assert.equal(parsed.ciphertextB64, "abc123");
    assert.equal(parsed.nonceB64, "nonce456");
  });
});
