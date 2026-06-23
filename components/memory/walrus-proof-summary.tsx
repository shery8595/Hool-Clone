"use client";

import { CheckCircle2, Database, Loader2, XCircle } from "lucide-react";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type WalrusProofSummaryProps = {
  namespace: string;
  memories: MemoryReceipt[];
  backend: "Local" | "Walrus";
  className?: string;
};

function truncateMiddle(value: string, head = 10, tail = 6): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function WalrusProofSummary({
  namespace,
  memories,
  backend,
  className,
}: WalrusProofSummaryProps) {
  if (backend !== "Walrus") return null;

  const stored = memories.filter((m) => m.storageStatus === "stored");
  const pending = memories.filter((m) => m.storageStatus === "pending");
  const failed = memories.filter((m) => m.storageStatus === "failed");
  const sampleBlob = stored.find((m) => m.walrusBlobId)?.walrusBlobId;

  return (
    <section
      className={cn(
        "rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-r from-hoolclone-green-50/80 via-white to-emerald-50/30 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hoolclone-green-200 bg-white text-hoolclone-green-800 shadow-sm">
            <Database className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-hoolclone-green-950">
              Walrus on-chain proof
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap any receipt to explore blob ID, namespace, and write status.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs sm:justify-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-semibold text-hoolclone-green-800 ring-1 ring-hoolclone-green-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {stored.length} verified
          </span>
          {pending.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-900">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {pending.length} pending
            </span>
          )}
          {failed.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-900">
              <XCircle className="h-3.5 w-3.5" />
              {failed.length} failed
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Namespace
          </dt>
          <dd className="mt-1 font-mono text-xs break-all text-hoolclone-green-900">
            {namespace}
          </dd>
        </div>
        <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sample blob ID
          </dt>
          <dd className="mt-1 font-mono text-xs text-hoolclone-green-900">
            {sampleBlob ? truncateMiddle(sampleBlob) : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
