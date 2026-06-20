import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import type { Match, Prediction } from "@/lib/mock/types";

export function buildCloneInsight(input: {
  human: Prediction | null;
  cloneWinner: string;
  cloneHomeScore: number;
  cloneAwayScore: number;
  match: Match;
  rivalTeam?: string | null;
}): string | undefined {
  const { human, match, rivalTeam } = input;
  if (!human || !match.homeTeam || !match.awayTeam) return undefined;

  const clonePick = {
    winner: input.cloneWinner,
    homeScore: input.cloneHomeScore,
    awayScore: input.cloneAwayScore,
  };

  if (predictionsAgree(human, clonePick)) return undefined;

  const rival = rivalTeam?.toLowerCase() ?? "";
  const homeName = match.homeTeam.name.toLowerCase();
  const awayName = match.awayTeam.name.toLowerCase();
  const humanBackedRival =
    rival &&
    (human.winner === match.homeTeam.code
      ? homeName.includes(rival)
      : awayName.includes(rival));

  if (humanBackedRival && !predictionsAgree(human, clonePick)) {
    return `Your clone thinks you are going against your usual distrust of ${rivalTeam}.`;
  }

  return "Your clone read your long-term biases differently than this specific pick.";
}
