"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { ContradictionHunterCard } from "@/components/clone/contradiction-hunter-card";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { CloneBeforeAfterPanel } from "@/components/clone/clone-before-after-panel";
import { MemoryTimeMachine } from "@/components/clone/memory-time-machine";
import { BiasRadarChart } from "@/components/charts/bias-radar-chart";
import { CloneDriftChart } from "@/components/charts/clone-drift-chart";
import { DashboardAtAGlance } from "@/components/dashboard/dashboard-at-a-glance";
import { DashboardFlywheel } from "@/components/dashboard/dashboard-flywheel";
import {
  DashboardInsightCard,
  DashboardInsightsSection,
} from "@/components/dashboard/dashboard-insights";
import { DashboardSetupChecklist } from "@/components/dashboard/dashboard-setup-checklist";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
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
      <div className="mx-auto max-w-lg rounded-2xl border border-border/50 bg-white p-12 text-center shadow-[0_12px_40px_-12px_rgba(10,61,46,0.08)]">
        <HoolCloneLogo size="lg" className="mx-auto justify-center" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Welcome to HoolClone
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your wallet to see your clone dashboard, memories, and
          predictions.
        </p>
      </div>
    );
  }

  const dashboard = data ?? fallback;
  if (!dashboard) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/50 bg-white p-12 text-center shadow-[0_12px_40px_-12px_rgba(10,61,46,0.08)]">
        <p className="text-destructive">{error ?? "Could not load dashboard."}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-hoolclone-green-900 underline"
          onClick={load}
        >
          Retry
        </button>
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
    <div className="mx-auto max-w-7xl space-y-5 pb-4">
      {hydrating && (
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Syncing dashboard
        </p>
      )}

      <DashboardFlywheel
        memoriesCount={stats.memoriesCount}
        predictionsCount={stats.predictionsCount}
        maturityLabel={stats.maturityLabel}
        level={stats.level}
        maxLevel={stats.maxLevel}
        quote={stats.quote}
        mood={cloneAnalytics.cloneMood}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <DashboardAtAGlance
          featuredMatch={featuredMatch}
          latestComparison={latestComparison}
          recentMemories={recentMemories}
          predictionsCount={stats.predictionsCount}
          memoriesCount={stats.memoriesCount}
          hydrating={hydrating}
        />
        <div className="space-y-5">
          <DashboardSetupChecklist
            me={me}
            memoriesCount={stats.memoriesCount}
            predictionsCount={stats.predictionsCount}
          />
          {stats.memoriesCount >= 3 && (
            <TelegramConnectCard variant="compact" />
          )}
        </div>
      </div>

      {memoryTimeMachine && (
        <DashboardInsightsSection title="Clone evolution">
          {me.publicSlug && (
            <Link
              href={`/u/${me.publicSlug}/evolution`}
              className="block rounded-xl border border-hoolclone-green-200 bg-hoolclone-green-50/50 px-4 py-3 text-center text-sm font-semibold text-hoolclone-green-900 transition-colors hover:bg-hoolclone-green-50"
            >
              Open full evolution timeline →
            </Link>
          )}
          <CloneBeforeAfterPanel
            data={memoryTimeMachine}
            comparePhase="day4"
          />
          <MemoryTimeMachine data={memoryTimeMachine} />
        </DashboardInsightsSection>
      )}

      <DashboardInsightsSection title="Performance & bias">
        <div className="grid gap-5 lg:grid-cols-2">
          <ContradictionHunterCard
            contradiction={contradiction}
            predictionsCount={stats.predictionsCount}
            className="rounded-2xl border border-border/50 shadow-[0_12px_40px_-12px_rgba(10,61,46,0.08)]"
          />
        </div>

        <ContradictionScoreCard
          contradictions={cloneAnalytics.temporalContradictions}
          consistencyScore={cloneAnalytics.consistencyScore}
          totalCount={
            cloneAnalytics.temporalContradictions.length +
            (dashboard.contradictionCount ?? 0)
          }
          roastLine={contradiction?.text}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <CloneDriftChart data={cloneAnalytics.driftSeries} />
          <AccuracyLeaderboardCard data={cloneAnalytics.accuracyLeaderboard} />
        </div>

        {biasRadarReady ? (
          <BiasRadarChart
            data={biasRadar}
            description="Computed from your predictions, training memories, and clone picks."
          />
        ) : (
          <DashboardInsightCard>
            <p className="text-center text-sm text-muted-foreground">
              {hydrating
                ? "Building your bias radar..."
                : "Make a few predictions to unlock your bias radar."}
            </p>
          </DashboardInsightCard>
        )}
      </DashboardInsightsSection>

      {error && (
        <p className="text-center text-sm text-destructive">
          {error}{" "}
          <button type="button" className="underline" onClick={load}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
