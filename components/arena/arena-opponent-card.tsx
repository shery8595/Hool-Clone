import Link from "next/link";
import { Swords, Zap } from "lucide-react";
import { MaturityBadge } from "@/components/clone/clone-avatar";
import { buildClashHref, type ArenaOpponent } from "@/lib/clash/arena-opponents";
import { cn } from "@/lib/utils";

type ArenaOpponentCardProps = {
  opponent: ArenaOpponent;
  challengerSlug: string;
  compact?: boolean;
};

export function ArenaOpponentCard({
  opponent,
  challengerSlug,
  compact = false,
}: ArenaOpponentCardProps) {
  const href = buildClashHref(challengerSlug, opponent.slug);

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition hover:border-hoolclone-green-200 hover:shadow-md",
        compact && "p-3",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rank #{opponent.rank}
          </p>
          <h3 className="truncate text-base font-bold text-hoolclone-green-950">
            {opponent.displayName}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            @{opponent.slug}
            {opponent.favoriteTeam ? ` · ${opponent.favoriteTeam}` : ""}
          </p>
        </div>
        <MaturityBadge maturity={opponent.maturityLabel} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 font-semibold tabular-nums">
          {opponent.memoriesCount} memories
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-semibold tabular-nums">
          Score {opponent.learningScore}
        </span>
        {opponent.rivalryTag && (
          <span className="rounded-full bg-hoolclone-green-100 px-2 py-0.5 font-semibold text-hoolclone-green-900">
            {opponent.rivalryTag}
          </span>
        )}
        {opponent.featuredLabel && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900">
            {opponent.featuredLabel}
          </span>
        )}
        {(opponent.arenaWins != null || opponent.arenaLosses != null) && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-900">
            Arena {opponent.arenaWins ?? 0}W · {opponent.arenaLosses ?? 0}L
          </span>
        )}
      </div>

      {!opponent.clashEligible && (
        <p className="mt-2 text-[11px] text-amber-800">
          Thin clone — debate may be short until they store more memories.
        </p>
      )}

      <Link
        href={href}
        className={cn(
          "mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-hoolclone-green-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-hoolclone-green-800",
          !opponent.clashEligible && "opacity-90",
        )}
      >
        <Swords className="h-4 w-4" />
        Challenge
      </Link>
    </article>
  );
}

type ArenaQuickMatchProps = {
  opponent: ArenaOpponent | null;
  challengerSlug: string | null;
};

export function ArenaQuickMatch({
  opponent,
  challengerSlug,
}: ArenaQuickMatchProps) {
  if (!challengerSlug) {
    return (
      <section className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/80 p-6">
        <p className="text-sm font-semibold text-hoolclone-green-950">
          Connect and publish your clone to quick-match
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          You need a public profile before your clone can enter the arena.
        </p>
      </section>
    );
  }

  if (!opponent) {
    return (
      <section className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/80 p-6">
        <p className="text-sm text-muted-foreground">
          No rivals available for quick match yet.
        </p>
      </section>
    );
  }

  const href = buildClashHref(challengerSlug, opponent.slug);

  return (
    <section className="rounded-2xl border border-hoolclone-green-200/70 bg-gradient-to-br from-hoolclone-green-50 via-white to-amber-50/40 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-hoolclone-green-800">
            <Zap className="h-5 w-5" />
            <h2 className="text-lg font-bold">Quick match</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Random rival near your rank — ready for a Walrus-backed debate.
          </p>
          <p className="text-sm font-semibold text-hoolclone-green-950">
            vs {opponent.displayName} · rank #{opponent.rank}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-hoolclone-green-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-hoolclone-green-800"
        >
          <Swords className="h-4 w-4" />
          Enter bout
        </Link>
      </div>
    </section>
  );
}
