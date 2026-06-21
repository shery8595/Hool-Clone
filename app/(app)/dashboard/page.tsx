"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ContradictionHunterCard } from "@/components/clone/contradiction-hunter-card";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { CloneBeforeAfterPanel } from "@/components/clone/clone-before-after-panel";
import { MemoryTimeMachine } from "@/components/clone/memory-time-machine";
import { CloneStatusCard } from "@/components/clone/clone-status-card";
import { HumanVsClonePanel } from "@/components/clone/human-vs-clone-panel";
import { BiasRadarChart } from "@/components/charts/bias-radar-chart";
import { CloneDriftChart } from "@/components/charts/clone-drift-chart";
import { MatchCard } from "@/components/match/match-card";
import { MemoryReceiptList } from "@/components/memory/memory-receipt-list";
import { cacheKeys } from "@/lib/api/data-cache";
import { fetchDashboardRaw } from "@/lib/api/client";
import { buildDashboardFallback } from "@/lib/dashboard/dashboard-fallback";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { TelegramConnectCard } from "@/components/telegram/telegram-connect-card";
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
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-12 text-center">
        <HoolCloneLogo size="lg" className="mx-auto justify-center" />
        <h1 className="mt-4 text-xl font-bold">Welcome to HoolClone</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your wallet to see your clone dashboard, memories, and
          predictions.
        </p>
      </div>
    );
  }

  const dashboard = data ?? fallback;
  if (!dashboard) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-12 text-center">
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
    <div className="mx-auto max-w-7xl space-y-6">
      {hydrating && (
        <p className="text-center text-xs text-muted-foreground">Syncing dashboard...</p>
      )}

      <CloneStatusCard
        maturity={stats.maturityLabel}
        level={stats.level}
        maxLevel={stats.maxLevel}
        levelProgress={stats.levelProgress}
        quote={stats.quote}
        memoriesCount={stats.memoriesCount}
        cloneMatchPercent={stats.cloneMatchPercent}
        predictionsCount={stats.predictionsCount}
      />

      <CloneMoodBadge mood={cloneAnalytics.cloneMood} />

      {stats.memoriesCount >= 3 && (
        <TelegramConnectCard variant="compact" />
      )}

      {memoryTimeMachine && (
        <>
          {me.publicSlug && (
            <Link
              href={`/u/${me.publicSlug}/evolution`}
              className="block rounded-xl border border-hoolclone-yellow-300 bg-hoolclone-yellow-50 px-4 py-3 text-center text-sm font-semibold text-hoolclone-green-900 hover:bg-hoolclone-yellow-100"
            >
              See your clone evolve (Day 1 → Day 4) →
            </Link>
          )}
          <CloneBeforeAfterPanel data={memoryTimeMachine} comparePhase="day4" />
          <MemoryTimeMachine data={memoryTimeMachine} />
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {featuredMatch ? (
          <MatchCard
            match={featuredMatch}
            footer={
              latestComparison
                ? "Your latest human vs clone comparison is below."
                : "Make a prediction to compare with your clone."
            }
          />
        ) : (
          <Card className="rounded-2xl border-dashed shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              {hydrating
                ? "Loading featured match..."
                : (
                  <>
                    No matches available. Run{" "}
                    <code className="rounded bg-muted px-1">npm run db:seed-matches</code>.
                  </>
                )}
            </CardContent>
          </Card>
        )}

        {latestComparison ? (
          <HumanVsClonePanel
            match={latestComparison.match}
            prediction={latestComparison.prediction}
          />
        ) : (
          <Card className="rounded-2xl border-dashed shadow-sm">
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-muted-foreground">
                No predictions yet. Lock in a pick to see how your clone
                compares.
              </p>
              {featuredMatch && (
                <Link
                  href={`/predict/${featuredMatch.id}`}
                  className="text-sm font-semibold text-hoolclone-green-900 underline"
                >
                  Predict {featuredMatch.homeTeam?.name} vs{" "}
                  {featuredMatch.awayTeam?.name}
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        {recentMemories.length > 0 ? (
          <MemoryReceiptList receipts={recentMemories} />
        ) : (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>{hydrating ? "Loading memories..." : "No memories yet."}</p>
              {!hydrating && (
                <Link
                  href="/train"
                  className="mt-2 inline-block text-sm font-semibold text-hoolclone-green-900 underline"
                >
                  Train your clone
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        <ContradictionHunterCard
          contradiction={contradiction}
          predictionsCount={stats.predictionsCount}
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

      <CloneDriftChart data={cloneAnalytics.driftSeries} />

      <AccuracyLeaderboardCard data={cloneAnalytics.accuracyLeaderboard} />

      {biasRadarReady ? (
        <BiasRadarChart
          data={biasRadar}
          description="Computed from your predictions, training memories, and clone picks — not mock data."
        />
      ) : (
        <Card className="rounded-2xl border-dashed shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {hydrating
              ? "Building your bias radar..."
              : "Make a few predictions to unlock your bias radar."}
          </CardContent>
        </Card>
      )}

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
