import { User } from "lucide-react";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import { MemoryReceiptCard } from "@/components/memory/memory-receipt-card";
import { cn } from "@/lib/utils";
import type { DebateMessage } from "@/lib/mock/types";

type ChatMessageProps = {
  message: DebateMessage;
  onReceiptClick?: (receiptId: string) => void;
};

export function ChatMessage({ message, onReceiptClick }: ChatMessageProps) {
  const isUser = message.role === "user";
  const citedReceipts = message.citedReceipts ?? [];

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-muted" : "bg-hoolclone-green-100",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-muted-foreground" />
        ) : (
          <CloneAvatar size="sm" className="h-8 w-8 ring-0" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isUser ? "items-end text-right" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-muted text-foreground"
              : "rounded-tl-sm bg-hoolclone-green-100 text-hoolclone-green-900",
          )}
        >
          {message.text}
        </div>

        {!isUser && citedReceipts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cited receipts
            </p>
            {citedReceipts.map((receipt) => (
              <MemoryReceiptCard
                key={receipt.id}
                receipt={receipt}
                compact
                highlighted
                onClick={
                  onReceiptClick
                    ? () => onReceiptClick(receipt.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{message.timestamp}</p>
      </div>
    </div>
  );
}
