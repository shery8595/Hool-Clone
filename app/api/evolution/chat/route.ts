import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { generateEvolutionPhaseReply } from "@/lib/evolution/generate-evolution-chat-reply";

const bodySchema = z.object({
  phaseId: z.enum(["day1", "day3", "day4", "day7"]),
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
    .max(24)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());
    const generated = await generateEvolutionPhaseReply(me.id, {
      phaseId: body.phaseId,
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
      meta: {
        memoryCount: generated.memoryCount,
        maturityLabel: generated.maturityLabel,
        phaseLabel: generated.phaseLabel,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    console.error("POST /api/evolution/chat", error);
    return NextResponse.json(
      { error: "Failed to generate evolution reply" },
      { status: 500 },
    );
  }
}
