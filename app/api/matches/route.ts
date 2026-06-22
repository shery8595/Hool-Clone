import { NextResponse } from "next/server";
import { getOptionalUserId } from "@/lib/auth/require-user";
import { listUserPredictedMatchExternalIds } from "@/lib/db/predictions";
import { getMatchDataAdapter } from "@/lib/match-data";
import { maybeSyncMatchResultsOnRead } from "@/lib/match-data/match-sync-on-read";
import { resolveMatches } from "@/lib/match-data/match-status";

export async function GET() {
  try {
    await maybeSyncMatchResultsOnRead();
    const adapter = getMatchDataAdapter();
    const matches = resolveMatches(await adapter.listMatches());

    const userId = await getOptionalUserId();
    const predictedMatchIds = userId
      ? await listUserPredictedMatchExternalIds(userId)
      : [];

    return NextResponse.json({
      matches,
      count: matches.length,
      predictedMatchIds,
    });
  } catch (error) {
    console.error("GET /api/matches", error);
    const message =
      error instanceof Error ? error.message : "Failed to load matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
