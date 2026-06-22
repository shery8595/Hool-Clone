import Link from "next/link";
import { Database } from "lucide-react";
import type { MemoryReceipt } from "@/lib/mock/types";
import { formatDate } from "@/lib/mock/demo-user";
import { isPlaceholderBlobId } from "@/lib/walrus/fetch-blob";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  remembered: "Remembered",
  inferred: "Inferred",
  used: "Used",
  stored: "Stored",
};

export function MemoryGlanceRow({
  receipt,
  className,
}: {
  receipt: MemoryReceipt;
  className?: string;
}) {
  const isPlaceholder =
    receipt.walrusBlobId != null &&
    isPlaceholderBlobId(receipt.walrusBlobId);
  const walrusVerified =
    receipt.storageStatus === "stored" &&
    receipt.walrusBlobId &&
    !isPlaceholder;

  return (
    <Link
      href="/memory"
      className={cn(
        "block rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {receipt.number != null && (
            <span className="shrink-0 font-mono text-[10px] font-semibold text-hoolclone-green-800">
              #{receipt.number}
            </span>
          )}
          <span className="truncate rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {typeLabels[receipt.type] ?? receipt.type}
          </span>
        </div>
        <time
          dateTime={receipt.date}
          className="shrink-0 text-[10px] text-muted-foreground"
        >
          {formatDate(receipt.date)}
        </time>
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-hoolclone-gray-900">
        {receipt.text}
      </p>

      {walrusVerified && (
        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-hoolclone-green-700">
          <Database className="h-3 w-3 shrink-0" />
          Walrus verified
        </span>
      )}
      {isPlaceholder && (
        <span className="mt-1.5 inline-flex text-[10px] font-medium text-amber-700">
          Demo placeholder
        </span>
      )}
      {receipt.storageStatus === "pending" && (
        <span className="mt-1.5 text-[10px] font-medium text-amber-700">
          Writing to Walrus…
        </span>
      )}
    </Link>
  );
}
