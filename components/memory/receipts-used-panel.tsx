import { Database } from "lucide-react";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type ReceiptsUsedPanelProps = {
  receipts: MemoryReceipt[];
  title?: string;
  className?: string;
};

function receiptLabel(receipt: MemoryReceipt, index: number): string {
  if (receipt.number) {
    const letter = String.fromCharCode(65 + (index % 26));
    return `#${letter}${receipt.number}`;
  }
  return `#${index + 1}`;
}

export function ReceiptsUsedPanel({
  receipts,
  title = "Memory Receipts Used",
  className,
}: ReceiptsUsedPanelProps) {
  if (receipts.length === 0) return null;

  return (
    <div className={cn("rounded-xl border bg-white p-4", className)}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {receipts.map((receipt, index) => (
          <li key={receipt.id} className="flex gap-2 text-sm">
            <span className="shrink-0 font-mono text-xs font-bold text-hoolclone-green-800">
              {receiptLabel(receipt, index)}
            </span>
            <span className="text-foreground/90">{receipt.text}</span>
            {receipt.walrusBlobId && (
              <Database
                className="ml-auto h-3.5 w-3.5 shrink-0 text-hoolclone-green-700"
                aria-label="Walrus verified"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
