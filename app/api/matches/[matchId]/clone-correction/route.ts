import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { storeCloneCorrection } from "@/lib/clone/store-clone-correction";
import { isUuid } from "@/lib/utils";

type RouteContext = { params: Promise<{ matchId: string }> };

const bodySchema = z.object({
  correction: z.string().trim().min(8).max(500),
  wrongMemoryId: z.string().optional(),
  regenerate: z.boolean().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const me = await requireUser();
    const { matchId } = await context.params;
    const body = bodySchema.parse(await request.json());
    const wrongMemoryId = isUuid(body.wrongMemoryId)
      ? body.wrongMemoryId
      : undefined;

    const result = await storeCloneCorrection(me.id, matchId, {
      correctionText: body.correction,
      wrongMemoryId,
      regenerate: body.regenerate,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      const message =
        error.issues[0]?.message === "String must contain at least 8 character(s)"
          ? "Correction must be at least 8 characters."
          : (error.issues[0]?.message ?? "Invalid correction");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("POST /api/matches/[matchId]/clone-correction", error);
    const message =
      error instanceof Error ? error.message : "Failed to store correction";
    const status = message.includes("before") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
