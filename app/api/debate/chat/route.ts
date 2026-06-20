import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { generateDebateReply } from "@/lib/debate/chat";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  recentMessages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "clone"]),
        text: z.string(),
        timestamp: z.string(),
      }),
    )
    .max(12)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());
    const generated = await generateDebateReply(me.id, {
      userMessage: body.message,
      recentMessages: body.recentMessages ?? [],
    });

    return NextResponse.json({
      reply: {
        id: `clone-${Date.now()}`,
        role: "clone" as const,
        text: generated.text,
        citedReceipts: generated.citedReceipts,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    console.error("POST /api/debate/chat", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}
