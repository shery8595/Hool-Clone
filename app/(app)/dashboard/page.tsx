"use client";

import { useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { ContradictionHunterCard } from "@/components/clone/contradiction-hunter-card";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { EvolutionTeaserCard } from "@/components/evolution/evolution-teaser-card";
import { BiasRadarChart } from "@/components/charts/bias-radar-chart";
import { CloneDriftChart } from "@/components/charts/clone-drift-chart";
import { DashboardAtAGlance } from "@/components/dashboard/dashboard-at-a-glance";
import { DashboardFlywheel } from "@/components/dashboard/dashboard-flywheel";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DashboardEmptyInsight,
  DashboardInsightsGrid,
  DashboardInsightsSection,
} from "@/components/dashboard/dashboard-insights";
import { DashboardSetupChecklist } from "@/components/dashboard/dashboard-setup-checklist";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { Button } from "@/components/ui/button";
import { TelegramConnectCard } from "@/components/telegram/telegram-connect-card";
import { cacheKeys } from "@/lib/api/data-cache";
import { fetchDashboardRaw } from "@/lib/api/client";
import { buildDashboardFallback } from "@/lib/dashboard/dashboard-fallback";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import { useUser } from "@/components/providers/user-provider";

export default function DashboardPage() {
  const { me } = useUser();
  const fallback = useMemo(
    () => (me ? buildDashboardFallback(me) : undefined),
    [me],
  );

  const { data, hydrating, error, refresh } = useCachedData(
    me?.id ? cacheKeys.dashboard(me.id) : null,
    fetchDashboardRaw,
    fallback,
  );

  const load = useCallback(() => {
    void refresh();
  }, [refresh]);

  if (!me) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-12 text-center shadow-[0_12px_40px_-12px_rgba(10,61,46,0.1)]">
        <HoolCloneLogo size="lg" className="mx-auto justify-center" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-hoolclone-green-950">
          Welcome to HoolClone
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Connect your wallet to see your clone dashboard, memories, and
          predictions.
        </p>
      </div>
    );
  }

  const dashboard = data ?? fallback;
  if (!dashboard) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
        <p className="text-sm text-rose-800">{error ?? "Could not load dashboard."}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    stats,
    featuredMatch,
    latestComparison,
    recentMemories,
    biasRadar,
    biasRadarReady,
    contradiction,
    memoryTimeMachine,
    cloneAnalytics,
  } = dashboard;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      {hydrating && (
        <div className="flex items-center justify-center gap-2 rounded-full border border-border/50 bg-white/80 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur-sm">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing dashboard
        </div>
      )}

      <DashboardHero
        displayName={me.displayName}
        namespace={me.memwalNamespace}
        maturityLabel={stats.maturityLabel}
        displayLevel={stats.displayLevel}
        displayMaxLevel={stats.displayMaxLevel}
        levelProgress={stats.levelProgress}
        tierProgress={stats.tierProgress}
        nextMaturityLabel={stats.nextMaturityLabel}
        memoriesCount={stats.memoriesCount}
        memoriesToNext={stats.memoriesToNext}
        predictionsCount={stats.predictionsCount}
        cloneMatchPercent={stats.cloneMatchPercent}
        quote={stats.quote}
        mood={cloneAnalytics.cloneMood}
      />

      <DashboardFlywheel
        memoriesCount={stats.memoriesCount}
        predictionsCount={stats.predictionsCount}
        maturityLabel={stats.maturityLabel}
      />

      {stats.memoriesCount >= 3 && (
        <TelegramConnectCard variant="compact" />
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <DashboardAtAGlance
          featuredMatch={featuredMatch}
          latestComparison={latestComparison}
          recentMemories={recentMemories}
          predictionsCount={stats.predictionsCount}
          memoriesCount={stats.memoriesCount}
          hydrating={hydrating}
        />
        <aside>
          <DashboardSetupChecklist
            me={me}
            memoriesCount={stats.memoriesCount}
            predictionsCount={stats.predictionsCount}
          />
        </aside>
      </div>

      {(memoryTimeMachine || stats.memoriesCount > 0) && (
        <DashboardInsightsSection
          title="Clone evolution"
          description="Track how your clone improves with more Walrus memories"
        >
          <EvolutionTeaserCard
            memoryTimeMachine={memoryTimeMachine}
            memoriesCount={stats.memoriesCount}
          />
        </DashboardInsightsSection>
      )}

      <DashboardInsightsSection
        title="Performance & bias"
        description="Contradictions, drift, accuracy, and fan bias over time"
      >
        <DashboardInsightsGrid>
          <ContradictionHunterCard
            contradiction={contradiction}
            predictionsCount={stats.predictionsCount}
            className="rounded-2xl border border-border/50 shadow-[0_12px_40px_-12px_rgba(10,61,46,0.08)]"
          />
        </DashboardInsightsGrid>

        <ContradictionScoreCard
          contradictions={cloneAnalytics.temporalContradictions}
          consistencyScore={cloneAnalytics.consistencyScore}
          totalCount={
            cloneAnalytics.temporalContradictions.length +
            (dashboard.contradictionCount ?? 0)
          }
          roastLine={contradiction?.text}
        />

        <DashboardInsightsGrid>
          <CloneDriftChart data={cloneAnalytics.driftSeries} />
          <AccuracyLeaderboardCard data={cloneAnalytics.accuracyLeaderboard} />
        </DashboardInsightsGrid>

        {biasRadarReady ? (
          <BiasRadarChart
            data={biasRadar}
            description="Computed from your predictions, training memories, and clone picks."
          />
        ) : (
          <DashboardEmptyInsight hydrating={hydrating} hydratingMessage="Building your bias radar...">
            Make a few predictions to unlock your bias radar.
          </DashboardEmptyInsight>
        )}
      </DashboardInsightsSection>

      {error && (
        <p className="text-center text-sm text-destructive">
          {error}{" "}
          <button type="button" className="font-semibold underline" onClick={load}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
