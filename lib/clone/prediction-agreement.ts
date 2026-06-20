import type { ClonePrediction, Prediction } from "@/lib/mock/types";

export function predictionsAgree(
  human: Pick<Prediction, "winner" | "homeScore" | "awayScore">,
  clone: Pick<ClonePrediction, "winner" | "homeScore" | "awayScore">,
): boolean {
  return (
    human.winner === clone.winner &&
    human.homeScore === clone.homeScore &&
    human.awayScore === clone.awayScore
  );
}
