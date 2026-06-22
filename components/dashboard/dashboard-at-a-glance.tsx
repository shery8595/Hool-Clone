import Link from "next/link";
import { ArrowRight, Database, Target } from "lucide-react";
import { MemoryGlanceRow } from "@/components/dashboard/memory-glance-row";
import type { Match, MemoryReceipt, Prediction } from "@/lib/mock/types";
import {
  DashboardEyebrow,
  DashboardMiniCard,
  DashboardPanel,
  DashboardStatusPill,
} from "./dashboard-surface";

type DashboardAtAGlanceProps = {
  featuredMatch: Match | null;
  latestComparison: { match: Match; prediction: Prediction } | null;
  recentMemories: MemoryReceipt[];
  predictionsCount: number;
  memoriesCount: number;
  hydrating: boolean;
};

function formatPick(
  match: Match,
  winner: string,
  homeScore: number,
  awayScore: number,
) {
  const home = match.homeTeam;
  const away = match.awayTeam;
  if (!home || !away) return `${winner} ${homeScore}-${awayScore}`;
  const winnerName = winner === home.code ? home.name : away.name;
  return `${winnerName} ${homeScore}-${awayScore}`;
}

export function DashboardAtAGlance({
  featuredMatch,
  latestComparison,
  recentMemories,
  predictionsCount,
  memoriesCount,
  hydrating,
}: DashboardAtAGlanceProps) {
  const walrusBacked = recentMemories.some(
    (r) => r.storageStatus === "stored" && r.walrusBlobId,
  );

  return (
    <DashboardPanel className="h-full">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <DashboardEyebrow>At a glance</DashboardEyebrow>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-hoolclone-gray-900">
            Predict & memory
          </h2>
        </div>
        <Link
          href="/memory"
          className="inline-flex items-center gap-1 text-xs font-semibold text-hoolclone-green-800 hover:text-hoolclone-green-900"
        >
          Full activity
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <DashboardMiniCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/20 text-hoolclone-green-800">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Predict
                </p>
                <p className="text-sm font-semibold text-hoolclone-gray-900">
                  Latest picks
                </p>
              </div>
            </div>
            <DashboardStatusPill active={predictionsCount > 0}>
              {predictionsCount > 0 ? `${predictionsCount} logged` : "Empty"}
            </DashboardStatusPill>
          </div>

          {latestComparison ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  You
                </p>
                <p className="mt-1 text-sm font-semibold text-hoolclone-gray-900">
                  {formatPick(
                    latestComparison.match,
                    latestComparison.prediction.winner,
                    latestComparison.prediction.homeScore,
                    latestComparison.prediction.awayScore,
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-hoolclone-green-200/70 bg-hoolclone-green-50/50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-800">
                  Clone
                </p>
                <p className="mt-1 text-sm font-semibold text-hoolclone-gray-900">
                  {latestComparison.prediction.clone
                    ? formatPick(
                        latestComparison.match,
                        latestComparison.prediction.clone.winner,
                        latestComparison.prediction.clone.homeScore,
                        latestComparison.prediction.clone.awayScore,
                      )
                    : "Not generated yet"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {latestComparison.match.homeTeam?.name} vs{" "}
                {latestComparison.match.awayTeam?.name}
              </p>
            </div>
          ) : featuredMatch ? (
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  No picks yet. Your next match is ready.
                </p>
                <p className="mt-2 font-semibold text-hoolclone-gray-900">
                  {featuredMatch.homeTeam?.name} vs {featuredMatch.awayTeam?.name}
                </p>
              </div>
              <Link
                href={`/predict/${featuredMatch.id}`}
                className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 hover:bg-muted/40"
              >
                Open predict
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {hydrating ? "Loading matches..." : "No matches available yet."}
            </p>
          )}
        </DashboardMiniCard>

        <DashboardMiniCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/20 text-hoolclone-green-800">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Memory
                </p>
                <p className="text-sm font-semibold text-hoolclone-gray-900">
                  Recent receipts
                </p>
              </div>
            </div>
            <DashboardStatusPill active={walrusBacked}>
              {walrusBacked ? "Walrus" : memoriesCount > 0 ? "Local" : "Empty"}
            </DashboardStatusPill>
          </div>

          {recentMemories.length > 0 ? (
            <div className="space-y-2">
              {recentMemories.slice(0, 2).map((receipt) => (
                <MemoryGlanceRow key={receipt.id} receipt={receipt} />
              ))}
              {recentMemories.length > 2 && (
                <Link
                  href="/memory"
                  className="block pt-0.5 text-xs font-medium text-hoolclone-green-800 hover:underline"
                >
                  +{recentMemories.length - 2} more →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {hydrating
                  ? "Loading memories..."
                  : "Train your clone to write the first Walrus receipt."}
              </p>
              <Link
                href="/train"
                className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 hover:bg-muted/40"
              >
                Start training
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </DashboardMiniCard>
      </div>
    </DashboardPanel>
  );
}
