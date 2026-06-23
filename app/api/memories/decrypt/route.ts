import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { getSession } from "@/lib/auth/session";
import {
  buildMemoryUnlockMessage,
  verifyMemoryUnlockChallengeToken,
  walletAddressesMatch,
} from "@/lib/auth/wallet-challenge";
import { verifyWalletPersonalMessage } from "@/lib/auth/verify-wallet-signature";
import { decryptMemoryForUser } from "@/lib/crypto/memory-crypto";
import { getMemoryRowById } from "@/lib/memory/postgres-memory";

const bodySchema = z.object({
  challengeToken: z.string().min(1),
  signature: z.string().min(1),
  memoryIds: z.array(z.string().uuid()).min(1).max(20),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const session = await getSession();
    if (!session?.walletAddress) {
      return NextResponse.json(
        { error: "Wallet session required" },
        { status: 401 },
      );
    }

    const body = bodySchema.parse(await request.json());
    const challenge = await verifyMemoryUnlockChallengeToken(body.challengeToken);

    if (!walletAddressesMatch(challenge.walletAddress, session.walletAddress)) {
      return NextResponse.json(
        { error: "Challenge wallet does not match session" },
        { status: 403 },
      );
    }

    const message = buildMemoryUnlockMessage(
      challenge.walletAddress,
      challenge.nonce,
    );

    await verifyWalletPersonalMessage({
      message,
      signature: body.signature,
      walletAddress: challenge.walletAddress,
    });

    const decrypted: Record<string, string> = {};

    for (const memoryId of body.memoryIds) {
      const row = await getMemoryRowById(memoryId, userId);
      if (!row || row.metadata?.encrypted !== true) continue;

      const ciphertext =
        typeof row.metadata.ciphertext === "string"
          ? row.metadata.ciphertext
          : null;
      const nonce =
        typeof row.metadata.encryptionNonce === "string"
          ? row.metadata.encryptionNonce
          : null;

      if (!ciphertext || !nonce) continue;

      decrypted[memoryId] = await decryptMemoryForUser(
        userId,
        ciphertext,
        nonce,
      );
    }

    return NextResponse.json({ decrypted });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Decrypt failed";
    const isAuthError =
      message.includes("signature") ||
      message.includes("challenge") ||
      message.includes("Invalid");
    console.error("POST /api/memories/decrypt", error);
    return NextResponse.json(
      { error: isAuthError ? "Invalid or expired wallet signature" : message },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
