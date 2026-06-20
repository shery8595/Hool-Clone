import {
  computeMaturityProgress,
  memoryCountToMaturity,
  MATURITY_LABELS,
} from "@/lib/auth/maturity";

export { computeMaturityProgress };
import {
  listClonePredictionsForUser,
  type ClonePredictionEntry,
} from "@/lib/db/clone-predictions";
import {
  listUserPredictions,
  type PredictionHistoryItem,
} from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import type {
  CloneMaturity,
  EvolutionEvent,
  Match,
  Prediction,
  PredictionComparison,
  Team,
} from "@/lib/mock/types";

export {
  buildBiasRadar,
  extractMemoryDrivers,
  hasBiasRadarData,
} from "@/lib/stats/bias-radar";

export function buildEvolutionTimeline(input: {
  joinedAt: Date;
  memoriesCount: number;
}): EvolutionEvent[] {
  const { label } = memoryCountToMaturity(input.memoriesCount);
  const currentLevel = MATURITY_LABELS.indexOf(label);
  const daysSinceJoin = Math.max(
    1,
    Math.ceil((Date.now() - input.joinedAt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const milestones: Array<{
    level: number;
    title: CloneMaturity;
    description: string;
    icon: EvolutionEvent["icon"];
  }> = [
    {
      level: 0,
      title: "Stranger",
      description: "No memories yet — the clone is guessing.",
      icon: "user",
    },
    {
      level: 1,
      title: "Learner",
      description: "Training answers are shaping early instincts.",
      icon: "user",
    },
    {
      level: 2,
      title: "Imitator",
      description: "Enough memories to mimic your football brain.",
      icon: "brain",
    },
    {
      level: 3,
      title: "Contradiction Hunter",
      description: "The clone spots when you contradict your biases.",
      icon: "target",
    },
    {
      level: 4,
      title: "Full HoolClone",
      description: "A deep memory bank powers confident clone takes.",
      icon: "target",
    },
  ];

  return milestones
    .filter((m) => m.level <= currentLevel)
    .map((m, index) => ({
      day: Math.max(1, Math.round((daysSinceJoin * (index + 1)) / (currentLevel + 1))),
      title: m.title,
      description: m.description,
      icon: m.icon,
    }));
}

function formatScoreLine(
  winner: string,
  homeScore: number,
  awayScore: number,
  home: Team,
  away: Team,
): string {
  const winnerName = winner === home.code ? home.name : away.name;
  return `${homeScore} - ${awayScore} ${winnerName}`;
}

export function buildPredictionComparisonsFromHistory(
  history: PredictionHistoryItem[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
  limit = 8,
): PredictionComparison[] {
  const comparisons: PredictionComparison[] = [];

  for (const item of history.slice(0, limit)) {
    const { match, prediction } = item;
    if (!match.homeTeam || !match.awayTeam) continue;

    const cloneEntry = cloneByMatchId.get(match.id);
    const userLine = formatScoreLine(
      prediction.winner,
      prediction.homeScore,
      prediction.awayScore,
      match.homeTeam,
      match.awayTeam,
    );

    if (!cloneEntry) {
      comparisons.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        userPrediction: userLine,
        clonePrediction: "—",
        agreed: false,
      });
      continue;
    }

    const clone = cloneEntry.clone;
    comparisons.push({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      userPrediction: userLine,
      clonePrediction: formatScoreLine(
        clone.winner,
        clone.homeScore,
        clone.awayScore,
        match.homeTeam,
        match.awayTeam,
      ),
      agreed: predictionsAgree(prediction, clone),
    });
  }

  return comparisons;
}

export async function buildPredictionComparisons(
  userId: string,
  limit = 8,
): Promise<PredictionComparison[]> {
  const [history, cloneByMatchId] = await Promise.all([
    listUserPredictions(userId),
    listClonePredictionsForUser(userId),
  ]);
  return buildPredictionComparisonsFromHistory(history, cloneByMatchId, limit);
}

export function computeCloneAgreementPercent(
  comparisons: PredictionComparison[],
): number {
  const withClone = comparisons.filter((c) => c.clonePrediction !== "—");
  if (withClone.length === 0) return 0;
  const agreed = withClone.filter((c) => c.agreed).length;
  return Math.round((agreed / withClone.length) * 100);
}

export function findLatestDisagreement(
  comparisons: PredictionComparison[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
): { text: string; label: string } | null {
  for (const comparison of comparisons) {
    if (comparison.agreed || comparison.clonePrediction === "—") continue;
    const cloneEntry = cloneByMatchId.get(comparison.matchId);
    return {
      text:
        cloneEntry?.insight ??
        cloneEntry?.reasoning ??
        cloneEntry?.clone.insight ??
        cloneEntry?.clone.reasoning ??
        `Clone picked ${comparison.clonePrediction} while you picked ${comparison.userPrediction}.`,
      label: `${comparison.homeTeam.name} vs ${comparison.awayTeam.name}`,
    };
  }
  return null;
}

export function findLatestComparison(
  history: PredictionHistoryItem[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
): { match: Match; prediction: Prediction } | null {
  for (const item of history) {
    const cloneEntry = cloneByMatchId.get(item.match.id);
    if (!cloneEntry || !item.match.homeTeam || !item.match.awayTeam) continue;

    return {
      match: item.match,
      prediction: {
        ...item.prediction,
        clone: cloneEntry.clone,
        agreed: predictionsAgree(item.prediction, cloneEntry.clone),
      },
    };
  }
  return null;
}
