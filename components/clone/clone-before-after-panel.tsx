"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import type { MemoryTimeMachine, TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { CloneMaturity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type CloneBeforeAfterPanelProps = {
  data: MemoryTimeMachine;
  comparePhase?: TimeMachinePhaseId;
  className?: string;
};

function JudgeColumn({
  phase,
  label,
  accent,
}: {
  phase: MemoryTimeMachine["phases"][number];
  label: string;
  accent: "muted" | "highlight";
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col rounded-xl border p-4",
        accent === "highlight"
          ? "border-hoolclone-yellow-300 bg-gradient-to-br from-hoolclone-yellow-50/80 to-white"
          : "border-dashed border-muted-foreground/30 bg-muted/20",
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <CloneAvatar size="sm" />
        <MaturityBadge maturity={phase.maturityLabel as CloneMaturity} />
      </div>
      <p className="mt-2 text-sm font-semibold text-hoolclone-green-800">
        Confidence: {phase.confidence}%
      </p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {phase.knowledgeBullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span className="text-hoolclone-green-700">·</span>
            {bullet}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-2xl font-bold text-hoolclone-green-900">
        {phase.prediction}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {phase.reasoning}
      </p>
    </div>
  );
}

export function CloneBeforeAfterPanel({
  data,
  comparePhase = "day7",
  className,
}: CloneBeforeAfterPanelProps) {
  const day1 = data.phases.find((phase) => phase.id === "day1");
  const after = data.phases.find((phase) => phase.id === comparePhase);
  if (!day1 || !after) return null;

  const afterLabel =
    comparePhase === "day4"
      ? "Day 4 · Imitator clone"
      : comparePhase === "day3"
        ? "Day 3 · Learner clone"
        : "Day 7 · Contradiction hunter";

  const confidenceDelta = after.confidence - day1.confidence;
  const day1Receipts = day1.receipts.filter((r) => r.walrusBacked).length;
  const afterReceipts = after.receipts.filter((r) => r.walrusBacked).length;
  const receiptDelta = afterReceipts - day1Receipts;

  return (
    <Card className={cn("rounded-2xl border-0 shadow-sm", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-hoolclone-yellow-600" />
            Before / After — Judge View
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {confidenceDelta !== 0 && (
              <span className="rounded-full bg-hoolclone-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-900">
                {confidenceDelta > 0 ? "+" : ""}
                {confidenceDelta}% confidence
              </span>
            )}
            {receiptDelta > 0 && (
              <span className="rounded-full bg-hoolclone-yellow-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-900">
                {day1Receipts} → {afterReceipts} Walrus receipts
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Same matchup ({data.matchLabel}): how your clone reasons with almost
          no memory vs. days of Walrus-backed training.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <JudgeColumn phase={day1} label="Day 1 · Stranger clone" accent="muted" />
          <div className="flex shrink-0 justify-center text-hoolclone-green-700">
            <ArrowRight className="hidden h-6 w-6 lg:block" />
            <span className="text-xs font-semibold lg:hidden">evolves into</span>
          </div>
          <JudgeColumn phase={after} label={afterLabel} accent="highlight" />
        </div>
      </CardContent>
    </Card>
  );
}
