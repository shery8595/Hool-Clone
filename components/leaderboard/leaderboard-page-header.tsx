import Link from "next/link";
import { Swords, Trophy, Users } from "lucide-react";
import type { LeaderboardData } from "@/lib/leaderboard/types";
import { cn } from "@/lib/utils";

type LeaderboardPageHeaderProps = {
  data: LeaderboardData;
};

export function LeaderboardPageHeader({ data }: LeaderboardPageHeaderProps) {
  const leader = data.entries[0] ?? null;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
            Global rankings
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-hoolclone-green-950">
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ranked by memories stored and how closely your clone mirrors your
            picks
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:max-w-xl lg:flex-1">
            <HeaderStat
              label="Players"
              value={String(data.totalPlayers)}
              icon={Users}
              accent="green"
            />
            <HeaderStat
              label="Top score"
              value={leader ? String(leader.learningScore) : "—"}
              icon={Trophy}
              accent="yellow"
              hint={leader ? leader.displayName : "No climbers yet"}
            />
            <HeaderStat
              label="Your rank"
              value={
                data.viewerEntry
                  ? `#${data.viewerEntry.rank}`
                  : data.totalPlayers > 0
                    ? "—"
                    : "—"
              }
              icon={Trophy}
              accent="emerald"
              hint={
                data.viewerEntry
                  ? `Score ${data.viewerEntry.learningScore}`
                  : "Enable public profile to climb"
              }
              className="col-span-2 sm:col-span-1"
            />
          </div>
          <Link
            href="/arena"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-hoolclone-green-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-hoolclone-green-800"
          >
            <Swords className="h-4 w-4" />
            Enter Clone Arena
          </Link>
        </div>
      </div>

      {!data.viewerEntry && data.totalPlayers > 0 && (
        <p className="relative mt-4 text-xs text-muted-foreground">
          Want to appear here?{" "}
          <Link
            href="/profile/public"
            className="font-semibold text-hoolclone-green-800 underline-offset-2 hover:underline"
          >
            Enable your public profile
          </Link>
        </p>
      )}
    </header>
  );
}

function HeaderStat({
  label,
  value,
  icon: Icon,
  accent,
  hint,
  className,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "green" | "yellow" | "emerald";
  hint?: string;
  className?: string;
}) {
  const accentClasses = {
    green: "bg-white text-hoolclone-green-900 ring-hoolclone-green-200",
    yellow: "bg-hoolclone-yellow-50 text-hoolclone-green-950 ring-hoolclone-yellow-200",
    emerald: "bg-emerald-50 text-emerald-950 ring-emerald-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/80 px-3 py-2.5 ring-1",
        accentClasses[accent],
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      {hint && (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
