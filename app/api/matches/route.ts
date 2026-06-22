import { NextResponse } from "next/server";
import { getMatchDataAdapter } from "@/lib/match-data";
import { maybeSyncMatchResultsOnRead } from "@/lib/match-data/match-sync-on-read";
import { resolveMatches } from "@/lib/match-data/match-status";

export async function GET() {
  try {
    await maybeSyncMatchResultsOnRead();
    const adapter = getMatchDataAdapter();
    const matches = resolveMatches(await adapter.listMatches());
    return NextResponse.json({ matches, count: matches.length });
  } catch (error) {
    console.error("GET /api/matches", error);
    const message =
      error instanceof Error ? error.message : "Failed to load matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
