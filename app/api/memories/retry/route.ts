import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { getMemoryBackendLabel, retryFailedMemory } from "@/lib/memory";

const bodySchema = z.object({
  memoryId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());
    const result = await retryFailedMemory(me.id, body.memoryId);

    return NextResponse.json({
      status: result.status,
      backend: getMemoryBackendLabel(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("POST /api/memories/retry", error);
    const message =
      error instanceof Error ? error.message : "Failed to retry memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
