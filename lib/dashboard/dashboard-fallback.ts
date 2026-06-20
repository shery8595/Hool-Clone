import type { MeData } from "@/lib/api/client";
import type { DashboardData } from "@/lib/dashboard/types";
import { computeMaturityProgress } from "@/lib/auth/maturity";

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
  };
}
