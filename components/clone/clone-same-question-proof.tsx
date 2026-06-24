"use client";

import { ArrowRight, Database, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";
import type { SameQuestionProofData } from "@/lib/clone/judge-proof-demo";
import { cn } from "@/lib/utils";

type CloneSameQuestionProofProps = {
  data: SameQuestionProofData;
  dataSource?: "live" | "fallback";
  className?: string;
};

function ProofSourceBadge({ source }: { source: "live" | "fallback" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        source === "live"
          ? "bg-hoolclone-green-100 text-hoolclone-green-900"
          : "bg-amber-100 text-amber-900",
      )}
    >
      {source === "live" ? "Live Walrus proof" : "Illustrative fallback"}
    </span>
  );
}

function AnswerColumn({
  phase,
  accent,
  citedReceipt,
}: {
  phase: SameQuestionProofData["day1"];
  accent: "muted" | "highlight";
  citedReceipt?: SameQuestionProofData["day4"]["citedReceipt"];
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
        {phase.label}
      </p>
      <p className="mt-3 text-2xl font-bold text-hoolclone-green-900">
        <TextWithTeamFlags text={phase.answer} size="sm" />
      </p>
      <p className="mt-1 text-sm font-semibold text-hoolclone-green-800">
        Confidence: {phase.confidence}%
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <TextWithTeamFlags text={phase.reasoning} size="sm" />
      </p>
      {citedReceipt ? (
        <div className="mt-4 space-y-2 border-t border-hoolclone-green-200/60 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Cited Walrus memory
          </p>
          <div className="rounded-lg border border-hoolclone-green-200 bg-hoolclone-green-50/70 px-3 py-2">
            <div className="flex items-start gap-2">
              {citedReceipt.walrusBacked && (
                <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-green-700" />
              )}
              <div className="min-w-0">
                <p className="text-xs leading-snug text-hoolclone-green-950">
                  &ldquo;
                  <TextWithTeamFlags text={citedReceipt.text} size="sm" />
                  &rdquo;
                </p>
                <p className="mt-1 text-[10px] font-semibold text-hoolclone-green-700">
                  {citedReceipt.provenanceLabel}
                </p>
                {citedReceipt.walrusBlobId && (
                  <p className="mt-1 font-mono text-[10px] text-hoolclone-green-800/90">
                    Blob:{" "}
                    {citedReceipt.walrusBlobId.length > 24
                      ? `${citedReceipt.walrusBlobId.slice(0, 12)}…${citedReceipt.walrusBlobId.slice(-10)}`
                      : citedReceipt.walrusBlobId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs italic text-muted-foreground">
          No memory receipts yet.
        </p>
      )}
    </div>
  );
}

export function CloneSameQuestionProof({
  data,
  dataSource = "live",
  className,
}: CloneSameQuestionProofProps) {
  return (
    <Card className={cn("rounded-2xl border-0 shadow-sm", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-hoolclone-yellow-600" />
            Same Question — Two Answers
          </CardTitle>
          <ProofSourceBadge source={dataSource} />
        </div>
        <p className="text-sm text-muted-foreground">
          Judges: identical prompt — Day 1 clone had no memories; Day 4+ recalls
          Walrus receipts written days earlier (see blob IDs below).
        </p>
        {dataSource === "fallback" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo fallback — run{" "}
            <code className="font-mono">npm run db:seed-demo-walrus</code> for
            live proof.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-hoolclone-green-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Question
          </p>
          <p className="mt-1 text-sm font-semibold text-hoolclone-green-950">
            <TextWithTeamFlags text={data.question} size="sm" />
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <AnswerColumn phase={data.day1} accent="muted" />
          <div className="flex shrink-0 justify-center text-hoolclone-green-700">
            <ArrowRight className="hidden h-6 w-6 lg:block" />
            <span className="text-xs font-semibold lg:hidden">after memory</span>
          </div>
          <AnswerColumn
            phase={data.day4}
            accent="highlight"
            citedReceipt={data.day4.citedReceipt}
          />
        </div>
      </CardContent>
    </Card>
  );
}
