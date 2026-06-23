import Link from "next/link";
import { ArrowRight, Database, Swords, Target } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { MemoryGlanceRow } from "@/components/dashboard/memory-glance-row";
import { MatchTeamsRowFromMatch } from "@/components/match/match-teams-row";
import { TeamFlag } from "@/components/match/team-flag";
import type { Match, MemoryReceipt, Prediction } from "@/lib/mock/types";
import {
  DashboardMiniCard,
  DashboardPanel,
  DashboardSectionHeader,
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
  const winnerTeam = winner === home.code ? home : away;
  return { team: winnerTeam, score: `${homeScore}-${awayScore}` };
}

function PickLine({
  match,
  winner,
  homeScore,
  awayScore,
}: {
  match: Match;
  winner: string;
  homeScore: number;
  awayScore: number;
}) {
  const pick = formatPick(match, winner, homeScore, awayScore);
  if (typeof pick === "string") {
    return <span>{pick}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <TeamFlag team={pick.team} size="sm" />
      <span>
        {pick.team.name} {pick.score}
      </span>
    </span>
  );
}

function ComparisonCard({
  latestComparison,
}: {
  latestComparison: { match: Match; prediction: Prediction };
}) {
  const { match, prediction } = latestComparison;
  const clonePick = prediction.clone;

  return (
    <div className="space-y-4">
      <MatchTeamsRowFromMatch
        match={match}
        size="sm"
        className="text-xs text-muted-foreground"
        nameClassName="font-medium"
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            You
          </p>
          <p className="mt-1.5 text-sm font-semibold text-hoolclone-gray-900">
            <PickLine
              match={match}
              winner={prediction.winner}
              homeScore={prediction.homeScore}
              awayScore={prediction.awayScore}
            />
          </p>
        </div>

        <div className="flex justify-center">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-hoolclone-green-900 text-[10px] font-bold text-white">
            VS
          </span>
        </div>

        <div className="rounded-xl border border-hoolclone-green-200 bg-hoolclone-green-50/60 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-hoolclone-green-800">
            Clone
          </p>
          <p className="mt-1.5 text-sm font-semibold text-hoolclone-gray-900">
            {clonePick ? (
              <PickLine
                match={match}
                winner={clonePick.winner}
                homeScore={clonePick.homeScore}
                awayScore={clonePick.awayScore}
              />
            ) : (
              "Not generated yet"
            )}
          </p>
        </div>
      </div>

      <ButtonLink href="/predict" variant="outline" size="sm">
        View all picks
        <ArrowRight className="h-3.5 w-3.5" />
      </ButtonLink>
    </div>
  );
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
      <DashboardSectionHeader
        eyebrow="Activity"
        title="Predict & memory"
        description="Your latest picks and Walrus receipts"
        action={
          <Link
            href="/memory"
            className="inline-flex items-center gap-1 text-xs font-semibold text-hoolclone-green-800 hover:text-hoolclone-green-900"
          >
            Full activity
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:items-start">
        <DashboardMiniCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/20 text-hoolclone-green-800">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-hoolclone-gray-900">
                  Latest picks
                </p>
                <p className="text-xs text-muted-foreground">
                  You vs your clone
                </p>
              </div>
            </div>
            <DashboardStatusPill active={predictionsCount > 0}>
              {predictionsCount > 0 ? `${predictionsCount} logged` : "Empty"}
            </DashboardStatusPill>
          </div>

          {latestComparison ? (
            <ComparisonCard latestComparison={latestComparison} />
          ) : featuredMatch ? (
            <div className="flex flex-1 flex-col justify-between gap-5">
              <div className="rounded-xl border border-dashed border-hoolclone-green-200 bg-hoolclone-green-50/30 p-4">
                <p className="text-sm text-muted-foreground">
                  No picks yet. Your next match is ready.
                </p>
                <div className="mt-2">
                  <MatchTeamsRowFromMatch match={featuredMatch} size="sm" />
                </div>
              </div>
              <ButtonLink href={`/predict/${featuredMatch.id}`} size="sm">
                Open predict
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {hydrating ? "Loading matches..." : "No matches available yet."}
            </p>
          )}
        </DashboardMiniCard>

        <DashboardMiniCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/20 text-hoolclone-green-800">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-hoolclone-gray-900">
                  Recent receipts
                </p>
                <p className="text-xs text-muted-foreground">
                  Walrus-backed memories
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
                  className="block pt-1 text-xs font-semibold text-hoolclone-green-800 hover:underline"
                >
                  +{recentMemories.length - 2} more receipts →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between gap-5">
              <p className="text-sm text-muted-foreground">
                {hydrating
                  ? "Loading memories..."
                  : "Train your clone to write the first Walrus receipt."}
              </p>
              <ButtonLink href="/train" variant="outline" size="sm">
                Start training
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          )}
        </DashboardMiniCard>
      </div>

      {memoriesCount >= 8 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hoolclone-green-100 bg-hoolclone-green-50/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-hoolclone-green-900">
            <Swords className="h-4 w-4 shrink-0" />
            <span>Ready to debate your clone with receipts?</span>
          </div>
          <ButtonLink href="/debate" variant="outline" size="sm">
            Open debate
          </ButtonLink>
        </div>
      )}
    </DashboardPanel>
  );
}
