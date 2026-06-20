import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { storeDebateCorrection } from "@/lib/debate/store-debate-correction";
import { isUuid } from "@/lib/utils";

const bodySchema = z.object({
  correction: z.string().trim().min(8).max(500),
  wrongMemoryId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());
    const wrongMemoryId = isUuid(body.wrongMemoryId)
      ? body.wrongMemoryId
      : undefined;
    const result = await storeDebateCorrection(me.id, {
      correctionText: body.correction,
      wrongMemoryId,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid correction" }, { status: 400 });
    }
    console.error("POST /api/debate/correction", error);
    const message =
      error instanceof Error ? error.message : "Failed to store correction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
