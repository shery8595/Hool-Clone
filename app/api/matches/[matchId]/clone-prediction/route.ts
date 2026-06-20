import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { generateClonePrediction } from "@/lib/clone/generate-clone-prediction";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import { getMatchDataAdapter } from "@/lib/match-data";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const me = await requireUser();
    const { matchId } = await context.params;
    const result = await getClonePredictionForMatch(me.id, matchId);

    if (!result) {
      return NextResponse.json({ clone: null, trainingQuestion: null });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/matches/[matchId]/clone-prediction", error);
    return NextResponse.json(
      { error: "Failed to load clone prediction" },
      { status: 500 },
    );
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const me = await requireUser();
    const { matchId } = await context.params;

    const match = await getMatchDataAdapter().getMatch(matchId);
    if (!match?.homeTeam || !match.awayTeam) {
      return NextResponse.json(
        { error: "Match not available for clone prediction" },
        { status: 400 },
      );
    }

    const humanPrediction = await getUserPredictionForMatch(me.id, matchId);
    if (!humanPrediction) {
      return NextResponse.json(
        { error: "Submit your prediction before generating the clone" },
        { status: 400 },
      );
    }

    const result = await generateClonePrediction(me.id, matchId);
    const prediction = await getUserPredictionForMatch(me.id, matchId);

    return NextResponse.json({
      ...result,
      prediction,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/matches/[matchId]/clone-prediction", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate clone prediction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
