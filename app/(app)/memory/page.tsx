"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoolCloneLoader } from "@/components/brand/hoolclone-loader";
import { MemoryFilters, type MemoryFilter } from "@/components/memory/memory-filters";
import { MemoryPageHeader } from "@/components/memory/memory-page-header";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import { WalrusProofSummary } from "@/components/memory/walrus-proof-summary";
import { cacheKeys, invalidateCache } from "@/lib/api/data-cache";
import { fetchMemoriesRaw, retryMemoryWrite } from "@/lib/api/client";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import type { MemoryReceipt } from "@/lib/mock/types";
import { useUser } from "@/components/providers/user-provider";
import { useMemoryUnlock } from "@/lib/wallet/use-memory-unlock";

export default function MemoryPage() {
  const { me } = useUser();
  const { unlockMemories, unlocking, canUnlock } = useMemoryUnlock();
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [memories, setMemories] = useState<MemoryReceipt[]>([]);
  const [decryptedTexts, setDecryptedTexts] = useState<Record<string, string>>(
    {},
  );
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryErrors, setRetryErrors] = useState<Record<string, string>>({});
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

  const stats = useMemo(() => {
    const visible = memories.filter((m) => !m.hidden);
    return {
      total: visible.length,
      walrus: visible.filter((m) => m.storageStatus === "stored").length,
      public: visible.filter((m) => m.publicVisible).length,
      pending: visible.filter((m) => m.storageStatus === "pending").length,
      failed: visible.filter((m) => m.storageStatus === "failed").length,
    };
  }, [memories]);

  const encryptedIds = useMemo(
    () =>
      memories
        .filter((m) => m.encrypted && !decryptedTexts[m.id])
        .map((m) => m.id),
    [memories, decryptedTexts],
  );

  const unlockEncryptedMemories = useCallback(async () => {
    if (encryptedIds.length === 0) return;
    setUnlockError(null);
    try {
      const decrypted = await unlockMemories(encryptedIds);
      setDecryptedTexts((prev) => ({ ...prev, ...decrypted }));
    } catch (err) {
      setUnlockError(
        err instanceof Error ? err.message : "Failed to unlock memories",
      );
    }
  }, [encryptedIds, unlockMemories]);

  const togglePublic = useCallback((id: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, publicVisible: !m.publicVisible } : m,
      ),
    );
  }, []);

  const retryMemory = async (id: string) => {
    setRetryingId(id);
    setRetryErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, storageStatus: "pending" as const } : m,
      ),
    );
    try {
      const result = await retryMemoryWrite(id);
      setMemories((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                storageStatus: result.status as MemoryReceipt["storageStatus"],
                walrusBlobId: result.walrusBlobId ?? m.walrusBlobId,
                walrusJobId: result.walrusJobId ?? m.walrusJobId,
                walrusNamespace: result.walrusNamespace ?? m.walrusNamespace,
              }
            : m,
        ),
      );

      if (result.status === "failed") {
        setRetryErrors((prev) => ({
          ...prev,
          [id]: result.error ?? "Walrus write failed again. Try once more.",
        }));
      }

      if (me?.id) {
        invalidateCache(cacheKeys.memories(me.id));
      }
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to retry memory write";
      setRetryErrors((prev) => ({ ...prev, [id]: message }));
    } finally {
      setRetryingId(null);
    }
  };

  if (!me) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-12 text-center shadow-sm">
        <p className="text-lg font-semibold text-hoolclone-green-950">Memory</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your wallet to view Walrus memory receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-8">
      {hydrating && (
        <div className="flex items-center justify-center gap-2 rounded-full border border-border/50 bg-white/80 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing memories
        </div>
      )}

      <MemoryPageHeader
        displayName={me.displayName}
        namespace={me.memwalNamespace}
        maturityLabel={me.profile.cloneMaturityLabel}
        totalCount={stats.total}
        walrusCount={stats.walrus}
        publicCount={stats.public}
        backend={backend}
        pendingCount={stats.pending}
        failedCount={stats.failed}
      />

      {backend === "Walrus" && (
        <WalrusProofSummary
          namespace={me.memwalNamespace}
          memories={memories}
          backend={backend}
        />
      )}

      <section className="rounded-2xl border border-hoolclone-green-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-hoolclone-green-950">
              Receipt vault
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {stats.total}{" "}
              {stats.total === 1 ? "memory" : "memories"}
              {filter !== "all" ? ` · ${filter} filter` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-xl"
              onClick={() => void refresh()}
              disabled={hydrating}
            >
              <RefreshCw className={hydrating ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
            {encryptedIds.length > 0 && (
              <Button
                type="button"
                size="sm"
                className="shrink-0 rounded-xl"
                onClick={() => void unlockEncryptedMemories()}
                disabled={!canUnlock || unlocking}
              >
                <Lock className="h-3.5 w-3.5" />
                {unlocking ? "Unlocking…" : "Unlock with wallet"}
              </Button>
            )}
          </div>
        </div>

        <div className="border-b border-border px-4 py-3 sm:px-5">
          <MemoryFilters active={filter} onChange={setFilter} />
        </div>

        <div className="p-4 sm:p-5">
          {unlockError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {unlockError}
            </div>
          )}
          {stats.failed > 0 && backend === "Walrus" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {stats.failed} {stats.failed === 1 ? "memory" : "memories"} failed
              to write to Walrus. Tap <strong>Retry</strong> on each card.
            </div>
          )}

          {error ? (
            <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-12 text-center">
              <p className="text-sm text-rose-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void refresh()}
              >
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-6 py-12 text-center">
              {hydrating ? (
                <HoolCloneLoader size="md" label="Loading memories..." />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No memories match this filter.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((receipt) => (
                <MemoryReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  decryptedText={decryptedTexts[receipt.id]}
                  showActions
                  onClick={() => setExploreReceipt(receipt)}
                  onExplore={() => setExploreReceipt(receipt)}
                  onTogglePublic={() => togglePublic(receipt.id)}
                  onRetry={
                    receipt.storageStatus === "failed" && backend === "Walrus"
                      ? () => {
                          void retryMemory(receipt.id);
                        }
                      : undefined
                  }
                  retrying={retryingId === receipt.id}
                  retryError={retryErrors[receipt.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

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
