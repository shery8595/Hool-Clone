import { CloneAvatar } from "@/components/clone/clone-avatar";
import { TypewriterText } from "@/components/clash/typewriter-text";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import type { ClashTurn } from "@/lib/clash/types";
import type { MemoryReceipt } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type ClashMessageProps = {
  turn: ClashTurn;
  displayName: string;
  animate?: boolean;
  onTypingComplete?: () => void;
  onExploreReceipt?: (receipt: MemoryReceipt) => void;
};

export function ClashMessage({
  turn,
  displayName,
  animate = false,
  onTypingComplete,
  onExploreReceipt,
}: ClashMessageProps) {
  const isA = turn.speaker === "A";

  return (
    <div
      className={cn("flex gap-3", isA ? "flex-row" : "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isA ? "bg-hoolclone-green-100" : "bg-amber-100",
        )}
      >
        <CloneAvatar size="sm" className="h-9 w-9 ring-0" />
      </div>

      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isA ? "items-start" : "items-end text-right",
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {displayName}&apos;s clone
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isA
              ? "rounded-tl-sm bg-hoolclone-green-100 text-hoolclone-green-900"
              : "rounded-tr-sm bg-amber-100 text-amber-950",
          )}
        >
          {animate ? (
            <TypewriterText text={turn.text} onComplete={onTypingComplete} />
          ) : (
            turn.text
          )}
        </div>

        {turn.citedReceipts.length > 0 && (
          <div className={cn("space-y-2", !isA && "items-end")}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Walrus receipts cited
            </p>
            {turn.citedReceipts.map((receipt) => (
              <MemoryReceiptCard
                key={receipt.id}
                receipt={receipt}
                compact
                highlighted
                onClick={
                  onExploreReceipt
                    ? () => onExploreReceipt(receipt)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
