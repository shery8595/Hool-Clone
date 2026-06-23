import Link from "next/link";
import {
  Brain,
  Calendar,
  Clock,
  Database,
  Globe,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import type { CloneMood } from "@/lib/clone/clone-mood";
import { formatDate } from "@/lib/mock/demo-user";
import type { CloneMaturity } from "@/lib/mock/types";
import { MatchLabelWithFlags } from "@/components/match/team-label-with-flags";
import { cn } from "@/lib/utils";

type EvolutionPageHeaderProps = {
  displayName: string;
  handle: string;
  joinedAt: string;
  maturityLabel: CloneMaturity;
  displayLevel: number;
  displayMaxLevel: number;
  memoriesCount: number;
  walrusBackedCount: number;
  confidenceDelta: number | null;
  matchLabel: string | null;
  slug?: string;
  isPublicView?: boolean;
  cloneMood?: CloneMood | null;
};

export function EvolutionPageHeader({
  displayName,
  handle,
  joinedAt,
  maturityLabel,
  displayLevel,
  displayMaxLevel,
  memoriesCount,
  walrusBackedCount,
  confidenceDelta,
  matchLabel,
  slug,
  isPublicView = false,
  cloneMood,
}: EvolutionPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-hoolclone-green-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
                {isPublicView ? "Public judge proof" : "Clone evolution proof"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-950 sm:text-3xl">
                Day 1 vs Day 7
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPublicView ? (
                  <>
                    @{handle} · {displayName}&apos;s HoolClone
                  </>
                ) : (
                  <>
                    {displayName}&apos;s HoolClone · private evolution proof
                  </>
                )}
                {matchLabel ? (
                  <>
                    {" · "}
                    <MatchLabelWithFlags label={matchLabel} size="sm" />
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                <Clock className="h-3.5 w-3.5" />
                Walrus memory proof
              </span>
              <MaturityBadge maturity={maturityLabel} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                Level {displayLevel} of {displayMaxLevel}
              </span>
              {cloneMood && <CloneMoodBadge mood={cloneMood} compact />}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {isPublicView && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Shareable judge URL
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(joinedAt)}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 lg:justify-end">
          {slug && isPublicView ? (
            <>
              <Link
                href={`/u/${slug}`}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-muted/40"
              >
                Public profile
              </Link>
              <Link
                href="/arena"
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-muted/40"
              >
                <Swords className="h-3.5 w-3.5" />
                Clone arena
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/train"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-hoolclone-green-50"
              >
                Train clone
              </Link>
              <Link
                href="/memory"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-hoolclone-green-50"
              >
                View receipts
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <EvolutionStat label="Memories" value={memoriesCount} icon={Brain} accent="green" />
        <EvolutionStat
          label="Walrus"
          value={walrusBackedCount}
          icon={Database}
          accent="emerald"
          hint="Verified receipts"
        />
        <EvolutionStat
          label="Confidence"
          value={
            confidenceDelta != null
              ? `${confidenceDelta >= 0 ? "+" : ""}${confidenceDelta}%`
              : "—"
          }
          icon={TrendingUp}
          accent="yellow"
          hint="Day 1 → Day 7"
        />
        <EvolutionStat
          label="Proof"
          value={memoriesCount >= 3 ? "Live" : "Locked"}
          icon={Sparkles}
          accent="green"
          hint={memoriesCount >= 3 ? "Judge-ready" : "Need 3+ mem"}
        />
      </div>
    </header>
  );
}

function EvolutionStat({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Brain;
  accent: "green" | "yellow" | "emerald";
  hint?: string;
}) {
  const styles = {
    green: "border-hoolclone-green-200/70 bg-white/80",
    yellow: "border-amber-200/70 bg-white/80",
    emerald: "border-emerald-200/70 bg-white/80",
  }[accent];

  const iconColor = {
    green: "text-hoolclone-green-700",
    yellow: "text-amber-700",
    emerald: "text-emerald-700",
  }[accent];

  return (
    <div className={cn("rounded-xl border p-3", styles)}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-hoolclone-green-950">
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
