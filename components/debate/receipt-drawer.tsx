"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, X, Database, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { DebateReceiptFilters } from "@/components/memory/memory-filters";
import type { MemoryReceipt } from "@/lib/mock/types";

type ReceiptDrawerProps = {
  memories: MemoryReceipt[];
  highlightedIds?: string[];
  scrollToId?: string | null;
  onClose?: () => void;
  showClose?: boolean;
  onRefresh?: () => void;
};

export function ReceiptDrawer({
  memories,
  highlightedIds = [],
  scrollToId,
  onClose,
  showClose,
  onRefresh,
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
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-hoolclone-green-700" />
          <h2 className="font-semibold">Memory Receipts</h2>
        </div>
        {showClose && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="border-b border-border p-4">
        <DebateReceiptFilters active={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No memories yet. Train your clone or debate to build receipts.
          </p>
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

      <div className="space-y-3 border-t border-border p-4">
        {selectedId && (
          <p className="text-xs text-muted-foreground">
            Marking receipt as disputed when you store a correction.
          </p>
        )}
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="Correct the clone..."
          rows={2}
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm"
        />
        <Button
          className="w-full"
          disabled={submitting || correction.trim().length < 8}
          onClick={() => void submitCorrection()}
        >
          <Database className="mr-2 h-4 w-4" />
          {submitting ? "Storing..." : "Store correction"}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="flex items-center gap-1 text-center text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Corrections are private and improve future clone behavior.
        </p>
      </div>
    </aside>
  );
}
