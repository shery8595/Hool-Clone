"use client";

import Link from "next/link";
import { ArrowRight, Brain, Target, TrendingUp } from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import { DashboardDisplayNamePrompt } from "@/components/dashboard/dashboard-display-name-prompt";
import type { CloneMood } from "@/lib/clone/clone-mood";
import type { CloneMaturity } from "@/lib/mock/types";
import { DashboardStatCard } from "./dashboard-surface";
import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  displayName: string | null;
  namespace: string;
  maturityLabel: CloneMaturity;
  displayLevel: number;
  displayMaxLevel: number;
  levelProgress: number;
  tierProgress: number;
  nextMaturityLabel: CloneMaturity | null;
  memoriesCount: number;
  memoriesToNext: number;
  predictionsCount: number;
  cloneMatchPercent: number;
  quote: string | null;
  mood: CloneMood;
  className?: string;
};

export function DashboardHero({
  displayName,
  namespace,
  maturityLabel,
  displayLevel,
  displayMaxLevel,
  levelProgress,
  tierProgress,
  nextMaturityLabel,
  memoriesCount,
  memoriesToNext,
  predictionsCount,
  cloneMatchPercent,
  quote,
  mood,
  className,
}: DashboardHeroProps) {
  const fanName = displayName?.trim();
  const hasDisplayName = Boolean(fanName);

  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/50 p-6 shadow-[0_12px_40px_-12px_rgba(10,61,46,0.12)] sm:p-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-hoolclone-green-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-4">
            {hasDisplayName ? (
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-hoolclone-green-800">
                  Clone command center
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-950 sm:text-3xl">
                  Hey {fanName} — your clone is locked in
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  @{namespace} · Your HoolClone dashboard
                </p>
              </div>
            ) : (
              <DashboardDisplayNamePrompt />
            )}

            <div className="flex flex-wrap items-center gap-2">
              <MaturityBadge maturity={maturityLabel} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                Level {displayLevel} of {displayMaxLevel}
              </span>
              <CloneMoodBadge mood={mood} compact />
            </div>

            <div className="max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  {nextMaturityLabel
                    ? `Progress to ${nextMaturityLabel}`
                    : "Maturity complete"}
                </span>
                <span className="font-mono font-semibold text-hoolclone-green-800">
                  {levelProgress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-hoolclone-green-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-hoolclone-green-700 to-hoolclone-green-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, levelProgress))}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {memoriesCount} {memoriesCount === 1 ? "memory" : "memories"}
                {nextMaturityLabel && memoriesToNext > 0
                  ? ` · ${memoriesToNext} more to reach ${nextMaturityLabel}`
                  : nextMaturityLabel
                    ? ` · ${tierProgress}% through ${maturityLabel}`
                    : " · Full HoolClone unlocked"}
              </p>
              {quote && (
                <p className="text-sm italic leading-relaxed text-hoolclone-green-900/80">
                  &ldquo;{quote}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-xs lg:flex-col lg:items-stretch">
          <Link
            href="/train"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-hoolclone-green-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-hoolclone-green-800 lg:flex-none"
          >
            <Brain className="h-4 w-4" />
            Train clone
          </Link>
          <Link
            href="/predict"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-hoolclone-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-hoolclone-green-900 shadow-sm transition hover:bg-hoolclone-green-50 lg:flex-none"
          >
            <Target className="h-4 w-4" />
            Make a pick
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label="Memories"
          value={memoriesCount}
          icon={Brain}
          accent="green"
        />
        <DashboardStatCard
          label="Predictions"
          value={predictionsCount}
          icon={Target}
          accent="yellow"
        />
        <DashboardStatCard
          label="Clone alignment"
          value={`${cloneMatchPercent}%`}
          icon={TrendingUp}
          accent="emerald"
          hint="How often your clone matches your picks"
        />
      </div>
    </header>
  );
}
