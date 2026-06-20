import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { normalizeWalletAddress } from "@/lib/auth/wallet-address";
import { requireAuthSecret } from "@/lib/env";

export { normalizeWalletAddress, walletAddressesMatch } from "@/lib/auth/wallet-address";

export const WALLET_AUTH_PURPOSE = "hoolclone-wallet-auth";
const CHALLENGE_MAX_AGE_SECONDS = 60 * 5;

export type WalletChallengePayload = {
  walletAddress: string;
  nonce: string;
  purpose: string;
};

function getSecretKey() {
  return new TextEncoder().encode(requireAuthSecret());
}

export function buildWalletAuthMessage(
  walletAddress: string,
  nonce: string,
): string {
  return `Sign in to HoolClone

Wallet: ${walletAddress}
Nonce: ${nonce}

This request will not trigger a blockchain transaction.`;
}

export async function createWalletChallenge(walletAddress: string): Promise<{
  message: string;
  challengeToken: string;
  expiresIn: number;
}> {
  const normalized = normalizeWalletAddress(walletAddress);
  const nonce = randomBytes(16).toString("hex");
  const message = buildWalletAuthMessage(normalized, nonce);

  const challengeToken = await new SignJWT({
    walletAddress: normalized,
    nonce,
    purpose: WALLET_AUTH_PURPOSE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  return {
    message,
    challengeToken,
    expiresIn: CHALLENGE_MAX_AGE_SECONDS,
  };
}

export async function verifyWalletChallengeToken(
  token: string,
): Promise<WalletChallengePayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  const walletAddress = payload.walletAddress;
  const nonce = payload.nonce;
  const purpose = payload.purpose;

  if (
    typeof walletAddress !== "string" ||
    typeof nonce !== "string" ||
    purpose !== WALLET_AUTH_PURPOSE
  ) {
    throw new Error("Invalid challenge token");
  }

  return {
    walletAddress: normalizeWalletAddress(walletAddress),
    nonce,
    purpose,
  };
}
