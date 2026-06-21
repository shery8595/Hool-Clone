import type { CloneKnowledgeSnapshot } from "@/lib/clone/clone-knowledge-snapshot";
import { computeCloneMood, type CloneMood } from "@/lib/clone/clone-mood";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import { synthesizeHistoricalSnapshot } from "@/lib/clone/historical-snapshot";
import { averagePredictionAlignment } from "@/lib/clone/prediction-alignment";
import {
  computeConsistencyScore,
  detectTemporalContradictions,
  type TemporalContradiction,
} from "@/lib/clone/temporal-contradictions";
import type { ClonePredictionEntry } from "@/lib/db/clone-predictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import type { DriverChip, Match } from "@/lib/mock/types";

export type { CloneKnowledgeSnapshot } from "@/lib/clone/clone-knowledge-snapshot";
export { buildCloneKnowledgeSnapshot } from "@/lib/clone/clone-knowledge-snapshot";

export type DriftExampleComparison = {
  day: number;
  userPick: string;
  clonePick: string;
  difference: "large" | "small";
};

export type CloneDriftPoint = {
  day: number;
  resemblancePercent: number;
  sampleCount: number;
  lowData: boolean;
  example: DriftExampleComparison | null;
};

export type AccuracyLeaderboard = {
  userAccuracy: number;
  cloneAccuracy: number;
  resolvedCount: number;
  ready: boolean;
};

export type SeasonReportCard = {
  loyaltyScore: number;
  predictionAccuracy: number;
  contradictionCount: number;
  mostDefendedTeam: string | null;
  mostHatedTeam: string | null;
  verdict: string;
};

function predictionsUpToDay(
  history: PredictionHistoryItem[],
  joinedAt: Date,
  day: number,
): PredictionHistoryItem[] {
  const cutoff = joinedAt.getTime() + day * 24 * 60 * 60 * 1000;
  return history.filter((h) => new Date(h.savedAt).getTime() <= cutoff);
}

function formatPick(
  winner: string,
  homeScore: number,
  awayScore: number,
  match: Match,
): string {
  const home = match.homeTeam?.name ?? match.homeTeam?.code ?? "?";
  const away = match.awayTeam?.name ?? match.awayTeam?.code ?? "?";
  const winnerName =
    winner === match.homeTeam?.code
      ? home
      : winner === match.awayTeam?.code
        ? away
        : winner;
  return `${winnerName} ${homeScore}-${awayScore}`;
}

function pickDifference(
  human: PredictionHistoryItem["prediction"],
  clone: ClonePredictionEntry["clone"],
): "large" | "small" {
  if (human.winner !== clone.winner) return "large";
  const scoreDelta =
    Math.abs(human.homeScore - clone.homeScore) +
    Math.abs(human.awayScore - clone.awayScore);
  return scoreDelta >= 2 ? "large" : "small";
}

