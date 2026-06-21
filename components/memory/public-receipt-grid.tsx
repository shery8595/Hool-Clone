"use client";

import { useState } from "react";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { WalrusBlobExplorerSheet } from "@/components/memory/walrus-blob-explorer-sheet";
import type { MemoryReceipt } from "@/lib/mock/types";

type PublicReceiptGridProps = {
  receipts: MemoryReceipt[];
};

export function PublicReceiptGrid({ receipts }: PublicReceiptGridProps) {
  const [exploreReceipt, setExploreReceipt] = useState<MemoryReceipt | null>(
    null,
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {receipts.map((receipt) => (
          <MemoryReceiptCard
            key={receipt.id}
            receipt={receipt}
            compact
            onClick={() => setExploreReceipt(receipt)}
            onExplore={() => setExploreReceipt(receipt)}
          />
        ))}
      </div>

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
