import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { rememberPredictionSubmission } from "@/lib/clone/remember-prediction";
import {
  getUserPredictionForMatch,
  upsertPrediction,
} from "@/lib/db/predictions";
import { getMatchDataAdapter } from "@/lib/match-data";
type RouteContext = { params: Promise<{ matchId: string }> };

const bodySchema = z.object({
  winner: z.string().min(1),
  homeScore: z.number().int().min(0).max(9),
  awayScore: z.number().int().min(0).max(9),
  confidence: z.number().int().min(1).max(100),
  reasoning: z.string().max(500).optional(),
  emotion: z.enum(["calm", "nervous", "hyped"]).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const me = await requireUser();
    const { matchId } = await context.params;
    const prediction = await getUserPredictionForMatch(me.id, matchId);
    return NextResponse.json({ prediction });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/matches/[matchId]/prediction", error);
    return NextResponse.json(
      { error: "Failed to load prediction" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const me = await requireUser();
    const { matchId } = await context.params;
    const body = bodySchema.parse(await request.json());

    const match = await getMatchDataAdapter().getMatch(matchId);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    if (!match.homeTeam || !match.awayTeam) {
      return NextResponse.json(
        { error: "Cannot predict until both teams are known" },
        { status: 400 },
      );
    }

    const validCodes = [match.homeTeam.code, match.awayTeam.code];
    if (!validCodes.includes(body.winner)) {
      return NextResponse.json({ error: "Invalid winner" }, { status: 400 });
    }

    const prediction = await upsertPrediction(me.id, matchId, body);

    try {
      await rememberPredictionSubmission(me.id, match, {
        winner: body.winner,
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        confidence: body.confidence,
        reasoning: body.reasoning,
        emotion: body.emotion,
      });
    } catch (memoryError) {
      console.error(
        "POST /api/matches/[matchId]/prediction memory write",
        memoryError,
      );
    }

    return NextResponse.json({ prediction });  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid prediction" }, { status: 400 });
    }
    console.error("POST /api/matches/[matchId]/prediction", error);
    return NextResponse.json(
      { error: "Failed to save prediction" },
      { status: 500 },
    );
  }
}
