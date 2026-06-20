import { NextResponse } from "next/server";
import { getMatchDataAdapter } from "@/lib/match-data";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { matchId } = await context.params;
    const adapter = getMatchDataAdapter();
    const match = await adapter.getMatch(matchId);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("GET /api/matches/[matchId]", error);
    return NextResponse.json({ error: "Failed to load match" }, { status: 500 });
  }
}
