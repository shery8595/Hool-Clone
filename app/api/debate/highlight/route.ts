import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { storeDebateHighlight } from "@/lib/debate/store-debate-highlight";

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "clone"]),
  text: z.string(),
  timestamp: z.string(),
  citedReceipts: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .optional(),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(2).max(24),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());
    const stored = await storeDebateHighlight(me.id, body.messages);

    if (!stored) {
      return NextResponse.json({ saved: false });
    }

    return NextResponse.json({
      saved: true,
      memoryId: stored.id,
      status: stored.status,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/debate/highlight", error);
    return NextResponse.json(
      { error: "Failed to save debate highlight" },
      { status: 500 },
    );
  }
}
