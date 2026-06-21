"use client";

import Link from "next/link";
import {
  Clock,
  Database,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import type {
  MemoryTimeMachine,
  TimeMachinePhaseId,
  TimeMachineSnapshot,
} from "@/lib/clone/memory-time-machine-types";
import type { CloneMaturity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type MemoryTimeMachineProps = {
  data: MemoryTimeMachine;
  className?: string;
};

const PHASE_ACCENT: Record<
  TimeMachinePhaseId,
  { ring: string; panel: string; dot: string }
> = {
  day1: {
    ring: "ring-slate-200",
    panel: "from-slate-50/90 to-white border-slate-200/80",
    dot: "bg-slate-400",
  },
  day3: {
    ring: "ring-hoolclone-green-200",
    panel: "from-hoolclone-green-50/70 to-white border-hoolclone-green-200/80",
    dot: "bg-hoolclone-green-500",
  },
  day4: {
    ring: "ring-hoolclone-green-300",
    panel: "from-hoolclone-green-50 to-white border-hoolclone-green-300/80",
    dot: "bg-hoolclone-green-600",
  },
  day7: {
    ring: "ring-hoolclone-yellow-400",
    panel:
      "from-hoolclone-yellow-50/90 via-white to-hoolclone-green-50/30 border-hoolclone-yellow-300/90",
    dot: "bg-hoolclone-yellow-500",
  },
};

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-muted-foreground">Clone confidence</span>
        <span className="tabular-nums text-hoolclone-green-900">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hoolclone-green-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-hoolclone-green-600 to-hoolclone-green-400 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function ReceiptChip({
  receipt,
}: {
  receipt: TimeMachineSnapshot["receipts"][number];
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left",
        receipt.walrusBacked
          ? "border-hoolclone-green-200/80 bg-hoolclone-green-50/60"
          : "border-border/80 bg-white/70",
      )}
    >
      {receipt.walrusBacked ? (
        <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-green-700" />
      ) : (
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
      )}
      <p className="text-[11px] leading-snug text-hoolclone-green-900">
        {receipt.summary.length > 96
          ? `${receipt.summary.slice(0, 96)}…`
          : receipt.summary}
      </p>
    </div>
  );
}

