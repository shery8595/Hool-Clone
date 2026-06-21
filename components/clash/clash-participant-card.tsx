import { CloneAvatar } from "@/components/clone/clone-avatar";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import type { ClashParticipant } from "@/lib/clash/types";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type ClashParticipantCardProps = {
  participant: ClashParticipant;
  side: "A" | "B";
  onExploreReceipt?: (receipt: MemoryReceipt) => void;
  className?: string;
};

export function ClashParticipantCard({
  participant,
  side,
  onExploreReceipt,
  className,
}: ClashParticipantCardProps) {
  const isA = side === "A";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isA ? "border-hoolclone-green-200" : "border-amber-200",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <CloneAvatar size="md" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Clone {side}
          </p>
          <p className="truncate font-bold">{participant.displayName}</p>
          <p className="text-xs text-muted-foreground">@{participant.handle}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Maturity</dt>
          <dd className="font-medium">{participant.maturityLabel}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Namespace</dt>
          <dd className="max-w-[60%] truncate font-mono text-[10px]">
            {participant.namespace}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Recalled</dt>
          <dd className="font-medium">{participant.receipts.length} public memories</dd>
        </div>
      </dl>

      {participant.receipts.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Top Walrus recalls
          </p>
          {participant.receipts.slice(0, 2).map((receipt) => (
            <MemoryReceiptCard
              key={receipt.id}
              receipt={receipt}
              compact
              onClick={
                onExploreReceipt ? () => onExploreReceipt(receipt) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