export function buildCloneDriftSeries(
  history: PredictionHistoryItem[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
  joinedAt: Date,
  maxDay = 4,
): CloneDriftPoint[] {
  const points: CloneDriftPoint[] = [];

  for (let day = 1; day <= maxDay; day++) {
    const dayHistory = predictionsUpToDay(history, joinedAt, day);
    const withClone = dayHistory.filter((h) => cloneByMatchId.has(h.match.id));

    const alignmentPairs = withClone.map((h) => ({
      human: h.prediction,
      clone: cloneByMatchId.get(h.match.id)!.clone,
    }));

    const resemblancePercent = averagePredictionAlignment(alignmentPairs);
    const sampleCount = withClone.length;
    const lowData = sampleCount < 2;

    let example: DriftExampleComparison | null = null;
    const sample = withClone[withClone.length - 1];
    if (sample) {
      const cloneEntry = cloneByMatchId.get(sample.match.id);
      if (cloneEntry && sample.match.homeTeam && sample.match.awayTeam) {
        example = {
          day,
          userPick: formatPick(
            sample.prediction.winner,
            sample.prediction.homeScore,
            sample.prediction.awayScore,
            sample.match,
          ),
          clonePick: formatPick(
            cloneEntry.clone.winner,
            cloneEntry.clone.homeScore,
            cloneEntry.clone.awayScore,
            sample.match,
          ),
          difference: pickDifference(sample.prediction, cloneEntry.clone),
        };
      }
    }

    points.push({
      day,
      resemblancePercent,
      sampleCount,
      lowData,
      example,
    });
  }

  return points;
}

export function computeAccuracyLeaderboard(
  history: PredictionHistoryItem[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
): AccuracyLeaderboard {
  let userCorrect = 0;
  let cloneCorrect = 0;
  let resolvedCount = 0;

  for (const item of history) {
    const result = item.matchResult;
    if (!result || result.status !== "final" || !result.winner) continue;

    const cloneEntry = cloneByMatchId.get(item.match.id);
    if (!cloneEntry) continue;

    resolvedCount += 1;
    if (item.prediction.winner === result.winner) userCorrect += 1;
    if (cloneEntry.clone.winner === result.winner) cloneCorrect += 1;
  }

  return {
    userAccuracy:
      resolvedCount > 0 ? Math.round((userCorrect / resolvedCount) * 100) : 0,
    cloneAccuracy:
      resolvedCount > 0 ? Math.round((cloneCorrect / resolvedCount) * 100) : 0,
    resolvedCount,
    ready: resolvedCount >= 3,
  };
}

export function buildSeasonReportCard(input: {
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null;
  history: PredictionHistoryItem[];
  memoryDrivers: DriverChip[];
  temporalContradictions: TemporalContradiction[];
  behavioralContradictionCount: number;
  accuracyLeaderboard: AccuracyLeaderboard;
}): SeasonReportCard {
  const favorite = input.profile?.favorite_team;
  let loyaltyPicks = 0;
  let totalPicks = 0;

  for (const item of input.history) {
    if (!favorite || !item.match.homeTeam || !item.match.awayTeam) continue;
    totalPicks += 1;
    const homeCode = item.match.homeTeam.code;
    const awayCode = item.match.awayTeam.code;
    if (
      item.prediction.winner === favorite ||
      (item.prediction.winner === homeCode && homeCode === favorite) ||
      (item.prediction.winner === awayCode && awayCode === favorite)
    ) {
      loyaltyPicks += 1;
    }
  }

  const loyaltyScore =
    totalPicks > 0 ? Math.round((loyaltyPicks / totalPicks) * 100) : 0;

  const loyaltyDriver = input.memoryDrivers.filter((d) => d === "loyalty").length;
  const statsDriver = input.memoryDrivers.filter((d) => d === "stats").length;
  const vibesDriver = input.memoryDrivers.filter((d) => d === "vibes").length;

  let verdict = "Still learning your football brain.";
  if (loyaltyDriver >= statsDriver && loyaltyDriver >= vibesDriver) {
    verdict = "You are emotionally driven.";
  } else if (statsDriver >= vibesDriver) {
    verdict = "You talk like a stats nerd but your picks betray you.";
  } else {
    verdict = "You pick with vibes and defend it loudly.";
  }

  return {
    loyaltyScore,
    predictionAccuracy: input.accuracyLeaderboard.userAccuracy,
    contradictionCount:
      input.temporalContradictions.length +
      input.behavioralContradictionCount,
    mostDefendedTeam: favorite ?? null,
    mostHatedTeam: input.profile?.rival_team ?? null,
    verdict,
  };
}

export type CloneAnalyticsBundle = {
  day1Snapshot: CloneKnowledgeSnapshot;
  day4Snapshot: CloneKnowledgeSnapshot;
  temporalContradictions: TemporalContradiction[];
  consistencyScore: number;
  driftSeries: CloneDriftPoint[];
  accuracyLeaderboard: AccuracyLeaderboard;
  seasonReport: SeasonReportCard;
  cloneMood: CloneMood;
};

export async function buildCloneAnalyticsBundle(input: {
  joinedAt: Date;
  memories: StoredMemory[];
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  history: PredictionHistoryItem[];
  cloneByMatchId: Map<string, ClonePredictionEntry>;
  memoryDrivers: DriverChip[];
  memoryTexts: string[];
  walrusNamespace?: string;
}): Promise<CloneAnalyticsBundle> {
  const temporalContradictions = detectTemporalContradictions(input.memories);
  const behavioralFindings = huntContradictions({
    profile: input.profile,
    history: input.history,
    memoryDrivers: input.memoryDrivers,
    memoryTexts: input.memoryTexts,
  });
  const behavioralContradictionCount = behavioralFindings.length;
  const consistencyScore = computeConsistencyScore(temporalContradictions);

  const snapshotInput = {
    joinedAt: input.joinedAt,
    memories: input.memories,
    profile: input.profile,
    history: input.history,
    temporalContradictions,
    behavioralContradictionCount,
    walrusNamespace: input.walrusNamespace,
  };

  const [day1Snapshot, day4Snapshot] = await Promise.all([
    synthesizeHistoricalSnapshot({ ...snapshotInput, day: 1 }),
    synthesizeHistoricalSnapshot({ ...snapshotInput, day: 4 }),
  ]);

  const driftSeries = buildCloneDriftSeries(
    input.history,
    input.cloneByMatchId,
    input.joinedAt,
  );

  const accuracyLeaderboard = computeAccuracyLeaderboard(
    input.history,
    input.cloneByMatchId,
  );

  const seasonReport = buildSeasonReportCard({
    profile: input.profile,
    history: input.history,
    memoryDrivers: input.memoryDrivers,
    temporalContradictions,
    behavioralContradictionCount,
    accuracyLeaderboard,
  });

  const cloneMood = computeCloneMood({
    history: input.history,
    memoryDrivers: input.memoryDrivers,
    contradictionCount:
      temporalContradictions.length + behavioralContradictionCount,
    favoriteTeam: input.profile?.favorite_team ?? null,
  });

  return {
    day1Snapshot,
    day4Snapshot,
    temporalContradictions,
    consistencyScore,
    driftSeries,
    accuracyLeaderboard,
    seasonReport,
    cloneMood,
  };
}
