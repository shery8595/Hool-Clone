import { storedMemoryToReceipt } from "@/lib/api/memory-mapper";
import {
  huntContradictions,
  pickDashboardContradiction,
} from "@/lib/clone/contradiction-hunter";
import { buildMemoryTimeMachine } from "@/lib/clone/build-memory-time-machine";
import { buildMeResponse, getFanProfile } from "@/lib/db/users";
import { listClonePredictionsForUser } from "@/lib/db/clone-predictions";
import {
  listMemoriesChronologicalForUser,
  listMemoriesForUser,
} from "@/lib/memory/postgres-memory";
import { getMatchDataAdapter } from "@/lib/match-data";
import { listUserPredictions } from "@/lib/db/predictions";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import {
  buildBiasRadar,
  extractMemoryDrivers,
  hasBiasRadarData,
  computeCloneAgreementPercent,
  computeMaturityProgress,
  buildPredictionComparisonsFromHistory,
  findLatestComparison,
  findLatestDisagreement,
} from "@/lib/stats/user-analytics";
import type { DashboardData } from "@/lib/dashboard/types";

export type { DashboardData };

export async function buildDashboard(userId: string): Promise<DashboardData | null> {
  const [me, fanProfile, matches, history, cloneByMatchId, recentStored, chronologicalMemories, onboardingDrivers] =
    await Promise.all([
      buildMeResponse(userId),
      getFanProfile(userId),
      getMatchDataAdapter().listMatches(),
      listUserPredictions(userId),
      listClonePredictionsForUser(userId),
      listMemoriesForUser(userId, 3),
      listMemoriesChronologicalForUser(userId),
      getOnboardingDrivers(userId),
    ]);

  const memoryDrivers = [
    ...extractMemoryDrivers(chronologicalMemories),
    ...onboardingDrivers,
  ];

  if (!me) return null;

  const featuredMatch =
    matches.find((m) => m.featured && m.homeTeam && m.awayTeam) ??
    matches.find((m) => m.homeTeam && m.awayTeam) ??
    null;

  const recentMemories = recentStored.map(storedMemoryToReceipt);
  const comparisons = buildPredictionComparisonsFromHistory(
    history,
    cloneByMatchId,
    8,
  );
  const cloneMatchPercent = computeCloneAgreementPercent(comparisons);
  const maturity = computeMaturityProgress(me.profile.memoriesCount);
  const latestComparison = findLatestComparison(history, cloneByMatchId);
  const cloneDisagreement = findLatestDisagreement(comparisons, cloneByMatchId);
  const contradictionFindings = huntContradictions({
    profile: fanProfile,
    history,
    memoryDrivers,
    memoryTexts: chronologicalMemories.map((m) => m.text),
  });
  const contradiction = pickDashboardContradiction(
    contradictionFindings,
    cloneDisagreement,
  );

  const profile = me.profile;
  const quote =
    profile.summary?.split(".").find((s) => s.trim().length > 20)?.trim() ??
    (profile.favoriteTeam
      ? `Loyal to ${profile.favoriteTeam} — still learning the rest.`
      : null);

  return {
    featuredMatch,
    latestComparison,
    recentMemories,
    stats: {
      memoriesCount: profile.memoriesCount,
      cloneMatchPercent,
      predictionsCount: history.length,
      maturityLabel: profile.cloneMaturityLabel,
      level: maturity.level,
      maxLevel: maturity.maxLevel,
      levelProgress: maturity.progress,
      quote,
    },
    biasRadar: buildBiasRadar({
      profile: fanProfile,
      memoriesCount: profile.memoriesCount,
      history,
      cloneByMatchId,
      memoryDrivers,
    }),
    biasRadarReady: hasBiasRadarData({
      profile: fanProfile,
      memoriesCount: profile.memoriesCount,
      history,
      cloneByMatchId,
      memoryDrivers,
    }),
    contradiction,
    contradictionCount: contradictionFindings.length,
    memoryTimeMachine: buildMemoryTimeMachine({
      memoriesCount: me.profile.memoriesCount,
      profile: fanProfile,
      history,
      cloneByMatchId,
      matches,
      chronologicalMemories,
      memoryDrivers,
    }),
  };
}
