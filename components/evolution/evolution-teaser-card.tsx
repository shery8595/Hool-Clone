"use client";

import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { MatchLabelWithFlags } from "@/components/match/team-label-with-flags";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import { cn } from "@/lib/utils";

type EvolutionTeaserCardProps = {
  memoryTimeMachine: MemoryTimeMachine | null;
  memoriesCount: number;
  href?: string;
  className?: string;
};

export function EvolutionTeaserCard({
  memoryTimeMachine,
  memoriesCount,
  href = "/evolution",
  className,
}: EvolutionTeaserCardProps) {
  const day1 = memoryTimeMachine?.phases.find((phase) => phase.id === "day1");
  const day7 = memoryTimeMachine?.phases.find((phase) => phase.id === "day7");
  const confidenceDelta =
    day1 && day7 ? day7.confidence - day1.confidence : null;
  const walrusReceipts =
    day7?.receipts.filter((receipt) => receipt.walrusBacked).length ?? 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[0_12px_40px_-12px_rgba(10,61,46,0.08)]",
        className,
      )}
    >
      <div className="h-1 bg-gradient-to-r from-slate-300 via-hoolclone-green-500 to-hoolclone-yellow-500" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-hoolclone-green-800">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-hoolclone-gray-900">
                Clone evolution
              </h2>
              <p className="text-sm text-muted-foreground">
                Day 1 vs Day 7 on the same matchup
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-hoolclone-green-200 bg-hoolclone-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-900">
            <Sparkles className="h-3 w-3" />
            Judge proof
          </span>
        </div>

        {memoryTimeMachine && day1 && day7 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <TeaserStat
              label="Matchup"
              value={<MatchLabelWithFlags label={memoryTimeMachine.matchLabel} size="sm" />}
            />
            <TeaserStat
              label="Confidence shift"
              value={
                confidenceDelta !== null && confidenceDelta !== 0
                  ? `${confidenceDelta > 0 ? "+" : ""}${confidenceDelta}%`
                  : `${day1.confidence}% → ${day7.confidence}%`
              }
            />
            <TeaserStat
              label="Walrus receipts (Day 7)"
              value={String(walrusReceipts)}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Train your clone with at least three memories to unlock the Day 1 vs
            Day 7 evolution proof.
          </p>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {memoriesCount} live {memoriesCount === 1 ? "memory" : "memories"}{" "}
          shaping recall before every prediction.
        </p>

        <Link
          href={href}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hoolclone-green-200 bg-hoolclone-green-50/50 px-4 py-3 text-sm font-semibold text-hoolclone-green-900 transition-colors hover:bg-hoolclone-green-50 sm:w-auto"
        >
          Open evolution proof
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function TeaserStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/15 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-hoolclone-green-950">
        {value}
      </p>
    </div>
  );
}
