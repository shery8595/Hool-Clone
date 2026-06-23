import Link from "next/link";
import { Swords, Trophy } from "lucide-react";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import { ButtonLink } from "@/components/ui/button-link";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";
import { cn } from "@/lib/utils";

type ArenaHeroProps = {
  viewerEntry: LeaderboardEntry | null;
  totalPlayers: number;
  challengerSlug: string | null;
  publicEnabled: boolean;
};

export function ArenaHero({
  viewerEntry,
  totalPlayers,
  challengerSlug,
  publicEnabled,
}: ArenaHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
              Clone v clone
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-hoolclone-green-950 sm:text-3xl">
              Clone Arena
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Pick a rival from the leaderboard. Your Walrus-backed clone debates
              theirs on a real fixture — namespace vs namespace.
            </p>
            {viewerEntry && (
              <p className="text-sm font-semibold text-hoolclone-green-900">
                Your rank: #{viewerEntry.rank} · score {viewerEntry.learningScore}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          <ButtonLink
            href="/leaderboard"
            variant="outline"
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </ButtonLink>
          {challengerSlug && (
            <ButtonLink
              href={`/u/${challengerSlug}`}
              variant="secondary"
              className="gap-2"
            >
              <Swords className="h-4 w-4" />
              Your public clone
            </ButtonLink>
          )}
        </div>
      </div>

      {!publicEnabled && (
        <div
          className={cn(
            "relative mt-5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950",
          )}
        >
          Enable your{" "}
          <Link
            href="/profile/public"
            className="font-semibold underline-offset-2 hover:underline"
          >
            public profile
          </Link>{" "}
          to enter the arena and challenge other clones.
        </div>
      )}

      {publicEnabled && totalPlayers < 2 && (
        <p className="relative mt-4 text-sm text-muted-foreground">
          Waiting for more public clones to join the board before bouts can run.
        </p>
      )}
    </header>
  );
}
