import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import {
  buildWalletAuthMessage,
  normalizeWalletAddress,
  verifyWalletChallengeToken,
  walletAddressesMatch,
} from "@/lib/auth/wallet-challenge";
import { verifyWalletPersonalMessage } from "@/lib/auth/verify-wallet-signature";
import { buildMeResponse, findOrCreateUserByWallet } from "@/lib/db/users";

const bodySchema = z.object({
  walletAddress: z.string().min(3),
  challengeToken: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const walletAddress = normalizeWalletAddress(body.walletAddress);
    const challenge = await verifyWalletChallengeToken(body.challengeToken);

    if (!walletAddressesMatch(challenge.walletAddress, walletAddress)) {
      return NextResponse.json(
        { error: "Challenge wallet does not match" },
        { status: 401 },
      );
    }

    const message = buildWalletAuthMessage(
      challenge.walletAddress,
      challenge.nonce,
    );

    await verifyWalletPersonalMessage({
      message,
      signature: body.signature,
      walletAddress: challenge.walletAddress,
    });

    const user = await findOrCreateUserByWallet(challenge.walletAddress);
    const token = await createSessionToken({
      userId: user.id,
      walletAddress: challenge.walletAddress,
    });

    const me = await buildMeResponse(user.id);
    if (!me) {
      return NextResponse.json({ error: "User not found" }, { status: 500 });
    }

    const response = NextResponse.json(me);
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("POST /api/auth/wallet", error);
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    const isAuthError =
      message.includes("signature") ||
      message.includes("challenge") ||
      message.includes("Invalid") ||
      message.includes("expired");
    return NextResponse.json(
      { error: isAuthError ? "Invalid or expired wallet signature" : message },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
