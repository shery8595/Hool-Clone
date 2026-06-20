import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/bot";
import { getTelegramBotToken } from "@/lib/env";

export async function POST(request: Request) {
  if (!getTelegramBotToken()) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 503 });
  }

  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/telegram/webhook", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
