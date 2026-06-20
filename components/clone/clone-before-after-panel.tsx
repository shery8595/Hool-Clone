"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import type { CloneMaturity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type CloneBeforeAfterPanelProps = {
  data: MemoryTimeMachine;
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
      <p className="mt-3 text-2xl font-bold text-hoolclone-green-900">
        {phase.prediction}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {phase.reasoning}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {phase.memoryCount} memories · {phase.confidence}% confidence
      </p>
    </div>
  );
}

export function CloneBeforeAfterPanel({
  data,
  className,
}: CloneBeforeAfterPanelProps) {
  const day1 = data.phases.find((phase) => phase.id === "day1");
  const day7 = data.phases.find((phase) => phase.id === "day7");
  if (!day1 || !day7) return null;

  return (
    <Card className={cn("rounded-2xl border-0 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-hoolclone-yellow-600" />
          Before / After — Judge View
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Same matchup ({data.matchLabel}): how your clone reasons with almost
          no memory vs. a week of Walrus-backed training.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <JudgeColumn phase={day1} label="Day 1 · Stranger clone" accent="muted" />
          <div className="flex shrink-0 justify-center text-hoolclone-green-700">
            <ArrowRight className="hidden h-6 w-6 lg:block" />
            <span className="text-xs font-semibold lg:hidden">evolves into</span>
          </div>
          <JudgeColumn
            phase={day7}
            label="Day 7 · Full HoolClone"
            accent="highlight"
          />
        </div>
      </CardContent>
    </Card>
  );
}
