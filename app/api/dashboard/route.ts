import { NextResponse } from "next/server";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { buildDashboard } from "@/lib/dashboard/build-dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const dashboard = await buildDashboard(userId);
    if (!dashboard) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(dashboard);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/dashboard", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
