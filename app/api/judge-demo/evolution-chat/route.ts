import { NextResponse } from "next/server";
import { z } from "zod";
import { generateEvolutionPhaseReply } from "@/lib/evolution/generate-evolution-chat-reply";
import { getJudgeDemoUserId } from "@/lib/judge-demo/demo-user";
import { checkRateLimit, clientIp } from "@/lib/judge-demo/rate-limit";

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

const RATE_MAX = 40;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(
    `judge-demo:evolution-chat:${ip}`,
    RATE_MAX,
    RATE_WINDOW_MS,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  const userId = await getJudgeDemoUserId();
  if (!userId) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const generated = await generateEvolutionPhaseReply(userId, {
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
        source: generated.memoryCount === 0 ? "rule-based" : "gemini-or-fallback",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    console.error("POST /api/judge-demo/evolution-chat", error);
    return NextResponse.json(
      { error: "Failed to generate evolution reply" },
      { status: 500 },
    );
  }
}
