import { NextResponse } from "next/server";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import { JUDGE_DEMO_MATCH_ID } from "@/lib/judge-demo/constants";
import { getJudgeDemoUserId } from "@/lib/judge-demo/demo-user";
import { getMatchDataAdapter } from "@/lib/match-data";

export async function GET() {
  const userId = await getJudgeDemoUserId();
  if (!userId) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  const [match, human, cloneResult] = await Promise.all([
    getMatchDataAdapter().getMatch(JUDGE_DEMO_MATCH_ID),
    getUserPredictionForMatch(userId, JUDGE_DEMO_MATCH_ID),
    getClonePredictionForMatch(userId, JUDGE_DEMO_MATCH_ID),
  ]);

  if (!match?.homeTeam || !match.awayTeam) {
    return NextResponse.json({ error: "Match not available" }, { status: 404 });
  }

  return NextResponse.json({
    matchId: JUDGE_DEMO_MATCH_ID,
    matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    human,
    clone: cloneResult?.clone ?? null,
    trainingQuestion: cloneResult?.trainingQuestion ?? null,
  });
}
