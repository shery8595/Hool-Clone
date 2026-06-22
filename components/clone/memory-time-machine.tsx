"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Columns2,
  Database,
  Flame,
  Sparkles,
  Target,
} from "lucide-react";
import { MaturityBadge } from "@/components/clone/clone-avatar";
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

type ViewMode = "timeline" | "split";

const PHASE_DOT: Record<TimeMachinePhaseId, string> = {
  day1: "bg-slate-400",
  day3: "bg-emerald-500",
  day4: "bg-hoolclone-green-600",
  day7: "bg-hoolclone-yellow-500",
};

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
        <span>Confidence</span>
        <span className="tabular-nums text-hoolclone-green-900">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-hoolclone-green-600 transition-all duration-500"
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
  const blobPreview =
    receipt.walrusBlobId && receipt.walrusBlobId.length > 20
      ? `${receipt.walrusBlobId.slice(0, 10)}…${receipt.walrusBlobId.slice(-8)}`
      : receipt.walrusBlobId;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-lg border px-2.5 py-1.5",
        receipt.walrusBacked
          ? "border-hoolclone-green-200 bg-hoolclone-green-50/50"
          : "border-border/60 bg-muted/20",
      )}
    >
      <div className="flex min-w-0 items-start gap-1.5">
        {receipt.walrusBacked && (
          <Database className="mt-0.5 h-3 w-3 shrink-0 text-hoolclone-green-700" />
        )}
        <p className="line-clamp-2 text-[11px] leading-snug text-hoolclone-gray-900">
          {receipt.summary}
        </p>
      </div>
      {(receipt.provenanceLabel || blobPreview) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-4">
          {receipt.provenanceLabel && (
            <p className="text-[9px] font-semibold text-hoolclone-green-700">
              {receipt.provenanceLabel}
            </p>
          )}
          {blobPreview && (
            <Link
              href="/memory"
              className="font-mono text-[9px] text-hoolclone-green-800/90 underline-offset-2 hover:underline"
            >
              {blobPreview}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function PhasePanel({ phase }: { phase: TimeMachineSnapshot }) {
  const isDay7 = phase.id === "day7";

  return (
    <div className="rounded-xl border border-border/50 bg-muted/15 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {phase.dayLabel}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-hoolclone-gray-900">
            {phase.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{phase.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MaturityBadge maturity={phase.maturityLabel as CloneMaturity} />
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/60">
            {phase.memoryCount} mem
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-3">
          <ConfidenceMeter value={phase.confidence} />
          <div className="rounded-lg border border-border/50 bg-white px-4 py-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3 w-3" />
              Clone pick
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-hoolclone-green-900">
              {phase.prediction}
            </p>
          </div>
          {phase.traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {phase.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-hoolclone-green-800 ring-1 ring-border/60"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <blockquote
            className={cn(
              "rounded-lg border bg-white px-3 py-2.5 text-sm leading-relaxed",
              isDay7
                ? "border-hoolclone-yellow-200 font-medium text-hoolclone-green-950"
                : "border-border/50 italic text-muted-foreground",
            )}
          >
            &ldquo;{phase.reasoning}&rdquo;
          </blockquote>

          {phase.knowledgeBullets.length > 0 && (
            <ul className="space-y-1.5">
              {phase.knowledgeBullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-md bg-white/80 px-2.5 py-1.5 text-xs text-foreground/85 ring-1 ring-border/40"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {phase.receipts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isDay7 ? "Walrus receipts cited" : "Memories shaping this take"}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
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

function TimelineStep({
  phase,
  active,
  onSelect,
}: {
  phase: TimeMachineSnapshot;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "relative flex min-h-[5.5rem] min-w-0 flex-col items-center justify-end gap-1 rounded-xl border-2 px-1 pb-2.5 pt-5 text-center transition-all",
        active
          ? "border-hoolclone-green-500 bg-white shadow-[0_4px_24px_rgba(10,61,46,0.12)] ring-2 ring-hoolclone-green-100"
          : "border-transparent bg-transparent hover:border-border/40 hover:bg-white/70",
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 top-3 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-white shadow-sm",
          PHASE_DOT[phase.id],
          active && "scale-110 ring-hoolclone-green-100",
        )}
      />
      <span className="text-sm font-bold text-hoolclone-gray-900">
        {phase.dayLabel}
      </span>
      <span className="line-clamp-1 w-full px-1 text-[10px] font-medium text-muted-foreground">
        {phase.title}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
          active
            ? "bg-hoolclone-green-100 text-hoolclone-green-800"
            : "bg-muted/80 text-muted-foreground",
        )}
      >
        {phase.memoryCount} mem
      </span>
    </button>
  );
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
      <button
        type="button"
        onClick={() => onChange("timeline")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
          mode === "timeline"
            ? "bg-white text-hoolclone-green-900 shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Clock className="h-3 w-3" />
        Timeline
      </button>
      <button
        type="button"
        onClick={() => onChange("split")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
          mode === "split"
            ? "bg-white text-hoolclone-green-900 shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Columns2 className="h-3 w-3" />
        Split view
      </button>
    </div>
  );
}

export function MemoryTimeMachine({ data, className }: MemoryTimeMachineProps) {
  const [activePhaseId, setActivePhaseId] = useState<TimeMachinePhaseId>(
    data.defaultPhase,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const activePhase =
    data.phases.find((phase) => phase.id === activePhaseId) ?? data.phases[0]!;
  const day1Phase = data.phases.find((phase) => phase.id === "day1") ?? data.phases[0]!;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[0_1px_2px_rgba(10,61,46,0.04),0_12px_40px_-12px_rgba(10,61,46,0.08)]",
        className,
      )}
    >
      <div className="h-1 bg-gradient-to-r from-hoolclone-green-700 via-hoolclone-green-500 to-hoolclone-yellow-500" />

      <div className="border-b border-border/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-hoolclone-green-800">
              <Clock className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-hoolclone-gray-900">
              Memory Time Machine
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hoolclone-green-200 bg-hoolclone-green-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-900">
              <Sparkles className="h-3 w-3 text-hoolclone-yellow-600" />
              {data.actualMemoriesCount} live memories
            </span>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Same fan, same matchup — scrub through clone versions to see how
          Walrus-backed memory changes predictions over time.{" "}
          <Link
            href={`/predict/${data.matchId}`}
            className="font-semibold text-hoolclone-green-800 underline decoration-hoolclone-green-300/80 underline-offset-2 hover:text-hoolclone-green-900"
          >
            {data.matchLabel}
          </Link>
        </p>
      </div>

      <div className="space-y-4 px-5 py-4 sm:px-6">
        {viewMode === "timeline" && (
          <div className="relative pt-1">
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-3 z-0 hidden h-0.5 bg-border sm:block"
              aria-hidden
            />
            <div
              role="tablist"
              aria-label="Memory time machine phases"
              className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-1"
            >
              {data.phases.map((phase) => (
                <TimelineStep
                  key={phase.id}
                  phase={phase}
                  active={phase.id === activePhaseId}
                  onSelect={() => setActivePhaseId(phase.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-muted/35 px-3 py-2.5 text-xs leading-relaxed text-hoolclone-gray-900">
          <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-yellow-600" />
          <p className="min-w-0">
            <strong className="font-semibold">Judge highlight:</strong>{" "}
            contradiction hunting + Walrus receipts visibly shift the
            clone&apos;s take from Day 1.
          </p>
        </div>

        {viewMode === "split" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Day 1 baseline
              </p>
              <PhasePanel phase={day1Phase} />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {activePhase.dayLabel} — selected phase
              </p>
              <div className="mb-3 flex flex-wrap gap-1">
                {data.phases
                  .filter((phase) => phase.id !== "day1")
                  .map((phase) => (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => setActivePhaseId(phase.id)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 transition-colors",
                        phase.id === activePhaseId
                          ? "bg-hoolclone-green-100 text-hoolclone-green-900 ring-hoolclone-green-300"
                          : "bg-white text-muted-foreground ring-border/60 hover:bg-muted/40",
                      )}
                    >
                      {phase.dayLabel}
                    </button>
                  ))}
              </div>
              <PhasePanel phase={activePhase} />
            </div>
          </div>
        ) : (
          <div role="tabpanel" aria-label={activePhase.dayLabel}>
            <PhasePanel phase={activePhase} />
          </div>
        )}
      </div>
    </section>
  );
}
