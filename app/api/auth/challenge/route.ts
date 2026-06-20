import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWalletChallenge,
  normalizeWalletAddress,
} from "@/lib/auth/wallet-challenge";

const bodySchema = z.object({
  walletAddress: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const walletAddress = normalizeWalletAddress(body.walletAddress);
    const challenge = await createWalletChallenge(walletAddress);
    return NextResponse.json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to create challenge";
    const status = message.includes("Invalid Sui") ? 400 : 500;
    console.error("POST /api/auth/challenge", error);
    return NextResponse.json({ error: message }, { status });
  }
}
