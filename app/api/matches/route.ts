import { NextResponse } from "next/server";
import { getMatchDataAdapter } from "@/lib/match-data";

export async function GET() {
  try {
    const adapter = getMatchDataAdapter();
    const matches = await adapter.listMatches();
    return NextResponse.json({ matches, count: matches.length });
  } catch (error) {
    console.error("GET /api/matches", error);
    const message =
      error instanceof Error ? error.message : "Failed to load matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
