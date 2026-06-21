import { NextResponse } from "next/server";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { getTelegramBotUsername } from "@/lib/env";
import {
  buildTelegramDeepLink,
  createTelegramLinkToken,
} from "@/lib/telegram/link-token";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = await requireUserId();
    const botUsername = getTelegramBotUsername();

    if (!botUsername) {
      return NextResponse.json(
        { error: "Telegram bot is not configured" },
        { status: 503 },
      );
    }

    const { token, expiresIn } = await createTelegramLinkToken(userId);
    const url = buildTelegramDeepLink(botUsername, token);

    return NextResponse.json({ url, expiresIn });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/telegram/link-token", error);
    return NextResponse.json(
      { error: "Failed to create Telegram link" },
      { status: 500 },
    );
  }
}
