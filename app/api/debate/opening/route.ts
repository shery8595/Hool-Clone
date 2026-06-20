import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { generateDebateOpening } from "@/lib/debate/chat";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    const { searchParams } = new URL(request.url);
    const variantParam = searchParams.get("variant");
    const parsed =
      variantParam !== null && variantParam !== ""
        ? Number(variantParam)
        : 0;
    const variantIndex = Number.isFinite(parsed)
      ? Math.max(0, Math.floor(parsed))
      : 0;
    const opening = await generateDebateOpening(me.id, { variantIndex });
    return NextResponse.json({
      message: {
        id: "opening",
        role: "clone" as const,
        text: opening.text,
        citedReceipts: opening.citedReceipts,
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
    console.error("GET /api/debate/opening", error);
    return NextResponse.json(
      { error: "Failed to load debate opening" },
      { status: 500 },
    );
  }
}