function PhasePanel({ phase }: { phase: TimeMachineSnapshot }) {
  const accent = PHASE_ACCENT[phase.id];
  const isDay7 = phase.id === "day7";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm",
        accent.panel,
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,220px)_1fr]">
        {/* Identity column */}
        <div className="border-b border-black/5 bg-white/40 p-5 lg:border-b-0 lg:border-r">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <CloneAvatar
              size="lg"
              className={cn("ring-4", accent.ring)}
            />
            <div className="mt-4 w-full space-y-3">
              <MaturityBadge
                maturity={phase.maturityLabel as CloneMaturity}
                className="mx-auto lg:mx-0"
              />
              <ConfidenceMeter value={phase.confidence} />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-hoolclone-green-900">
                  {phase.memoryCount}
                </span>{" "}
                memories at this point
              </p>
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {phase.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{phase.subtitle}</p>
          </div>

          {phase.knowledgeBullets.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {phase.knowledgeBullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm text-foreground/85"
                >
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-green-700" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <div className="flex min-w-[140px] flex-col justify-center rounded-xl border border-hoolclone-green-200/60 bg-white/80 px-5 py-4 shadow-sm">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Target className="h-3 w-3" />
                Clone pick
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-hoolclone-green-900">
                {phase.prediction}
              </p>
            </div>

            <blockquote
              className={cn(
                "flex-1 rounded-xl border-l-4 bg-white/50 px-4 py-3 text-sm leading-relaxed",
                isDay7
                  ? "border-hoolclone-yellow-500 font-medium text-hoolclone-green-950"
                  : "border-hoolclone-green-300/60 italic text-muted-foreground",
              )}
            >
              &ldquo;{phase.reasoning}&rdquo;
            </blockquote>
          </div>

          {phase.traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {phase.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-hoolclone-green-900/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-800 ring-1 ring-hoolclone-green-100"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}

          {phase.receipts.length > 0 && (
            <div className="space-y-2 border-t border-black/5 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isDay7 ? "Walrus receipts cited" : "Memories shaping this take"}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {phase.receipts.map((receipt, i) => (
                  <ReceiptChip key={`${phase.id}-${i}`} receipt={receipt} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineTab({
  phase,
  isLast,
}: {
  phase: TimeMachineSnapshot;
  isLast: boolean;
}) {
  const accent = PHASE_ACCENT[phase.id];

  return (
    <TabsTrigger
      value={phase.id}
      className={cn(
        "group relative flex h-auto min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border border-transparent px-2 py-3 text-center transition-all",
        "data-active:border-hoolclone-green-300 data-active:bg-white data-active:shadow-md data-active:shadow-hoolclone-green-900/5",
        "hover:bg-white/60",
      )}
    >
      {!isLast && (
        <span
          className="absolute top-1/2 -right-px hidden h-px w-2 -translate-y-1/2 bg-border sm:block lg:w-3"
          aria-hidden
        />
      )}
      <span
        className={cn(
          "flex h-2 w-2 rounded-full ring-2 ring-white transition-transform group-data-active:scale-125",
          accent.dot,
        )}
      />
      <span className="text-sm font-bold text-hoolclone-gray-900">
        {phase.dayLabel}
      </span>
      <span className="line-clamp-1 text-[10px] font-medium text-muted-foreground">
        {phase.title}
      </span>
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-muted-foreground group-data-active:bg-hoolclone-green-100 group-data-active:text-hoolclone-green-800">
        {phase.memoryCount} mem
      </span>
    </TabsTrigger>
  );
}

export function MemoryTimeMachine({ data, className }: MemoryTimeMachineProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-hoolclone-green-100/80 shadow-sm",
        className,
      )}
    >
      <div className="h-1 bg-gradient-to-r from-hoolclone-green-700 via-hoolclone-green-500 to-hoolclone-yellow-500" />

      <CardHeader className="space-y-3 bg-gradient-to-b from-hoolclone-green-50/50 to-transparent pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hoolclone-green-100 text-hoolclone-green-800">
              <Clock className="h-4 w-4" />
            </span>
            Memory Time Machine
          </CardTitle>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hoolclone-yellow-300/60 bg-hoolclone-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-900">
            <Sparkles className="h-3 w-3 text-hoolclone-yellow-600" />
            {data.actualMemoriesCount} live memories
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Same fan, same matchup — scrub through clone versions to see how
          Walrus-backed memory changes predictions over time.{" "}
          <Link
            href={`/predict/${data.matchId}`}
            className="font-semibold text-hoolclone-green-800 underline decoration-hoolclone-green-300 underline-offset-2 hover:text-hoolclone-green-900"
          >
            {data.matchLabel}
          </Link>
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue={data.defaultPhase}>
          <TabsList className="mb-5 grid h-auto w-full grid-cols-2 gap-2 bg-hoolclone-green-50/50 p-1.5 sm:grid-cols-4">
            {data.phases.map((phase, index) => (
              <TimelineTab
                key={phase.id}
                phase={phase}
                isLast={index === data.phases.length - 1}
              />
            ))}
          </TabsList>

          {data.phases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="mt-0">
              {phase.id === "day7" && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-hoolclone-yellow-200 bg-hoolclone-yellow-50/80 px-4 py-3 text-xs leading-relaxed text-hoolclone-green-900">
                  <Flame className="mt-0.5 h-4 w-4 shrink-0 text-hoolclone-yellow-600" />
                  <span>
                    <strong className="font-semibold">Judge highlight:</strong>{" "}
                    contradiction hunting + Walrus receipts visibly shift the
                    clone&apos;s take from Day 1.
                  </span>
                </div>
              )}
              <PhasePanel phase={phase} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
