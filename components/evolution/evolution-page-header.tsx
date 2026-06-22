import Link from "next/link";
import { Calendar, Clock, Globe, Swords } from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { formatDate } from "@/lib/mock/demo-user";
import type { CloneMaturity } from "@/lib/mock/types";

type EvolutionPageHeaderProps = {
  displayName: string;
  handle: string;
  joinedAt: string;
  maturityLabel: CloneMaturity;
  level: number;
  slug?: string;
  isPublicView?: boolean;
  clashOpponent?: string;
};

export function EvolutionPageHeader({
  displayName,
  handle,
  joinedAt,
  maturityLabel,
  level,
  slug,
  isPublicView = false,
  clashOpponent = "hoolclone-rival",
}: EvolutionPageHeaderProps) {
  return (
    <header className="rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CloneAvatar size="lg" />
          <div className="space-y-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
                {isPublicView ? "Public judge proof" : "Your clone evolution"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-950">
                Day 1 vs Day 7 — Walrus memory proof
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                @{handle} · {displayName}&apos;s HoolClone
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                <Clock className="h-3.5 w-3.5" />
                Evolution timeline
              </span>
              <MaturityBadge maturity={maturityLabel} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border/60">
                Level {level}
              </span>
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

        {slug && isPublicView && (
          <nav className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href={`/u/${slug}`}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-muted/40"
            >
              Public profile
            </Link>
            <Link
              href={`/u/${slug}/clash?opponent=${encodeURIComponent(clashOpponent)}`}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-border/60 transition-colors hover:bg-muted/40"
            >
              <Swords className="h-3.5 w-3.5" />
              Clone clash
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
