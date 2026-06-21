import type { ClonePrediction } from "@/lib/mock/types";
import type { PredictionHistoryItem } from "@/lib/db/predictions";

const WINNER_WEIGHT = 0.7;
const SCORELINE_WEIGHT = 0.3;
const MAX_SCORE_DELTA = 4;

/**
 * Alignment between a human pick and clone pick on a 0–100 scale.
 * Winner match dominates; scoreline contributes partial credit when winners agree.
 */
export function computePredictionAlignment(
  human: Pick<
    PredictionHistoryItem["prediction"],
    "winner" | "homeScore" | "awayScore"
  >,
  clone: Pick<ClonePrediction, "winner" | "homeScore" | "awayScore">,
): number {
  const winnerMatch = human.winner === clone.winner ? 1 : 0;
  const scoreDelta =
    Math.abs(human.homeScore - clone.homeScore) +
    Math.abs(human.awayScore - clone.awayScore);
  const scoreLineScore = winnerMatch
    ? Math.max(0, 1 - scoreDelta / MAX_SCORE_DELTA)
    : 0;
  return Math.round((winnerMatch * WINNER_WEIGHT + scoreLineScore * SCORELINE_WEIGHT) * 100);
}

export function averagePredictionAlignment(
  pairs: Array<{
    human: Pick<
      PredictionHistoryItem["prediction"],
      "winner" | "homeScore" | "awayScore"
    >;
    clone: Pick<ClonePrediction, "winner" | "homeScore" | "awayScore">;
  }>,
): number {
  if (pairs.length === 0) return 0;
  const total = pairs.reduce(
    (sum, pair) => sum + computePredictionAlignment(pair.human, pair.clone),
    0,
  );
  return Math.round(total / pairs.length);
}
