"use client";

import { useState } from "react";
import { Database, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";
import { formatMemorySourceLabel } from "@/lib/clone/memory-provenance";
import type { MemoryReceipt } from "@/lib/mock/types";
import { isPlaceholderBlobId } from "@/lib/walrus/fetch-blob";
import { cn } from "@/lib/utils";

type MemoryProvenancePanelProps = {
  memories: MemoryReceipt[];
  namespace?: string;
  citedMemoryIds?: Set<string>;
  className?: string;
};

function filterProofWindowMemories(memories: MemoryReceipt[]): MemoryReceipt[] {
  if (memories.length === 0) return [];
  const newest = Math.max(
    ...memories.map((m) => new Date(m.date).getTime()),
  );
  const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
  return memories
    .filter((m) => newest - new Date(m.date).getTime() <= fourDaysMs)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateBlob(blobId: string): string {
  if (blobId.length <= 20) return blobId;
  return `${blobId.slice(0, 10)}…${blobId.slice(-8)}`;
}

export function MemoryProvenancePanel({
  memories,
  namespace,
  citedMemoryIds,
  className,
}: MemoryProvenancePanelProps) {
  const [exploreReceipt, setExploreReceipt] = useState<MemoryReceipt | null>(
    null,
  );
  const windowMemories = filterProofWindowMemories(memories);

  if (windowMemories.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={cn("rounded-2xl border-0 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-hoolclone-green-700" />
            Memory Provenance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last 4 days of Walrus-backed memories — blob IDs, namespace, session
            source, and which judge proofs cite each receipt.
          </p>
          {namespace && (
            <p className="font-mono text-[11px] text-hoolclone-green-800">
              Namespace: {namespace}
            </p>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Type</th>
                <th className="pb-2 pr-3">Source</th>
                <th className="pb-2 pr-3">Memory</th>
                <th className="pb-2 pr-3">Blob ID</th>
                <th className="pb-2">Cited in</th>
              </tr>
            </thead>
            <tbody>
              {windowMemories.map((memory) => {
                const placeholder = memory.walrusBlobId
                  ? isPlaceholderBlobId(memory.walrusBlobId)
                  : false;
                const cited = citedMemoryIds?.has(memory.id);

                return (
                  <tr
                    key={memory.id}
                    className="border-b border-muted/60 last:border-0"
                  >
                    <td className="py-2.5 pr-3 align-top text-xs text-muted-foreground">
                      {formatDate(memory.date)}
                    </td>
                    <td className="py-2.5 pr-3 align-top text-xs font-medium uppercase">
                      {memory.type}
                    </td>
                    <td className="py-2.5 pr-3 align-top text-xs">
                      {formatMemorySourceLabel(memory.memorySource) ?? "—"}
                    </td>
                    <td className="max-w-[14rem] py-2.5 pr-3 align-top text-xs leading-snug">
                      <TextWithTeamFlags
                        text={
                          memory.text.length > 80
                            ? `${memory.text.slice(0, 80)}…`
                            : memory.text
                        }
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 pr-3 align-top">
                      {memory.walrusBlobId ? (
                        <button
                          type="button"
                          onClick={() => !placeholder && setExploreReceipt(memory)}
                          className={cn(
                            "font-mono text-[10px]",
                            placeholder
                              ? "cursor-default text-amber-700"
                              : "text-hoolclone-green-800 hover:underline",
                          )}
                        >
                          {placeholder
                            ? "placeholder"
                            : truncateBlob(memory.walrusBlobId)}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {memory.storageStatus === "pending"
                            ? "pending write"
                            : memory.storageStatus === "failed"
                              ? "write failed"
                              : "no blob yet"}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 align-top text-xs">
                      {cited ? (
                        <span className="rounded-full bg-hoolclone-yellow-100 px-2 py-0.5 font-semibold text-hoolclone-green-900">
                          Judge proof
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            Click a blob ID to open Walrus proof explorer
          </p>
        </CardContent>
      </Card>

      <WalrusBlobExplorerSheet
        receipt={exploreReceipt}
        open={Boolean(exploreReceipt)}
        onOpenChange={(open) => {
          if (!open) setExploreReceipt(null);
        }}
      />
    </>
  );
}
