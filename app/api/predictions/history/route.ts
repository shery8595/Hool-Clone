import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { listUserPredictions } from "@/lib/db/predictions";

export async function GET() {
  try {
    const me = await requireUser();
    const history = await listUserPredictions(me.id);
    return NextResponse.json({ history, count: history.length });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/predictions/history", error);
    return NextResponse.json(
      { error: "Failed to load prediction history" },
      { status: 500 },
    );
  }
}
