import type { MeData } from "@/lib/api/client";
import type { DashboardData } from "@/lib/dashboard/types";
import { computeMaturityProgress } from "@/lib/auth/maturity";
import type { CloneMaturity } from "@/lib/mock/types";
import type { CloneAnalyticsBundle } from "@/lib/stats/clone-analytics";

function emptyCloneAnalytics(): CloneAnalyticsBundle {
  const emptySnapshot = {
    day: 1,
    confidence: 12,
    bullets: [] as string[],
    knownFavorite: null,
    knownRival: null,
    predictionCount: 0,
    contradictionCount: 0,
    maturityLabel: "Stranger" as CloneMaturity,
  };
  return {
    day1Snapshot: emptySnapshot,
    day4Snapshot: { ...emptySnapshot, day: 4, confidence: 81 },
    temporalContradictions: [],
    consistencyScore: 100,
    driftSeries: [],
    accuracyLeaderboard: {
      userAccuracy: 0,
      cloneAccuracy: 0,
      resolvedCount: 0,
      ready: false,
    },
    seasonReport: {
      loyaltyScore: 0,
      predictionAccuracy: 0,
      contradictionCount: 0,
      mostDefendedTeam: null,
      mostHatedTeam: null,
      verdict: "Still learning your football brain.",
    },
    cloneMood: {
      id: "neutral",
      label: "Learning",
      description:
        "Clone mood: still learning your football brain from Walrus memories.",
      toneGuidance:
        "Curious and observational — cite memories without overconfidence.",
    },
  };
}

export function buildDashboardFallback(me: MeData): DashboardData {
  const maturity = computeMaturityProgress(me.profile.memoriesCount);
  const quote =
    me.profile.summary?.split(".").find((s) => s.trim().length > 20)?.trim() ??
    (me.profile.favoriteTeam
      ? `Loyal to ${me.profile.favoriteTeam} — still learning the rest.`
      : null);

  return {
    featuredMatch: null,
    latestComparison: null,
    recentMemories: [],
    stats: {
      memoriesCount: me.profile.memoriesCount,
      cloneMatchPercent: 0,
      predictionsCount: 0,
      maturityLabel: me.profile.cloneMaturityLabel,
      level: maturity.level,
      maxLevel: maturity.maxLevel,
      levelProgress: maturity.progress,
      quote,
    },
    biasRadar: [],
    biasRadarReady: false,
    contradiction: null,
    contradictionCount: 0,
    memoryTimeMachine: null,
    cloneAnalytics: emptyCloneAnalytics(),
  };
}
