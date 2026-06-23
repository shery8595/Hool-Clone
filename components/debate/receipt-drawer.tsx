"use client";

import { useEffect, useRef, useState } from "react";
import { Database, Lock, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { DebateReceiptFilters } from "@/components/memory/memory-filters";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type ReceiptDrawerProps = {
  memories: MemoryReceipt[];
  highlightedIds?: string[];
  scrollToId?: string | null;
  onClose?: () => void;
  showClose?: boolean;
  onRefresh?: () => void;
  className?: string;
};

export function ReceiptDrawer({
  memories,
  highlightedIds = [],
  scrollToId,
  onClose,
  showClose,
  onRefresh,
  className,
}: ReceiptDrawerProps) {
  const [filter, setFilter] = useState<"all" | "remembered" | "inferred">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!scrollToId) return;
    const node = cardRefs.current[scrollToId];
    node?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [scrollToId, memories.length]);

  const [correction, setCorrection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = memories.filter((m) => {
    if (filter === "all") return true;
    return m.type === filter || (filter === "remembered" && m.type === "used");
  });

  const walrusCount = memories.filter(
    (m) => m.storageStatus === "stored" && m.walrusBlobId,
  ).length;

  const submitCorrection = async () => {
    if (correction.trim().length < 8) return;
    setSubmitting(true);
    setError(null);
    try {
      const { submitDebateCorrection } = await import("@/lib/api/client");
      await submitDebateCorrection({
        correction,
        wrongMemoryId: selectedId ?? undefined,
      });
      setCorrection("");
      setSelectedId(null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to store correction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-hoolclone-green-100 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-border bg-gradient-to-r from-hoolclone-green-50/80 to-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-hoolclone-green-200 bg-white text-hoolclone-green-800">
              <Receipt className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-hoolclone-green-950">
                Memory receipts
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {memories.length} total · {highlightedIds.length} cited ·{" "}
                {walrusCount} on Walrus
              </p>
            </div>
          </div>
          {showClose && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-border px-4 py-3">
        <DebateReceiptFilters active={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <Database className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              No memories yet. Train your clone or debate to build receipts.
            </p>
          </div>
        ) : (
          filtered.map((receipt) => (
            <div
              key={receipt.id}
              ref={(node) => {
                cardRefs.current[receipt.id] = node;
              }}
            >
              <MemoryReceiptCard
                receipt={receipt}
                highlighted={
                  receipt.id === selectedId ||
                  highlightedIds.includes(receipt.id)
                }
                onClick={() =>
                  setSelectedId((id) => (id === receipt.id ? null : receipt.id))
                }
              />
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-border bg-hoolclone-green-50/30 p-4">
        {selectedId && (
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-muted-foreground ring-1 ring-border/60">
            Disputing a cited receipt? Your correction will be stored privately.
          </p>
        )}
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="Correct the clone — what did it get wrong?"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none ring-hoolclone-green-700/10 focus:ring-2"
        />
        <Button
          className="w-full rounded-xl"
          disabled={submitting || correction.trim().length < 8}
          onClick={() => void submitCorrection()}
        >
          <Database className="mr-2 h-4 w-4" />
          {submitting ? "Storing..." : "Store correction to Walrus"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" />
          Private — improves future clone behavior
        </p>
      </div>
    </aside>
  );
}
