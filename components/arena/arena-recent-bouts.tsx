"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import type { SavedClashBout } from "@/lib/db/clash-bouts";
import { formatMatchTitle } from "@/lib/mock/matches";

export function ArenaRecentBouts() {
  const [bouts, setBouts] = useState<SavedClashBout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/arena/recent")
      .then((response) => (response.ok ? response.json() : { bouts: [] }))
      .then((data: { bouts?: SavedClashBout[] }) => {
        setBouts(data.bouts ?? []);
      })
      .catch(() => setBouts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading recent bouts…</p>
      </section>
    );
  }

  if (bouts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-hoolclone-green-200 bg-white/70 p-6">
        <h2 className="text-lg font-bold text-hoolclone-green-950">
          Recent arena bouts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No bouts yet — be the first to challenge a rival clone.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-hoolclone-green-950">
          Recent arena bouts
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest clone vs clone debates from the arena.
        </p>
      </div>
      <ul className="space-y-3">
        {bouts.map((bout) => {
          const matchLabel = formatMatchTitle(bout.debate.match);
          const winner =
            bout.verdict?.winnerSlug ??
            (bout.verdict?.winner === "A"
              ? bout.slugA
              : bout.verdict?.winner === "B"
                ? bout.slugB
                : null);

          return (
            <li
              key={bout.id}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-hoolclone-green-50/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-hoolclone-green-950">
                  @{bout.slugA} vs @{bout.slugB}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {matchLabel}
                </p>
                {bout.verdict && (
                  <p className="mt-1 text-xs text-hoolclone-green-800">
                    {bout.verdict.summary}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {bout.verdict && (
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                    {bout.verdict.scoreA}–{bout.verdict.scoreB}
                    {winner ? ` · @${winner}` : " · Draw"}
                  </span>
                )}
                <Link
                  href={`/u/${bout.slugA}/clash?opponent=${encodeURIComponent(bout.slugB)}&match=${encodeURIComponent(bout.matchId)}`}
                  className="inline-flex items-center gap-1 rounded-full bg-hoolclone-green-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-hoolclone-green-800"
                >
                  <Swords className="h-3.5 w-3.5" />
                  Replay
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
