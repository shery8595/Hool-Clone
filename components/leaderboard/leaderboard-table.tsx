"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Medal, Swords, Trophy } from "lucide-react";
import { MaturityBadge } from "@/components/clone/clone-avatar";
import { useUser } from "@/components/providers/user-provider";
import {
  buildClashHref,
  isClashEligible,
} from "@/lib/clash/arena-opponents";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";
import { cn } from "@/lib/utils";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  viewerUserId?: string | null;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-hoolclone-yellow-600">
        <Trophy className="h-4 w-4" aria-hidden />
        {rank}
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-slate-500">
        <Medal className="h-4 w-4" aria-hidden />
        {rank}
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-amber-700">
        <Medal className="h-4 w-4" aria-hidden />
        {rank}
      </span>
    );
  }
  return <span className="font-semibold tabular-nums text-muted-foreground">#{rank}</span>;
}

function formatCloneMatched(entry: LeaderboardEntry): string {
  if (entry.comparablePredictions <= 0) return "—";
  return `${entry.cloneMatchPercent}% · ${entry.cloneAgreementCount} picks`;
}

export function LeaderboardTable({
  entries,
  viewerUserId: viewerUserIdProp,
}: LeaderboardTableProps) {
  const router = useRouter();
  const { me } = useUser();
  const viewerUserId = viewerUserIdProp ?? me?.id ?? null;
  const viewerRowRef = useRef<HTMLTableRowElement>(null);
  const challengerSlug =
    me?.publicSlug && me.profile.publicEnabled ? me.publicSlug : null;

  useEffect(() => {
    if (!viewerUserId || !viewerRowRef.current) return;
    viewerRowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [viewerUserId, entries.length]);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-8 text-center">
        <p className="text-sm font-semibold text-hoolclone-green-950">
          No climbers on the board yet
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to train your clone and enable a public profile.
        </p>
        <Link
          href="/profile/public"
          className="mt-4 inline-flex rounded-full bg-hoolclone-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-hoolclone-green-900"
        >
          Enable public profile
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/50 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">Fan</th>
            <th className="px-4 py-3 font-semibold">Learning score</th>
            <th className="px-4 py-3 font-semibold">Memories</th>
            <th className="px-4 py-3 font-semibold">Clone matched</th>
            <th className="px-4 py-3 font-semibold">Maturity</th>
            {challengerSlug && (
              <th className="px-4 py-3 font-semibold">Arena</th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isViewer = viewerUserId === entry.userId;
            const href = `/u/${entry.slug}`;
            const canChallenge =
              challengerSlug &&
              !isViewer &&
              entry.memoriesCount > 0;
            const clashHref = canChallenge
              ? buildClashHref(challengerSlug, entry.slug)
              : null;

            return (
              <tr
                key={entry.userId}
                ref={isViewer ? viewerRowRef : undefined}
                role="link"
                tabIndex={0}
                onClick={() => router.push(href)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(href);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-border/50 transition-colors last:border-0 even:bg-hoolclone-green-50/10 hover:bg-hoolclone-green-50/50",
                  isViewer &&
                    "bg-hoolclone-green-100/80 ring-2 ring-inset ring-hoolclone-green-400",
                )}
                aria-label={
                  isViewer
                    ? `Your rank: ${entry.rank}. View your public profile`
                    : `View ${entry.displayName}'s public profile`
                }
                aria-current={isViewer ? "true" : undefined}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={entry.rank} />
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-hoolclone-green-950">
                        {entry.displayName}
                      </p>
                      {isViewer && (
                        <span className="rounded-full bg-hoolclone-green-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{entry.slug}
                      {entry.favoriteTeam ? ` · ${entry.favoriteTeam}` : ""}
                    </p>
                    {(entry.arenaWins > 0 || entry.arenaLosses > 0) && (
                      <p className="text-[11px] text-hoolclone-green-800">
                        Arena {entry.arenaWins}W · {entry.arenaLosses}L
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold tabular-nums text-hoolclone-green-900">
                    {entry.learningScore}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{entry.memoriesCount}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatCloneMatched(entry)}
                </td>
                <td className="px-4 py-3">
                  <MaturityBadge maturity={entry.maturityLabel} />
                </td>
                {challengerSlug && (
                  <td className="px-4 py-3">
                    {canChallenge ? (
                      <Link
                        href={clashHref!}
                        onClick={(event) => event.stopPropagation()}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                          isClashEligible(entry)
                            ? "bg-hoolclone-green-900 text-white hover:bg-hoolclone-green-800"
                            : "bg-white text-hoolclone-green-900 ring-1 ring-border/60 hover:bg-hoolclone-green-50",
                        )}
                      >
                        <Swords className="h-3.5 w-3.5" />
                        Clash
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
