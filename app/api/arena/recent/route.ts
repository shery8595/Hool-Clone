import { NextResponse } from "next/server";
import { listRecentBouts } from "@/lib/db/clash-bouts";

export async function GET() {
  try {
    const bouts = await listRecentBouts(8);
    return NextResponse.json({ bouts });
  } catch (error) {
    console.error("GET /api/arena/recent", error);
    return NextResponse.json(
      { error: "Failed to load recent arena bouts" },
      { status: 500 },
    );
  }
}
