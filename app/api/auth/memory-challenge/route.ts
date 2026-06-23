import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { getSession } from "@/lib/auth/session";
import {
  createMemoryUnlockChallenge,
  normalizeWalletAddress,
  walletAddressesMatch,
} from "@/lib/auth/wallet-challenge";

const bodySchema = z.object({
  walletAddress: z.string().min(3).optional(),
});

export async function POST(request: Request) {
  try {
    await requireUserId();
    const session = await getSession();
    if (!session?.walletAddress) {
      return NextResponse.json(
        { error: "Wallet session required" },
        { status: 401 },
      );
    }

    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const walletAddress = normalizeWalletAddress(
      body.walletAddress ?? session.walletAddress,
    );

    if (!walletAddressesMatch(walletAddress, session.walletAddress)) {
      return NextResponse.json(
        { error: "Wallet does not match session" },
        { status: 403 },
      );
    }

    const challenge = await createMemoryUnlockChallenge(walletAddress);
    return NextResponse.json(challenge);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("POST /api/auth/memory-challenge", error);
    return NextResponse.json(
      { error: "Failed to create memory unlock challenge" },
      { status: 500 },
    );
  }
}
