"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Database } from "lucide-react";
import { HoolCloneLoader } from "@/components/brand/hoolclone-loader";
import { MemoryFilters, type MemoryFilter } from "@/components/memory/memory-filters";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import { WalrusProofSummary } from "@/components/memory/walrus-proof-summary";
import { cacheKeys } from "@/lib/api/data-cache";
import { fetchMemoriesRaw, retryMemoryWrite } from "@/lib/api/client";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import type { MemoryReceipt } from "@/lib/mock/types";
import { useUser } from "@/components/providers/user-provider";

export default function MemoryPage() {
  const { me } = useUser();
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [memories, setMemories] = useState<MemoryReceipt[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [exploreReceipt, setExploreReceipt] = useState<MemoryReceipt | null>(
    null,
  );

  const { data, hydrating, error, refresh } = useCachedData(
    me?.id ? cacheKeys.memories(me.id) : null,
    fetchMemoriesRaw,
    { memories: [], backend: "Local" as const },
  );

  const backend = data?.backend ?? "Local";

  useEffect(() => {
    if (data?.memories) setMemories(data.memories);
  }, [data?.memories]);

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      if (m.hidden && filter !== "hidden") return false;
      if (filter === "all") return !m.hidden;
      if (filter === "hidden") return m.hidden;
      if (filter === "used") return m.usedInPrediction;
      return m.type === filter;
    });
  }, [memories, filter]);

  const togglePublic = useCallback((id: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, publicVisible: !m.publicVisible } : m,
      ),
    );
  }, []);

  const failedCount = useMemo(
    () => memories.filter((m) => m.storageStatus === "failed").length,
    [memories],
  );

  const retryMemory = async (id: string) => {
    setRetryingId(id);
    try {
      const result = await retryMemoryWrite(id);
      setMemories((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                storageStatus: result.status as MemoryReceipt["storageStatus"],
              }
            : m,
        ),
      );
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  if (!me) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-12 text-center">
        <p className="text-muted-foreground">
          Connect your wallet to view memory receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-hoolclone-green-700" />
        <h1 className="text-2xl font-bold">Memory</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Private memory receipts and controls. Review what your clone remembers
        and what appears on your public profile. Backend: {backend}.
        {hydrating && " · Syncing..."}
      </p>

      <WalrusProofSummary
        namespace={me.memwalNamespace}
        memories={memories}
        backend={backend}
      />

      <MemoryFilters active={filter} onChange={setFilter} />

      {failedCount > 0 && backend === "Walrus" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {failedCount} {failedCount === 1 ? "memory" : "memories"} failed to
          write to Walrus. Use Retry on each card or check{" "}
          <code className="text-xs">GET /api/admin/memwal-health</code>.
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-hoolclone-green-900 underline"
            onClick={() => void refresh()}
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted-foreground">
          {hydrating ? (
            <HoolCloneLoader size="md" label="Loading memories..." />
          ) : (
            "No memories match this filter."
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((receipt) => (
            <MemoryReceiptCard
              key={receipt.id}
              receipt={receipt}
              showActions
              onClick={() => setExploreReceipt(receipt)}
              onExplore={() => setExploreReceipt(receipt)}
              onTogglePublic={() => togglePublic(receipt.id)}
              onRetry={
                receipt.storageStatus === "failed" && backend === "Walrus"
                  ? () => void retryMemory(receipt.id)
                  : undefined
              }
              retrying={retryingId === receipt.id}
            />
          ))}
        </div>
      )}

      <WalrusBlobExplorerSheet
        receipt={exploreReceipt}
        open={Boolean(exploreReceipt)}
        onOpenChange={(open) => {
          if (!open) setExploreReceipt(null);
        }}
      />
    </div>
  );
}
