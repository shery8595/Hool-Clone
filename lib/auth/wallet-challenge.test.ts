import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import {
  buildWalletAuthMessage,
  createWalletChallenge,
  verifyWalletChallengeToken,
} from "@/lib/auth/wallet-challenge";

const TEST_WALLET =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("wallet challenge", () => {
  before(() => {
    process.env.AUTH_SECRET = "test-secret-min-16-chars";
  });

  it("builds deterministic auth message", () => {
    const message = buildWalletAuthMessage(TEST_WALLET, "nonce123");
    assert.ok(message.includes(TEST_WALLET));
    assert.ok(message.includes("nonce123"));
    assert.ok(message.includes("HoolClone"));
  });

  it("round-trips challenge token", async () => {
    const { challengeToken, message } = await createWalletChallenge(TEST_WALLET);
    assert.ok(message.length > 0);
    const payload = await verifyWalletChallengeToken(challengeToken);
    assert.equal(payload.walletAddress, TEST_WALLET);
    assert.ok(payload.nonce.length > 0);
  });

  it("rejects tampered token", async () => {
    const { challengeToken } = await createWalletChallenge(TEST_WALLET);
    await assert.rejects(() =>
      verifyWalletChallengeToken(`${challengeToken}x`),
    );
  });
});
