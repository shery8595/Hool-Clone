"use client";

import { CalendarClock, CheckCircle2, Layers } from "lucide-react";
import { MatchListCard } from "@/components/match/match-card";
import type { Match } from "@/lib/mock/types";
import { partitionMatches } from "@/lib/match-data/match-status";

type MatchScheduleSectionsProps = {
  matches: Match[];
  emptyMessage?: string;
};

function MatchGrid({ matches: list }: { matches: Match[] }) {
  if (list.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((match) => (
        <MatchListCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed bg-white px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

export function MatchScheduleSections({
  matches,
  emptyMessage = "No matches in this section.",
}: MatchScheduleSectionsProps) {
  const { upcoming, finished } = partitionMatches(matches);

  if (upcoming.length === 0 && finished.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-hoolclone-green-700" />
            <h3 className="text-sm font-bold text-hoolclone-green-900">
              Upcoming
            </h3>
            <span className="rounded-full bg-hoolclone-green-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-hoolclone-green-800">
              {upcoming.length}
            </span>
          </div>
          <MatchGrid matches={upcoming} />
        </section>
      )}

      {finished.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Full-time results</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
              {finished.length}
            </span>
          </div>
          <MatchGrid matches={finished} />
        </section>
      )}
    </div>
  );
}

export function MatchBrowseGrid({ matches }: { matches: Match[] }) {
  return <MatchScheduleSections matches={matches} emptyMessage="No matches in this round." />;
}

export function MatchSummaryStats({ matches }: { matches: Match[] }) {
  const { upcoming, finished, live } = partitionMatches(matches);

  return (
    <div className="flex flex-wrap gap-2">
      <StatPill
        icon={CalendarClock}
        label="Upcoming"
        value={upcoming.length}
        active
      />
      {live.length > 0 && (
        <StatPill icon={Layers} label="Live now" value={live.length} highlight />
      )}
      <StatPill icon={CheckCircle2} label="Full time" value={finished.length} />
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  active,
  highlight,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: number;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <span
      className={
        highlight
          ? "inline-flex items-center gap-1.5 rounded-full border border-hoolclone-yellow-300 bg-hoolclone-yellow-50 px-3 py-1 text-xs font-semibold text-hoolclone-yellow-900"
          : active
            ? "inline-flex items-center gap-1.5 rounded-full border border-hoolclone-green-200 bg-hoolclone-green-50 px-3 py-1 text-xs font-semibold text-hoolclone-green-900"
            : "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {value} {label}
    </span>
  );
}

export { partitionMatches };
