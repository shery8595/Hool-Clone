"use client";

import Link from "next/link";
import { Clock, Database, Flame, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import type {
  MemoryTimeMachine,
  TimeMachineSnapshot,
} from "@/lib/clone/memory-time-machine-types";
import type { CloneMaturity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type MemoryTimeMachineProps = {
  data: MemoryTimeMachine;
  className?: string;
};

function ReceiptChip({
  receipt,
}: {
  receipt: TimeMachineSnapshot["receipts"][number];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        receipt.walrusBacked
          ? "bg-hoolclone-green-100 text-hoolclone-green-900"
          : "bg-muted text-muted-foreground",
      )}
    >
      {receipt.walrusBacked && <Database className="h-3 w-3" />}
      {receipt.summary.length > 72
        ? `${receipt.summary.slice(0, 72)}…`
        : receipt.summary}
    </span>
  );
}

function PhasePanel({ phase }: { phase: TimeMachineSnapshot }) {
  const isDay7 = phase.id === "day7";

  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        isDay7
          ? "border-hoolclone-yellow-300 bg-gradient-to-br from-hoolclone-yellow-50/80 to-white"
          : phase.id === "day3"
            ? "border-hoolclone-green-200 bg-hoolclone-green-50/40"
            : "border-dashed border-muted-foreground/30 bg-muted/20",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CloneAvatar size="lg" className="shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <MaturityBadge maturity={phase.maturityLabel as CloneMaturity} />
            <span className="text-xs text-muted-foreground">
              {phase.memoryCount} memories · {phase.confidence}% confidence
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{phase.subtitle}</p>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Clone pick
            </p>
            <p className="text-2xl font-bold text-hoolclone-green-900">
              {phase.prediction}
            </p>
          </div>

          <blockquote
            className={cn(
              "border-l-4 pl-3 text-sm leading-relaxed",
              isDay7
                ? "border-hoolclone-yellow-500 font-medium"
                : "border-muted-foreground/30 italic text-muted-foreground",
            )}
          >
            &ldquo;{phase.reasoning}&rdquo;
          </blockquote>

          <div className="flex flex-wrap gap-1.5">
            {phase.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-800 ring-1 ring-hoolclone-green-100"
              >
                {trait}
              </span>
            ))}
          </div>

          {phase.receipts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isDay7 ? "Walrus memory receipts cited" : "Early memories"}
              </p>
              <div className="flex flex-wrap gap-2">
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

export function MemoryTimeMachine({ data, className }: MemoryTimeMachineProps) {
  return (
    <Card className={cn("overflow-hidden rounded-2xl border-0 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base font-bold">
          <Clock className="h-5 w-5 text-hoolclone-green-700" />
          Memory Time Machine
          <span className="ml-auto flex items-center gap-1 rounded-full bg-hoolclone-yellow-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-900">
            <Sparkles className="h-3 w-3" />
            {data.actualMemoriesCount} live memories
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Same fan, same matchup — switch clone versions to see persistent memory
          change behavior over time.{" "}
          <Link
            href={`/predict/${data.matchId}`}
            className="font-semibold text-hoolclone-green-900 underline"
          >
            {data.matchLabel}
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={data.defaultPhase}>
          <TabsList className="mb-4 grid h-auto w-full grid-cols-3">
            {data.phases.map((phase) => (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className="flex flex-col gap-0.5 py-2 text-xs sm:text-sm"
              >
                <span className="font-bold">{phase.dayLabel}</span>
                <span className="hidden text-[10px] font-normal text-muted-foreground sm:inline">
                  {phase.title}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {data.phases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="mt-0">
              {phase.id === "day7" && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-hoolclone-yellow-100/60 px-3 py-2 text-xs text-hoolclone-green-900">
                  <Flame className="h-4 w-4 shrink-0" />
                  Judges: this phase shows contradiction hunting and Walrus-backed
                  receipts changing the clone&apos;s take.
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
