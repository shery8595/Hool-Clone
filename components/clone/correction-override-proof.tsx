"use client";

import { ArrowRight, Database, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CorrectionOverrideProofData } from "@/lib/clone/judge-proof-demo";
import { cn } from "@/lib/utils";

type CorrectionOverrideProofProps = {
  data: CorrectionOverrideProofData;
  className?: string;
};

export function CorrectionOverrideProof({
  data,
  className,
}: CorrectionOverrideProofProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-hoolclone-yellow-300/60 bg-gradient-to-br from-hoolclone-yellow-50/40 to-white shadow-sm",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="h-5 w-5 text-hoolclone-green-700" />
          Correction Override Proof
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.matchLabel}: a stale memory drove the wrong take — your
          correction reranked higher and changed the clone pick.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/80">
              Before correction
            </p>
            <p className="mt-2 text-xl font-bold text-rose-950">
              {data.staleTake.prediction}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.staleTake.reasoning}
            </p>
            <div className="mt-3 rounded-lg border border-rose-200/60 bg-white/70 px-3 py-2 text-xs text-rose-900/90">
              <span className="font-semibold">Disputed memory:</span>{" "}
              {data.staleTake.disputedMemory}
              <p className="mt-1 text-[10px] font-medium text-rose-700">
                {data.staleTake.disputedLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 px-2 text-center">
            <div className="rounded-full bg-hoolclone-yellow-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-hoolclone-gray-900">
              You corrected
            </div>
            <p className="max-w-[12rem] text-xs italic text-muted-foreground">
              &ldquo;{data.userCorrection}&rdquo;
            </p>
            <ArrowRight className="hidden h-5 w-5 text-hoolclone-green-700 lg:block" />
          </div>

          <div className="rounded-xl border border-hoolclone-green-300 bg-hoolclone-green-50/60 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-hoolclone-green-800">
              After correction
            </p>
            <p className="mt-2 text-xl font-bold text-hoolclone-green-950">
              {data.updatedTake.prediction}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.updatedTake.reasoning}
            </p>
            <div className="mt-3 rounded-lg border border-hoolclone-green-200 bg-white/80 px-3 py-2">
              <div className="flex items-start gap-2">
                <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hoolclone-green-700" />
                <div>
                  <p className="text-xs text-hoolclone-green-950">
                    &ldquo;{data.updatedTake.citedReceipt.text}&rdquo;
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-hoolclone-green-700">
                    {data.updatedTake.citedReceipt.provenanceLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
