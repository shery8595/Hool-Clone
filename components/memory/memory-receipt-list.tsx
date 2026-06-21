import Link from "next/link";
import { ArrowRight, Database, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MemoryReceiptCard } from "./memory-receipt-card";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type MemoryReceiptListProps = {
  receipts: MemoryReceipt[];
  title?: string;
  compact?: boolean;
  className?: string;
};

export function MemoryReceiptList({
  receipts,
  title = "Latest memory receipts",
  compact = false,
  className,
}: MemoryReceiptListProps) {
  const hasWalrusProof = receipts.some(
    (r) =>
      r.storageStatus === "stored" &&
      (r.walrusBlobId || r.walrusNamespace || r.walrusJobId),
  );
  const hasLineage = receipts.some((r) => r.lineage && r.lineage.length > 0);

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-white/90 p-0 ring-0",
        "bg-gradient-to-br from-white via-white to-hoolclone-green-50/30",
        "shadow-[6px_6px_20px_var(--btn-neu-shadow),-4px_-4px_16px_var(--btn-neu-highlight)]",
        className,
      )}
    >
      <div className="border-b border-hoolclone-green-100/90 bg-gradient-to-r from-hoolclone-green-100/35 via-white to-transparent px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-hoolclone-green-900 text-white shadow-sm">
              <Database className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-hoolclone-green-900">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {receipts.length} recent · Walrus-backed training history
              </p>
            </div>
          </div>
          <Link
            href="/memory"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/90",
              "bg-gradient-to-b from-white to-hoolclone-gray-50 px-2.5 py-1.5",
              "text-xs font-medium text-hoolclone-green-800",
              "shadow-[0_1px_2px_rgba(10,61,46,0.08)] transition-all",
              "hover:border-hoolclone-green-200 hover:shadow-sm",
            )}
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 px-4 py-3 sm:px-4">
        {receipts.map((receipt) => (
          <MemoryReceiptCard
            key={receipt.id}
            receipt={receipt}
            compact={compact}
            variant="dashboard"
          />
        ))}

        {(hasWalrusProof || hasLineage) && (
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="h-3 w-3 shrink-0 text-hoolclone-green-700" />
            Hover a receipt to expand Walrus proof
            {hasLineage ? " and write history" : " details"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
