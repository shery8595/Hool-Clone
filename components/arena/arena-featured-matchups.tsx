import Link from "next/link";
import { Swords, Sparkles } from "lucide-react";
import { ArenaOpponentCard } from "@/components/arena/arena-opponent-card";
import {
  buildJudgeDemoClashHref,
  pickFeaturedArenaOpponents,
  pickFeaturedArenaProfiles,
} from "@/lib/clash/featured-arena-opponents";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { ButtonLink } from "@/components/ui/button-link";
import type { LeaderboardEntry } from "@/lib/leaderboard/types";

type ArenaFeaturedMatchupsProps = {
  entries: LeaderboardEntry[];
  viewerEntry: LeaderboardEntry | null;
  challengerSlug: string | null;
};

export function ArenaFeaturedMatchups({
  entries,
  viewerEntry,
  challengerSlug,
}: ArenaFeaturedMatchupsProps) {
  const profiles = pickFeaturedArenaProfiles(entries);
  if (profiles.length === 0) return null;

  const challengable = pickFeaturedArenaOpponents(entries, viewerEntry);
  const judgeClashHref = buildJudgeDemoClashHref(true);

  return (
    <section className="space-y-4 rounded-2xl border border-hoolclone-green-200/80 bg-gradient-to-br from-hoolclone-green-50/80 via-white to-hoolclone-yellow-50/30 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-hoolclone-green-800">
            <Sparkles className="h-3.5 w-3.5" />
            Judge demo matchups
          </p>
          <h2 className="mt-1 text-lg font-bold text-hoolclone-green-950">
            Real Walrus clones — curated for proof
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            <code className="text-xs">hoolclone-demo</code> and{" "}
            <code className="text-xs">hoolclone-rival</code> each have 10 Mainnet
            memory blobs. No wallet needed to watch the judge clash.
          </p>
        </div>
        <ButtonLink href={judgeClashHref} className="shrink-0 gap-2">
          <Swords className="h-4 w-4" />
          Open judge clash
        </ButtonLink>
      </div>

      {challengerSlug ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {challengable.map((opponent) => (
            <ArenaOpponentCard
              key={opponent.userId}
              opponent={opponent}
              challengerSlug={challengerSlug}
            />
          ))}
          {challengerSlug === DEMO_SLUG && (
            <JudgeClashCard href={judgeClashHref} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <FeaturedProfileCard key={profile.userId} profile={profile} />
          ))}
          <JudgeClashCard href={judgeClashHref} />
        </div>
      )}
    </section>
  );
}

function FeaturedProfileCard({ profile }: { profile: LeaderboardEntry }) {
  return (
    <article className="flex flex-col rounded-2xl border border-hoolclone-green-200/60 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-hoolclone-green-800">
        Live Mainnet Walrus
      </p>
      <h3 className="mt-1 text-base font-bold text-hoolclone-green-950">
        {profile.displayName}
      </h3>
      <p className="text-xs text-muted-foreground">
        @{profile.slug} · {profile.memoriesCount} memories
      </p>
      <Link
        href={`/u/${profile.slug}`}
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-hoolclone-green-200 px-4 py-2.5 text-sm font-semibold text-hoolclone-green-900 transition hover:bg-hoolclone-green-50"
      >
        View profile
      </Link>
    </article>
  );
}

function JudgeClashCard({ href }: { href: string }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-hoolclone-green-300 bg-hoolclone-green-900 p-4 text-white shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-hoolclone-green-200">
          Two namespaces
        </p>
        <h3 className="mt-1 text-base font-bold">Portugal fan vs Colombia fan</h3>
        <p className="mt-2 text-sm text-hoolclone-green-100">
          Pre-seeded Clone Clash with Walrus receipts on both sides — the
          hackathon proof path.
        </p>
      </div>
      <ButtonLink
        href={href}
        variant="outline"
        className="mt-4 w-full justify-center rounded-xl border-white/90 bg-white text-hoolclone-green-900 hover:bg-hoolclone-green-50 [&_svg]:text-hoolclone-green-900"
      >
        <Swords className="h-4 w-4" />
        Watch judge clash
      </ButtonLink>
    </article>
  );
}
