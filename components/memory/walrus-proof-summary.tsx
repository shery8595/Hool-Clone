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
        "rounded-2xl border border-hoolclone-green-200 bg-gradient-to-br from-hoolclone-green-50 to-white p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-hoolclone-green-100 p-2">
          <Database className="h-5 w-5 text-hoolclone-green-800" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-semibold text-hoolclone-green-900">
              Walrus proof panel
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each stored memory has an on-chain Walrus blob. Expand any receipt
              card below for blob ID, namespace, and write status.
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border bg-white/80 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Namespace
              </dt>
              <dd className="mt-1 font-mono text-xs break-all">{namespace}</dd>
            </div>
            <div className="rounded-xl border bg-white/80 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sample blob ID
              </dt>
              <dd className="mt-1 font-mono text-xs">
                {sampleBlob ? truncateMiddle(sampleBlob) : "—"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-hoolclone-green-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {stored.length} verified on Walrus
            </span>
            {pending.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {pending.length} writing
              </span>
            )}
            {failed.length > 0 && (
              <span className="inline-flex items-center gap-1 text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                {failed.length} failed
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
