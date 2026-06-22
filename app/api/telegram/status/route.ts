import { NextResponse } from "next/server";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { getTelegramBotUsername } from "@/lib/env";
import { findChatByUserId } from "@/lib/telegram/link-account";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const chat = await findChatByUserId(userId);

    return NextResponse.json({
      linked: Boolean(chat),
      notificationsEnabled: chat?.notificationsEnabled ?? false,
      botConfigured: Boolean(getTelegramBotUsername()),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/telegram/status", error);
    return NextResponse.json(
      { error: "Failed to load Telegram status" },
      { status: 500 },
    );
  }
}
