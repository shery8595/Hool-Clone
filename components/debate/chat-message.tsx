import { User } from "lucide-react";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";
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
      <div className="shrink-0 pt-1">
        {isUser ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white shadow-sm">
            <User className="h-4 w-4 text-hoolclone-green-800" />
          </div>
        ) : (
          <CloneAvatar size="sm" className="h-9 w-9 ring-2 ring-hoolclone-green-700/15" />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[min(85%,32rem)] space-y-2",
          isUser ? "items-end text-right" : "items-start",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isUser ? "text-right text-muted-foreground" : "text-hoolclone-green-800",
          )}
        >
          {isUser ? "You" : "Your clone"}
        </p>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-tr-md border border-hoolclone-green-200/80 bg-white text-foreground"
              : "rounded-tl-md border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 to-white text-hoolclone-green-950",
          )}
        >
          <TextWithTeamFlags text={message.text} size="sm" />
        </div>

        {!isUser && citedReceipts.length > 0 && (
          <div className="space-y-2 rounded-xl border border-dashed border-hoolclone-green-200/80 bg-hoolclone-green-50/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-hoolclone-green-800">
              Walrus receipts cited
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

        <p className="text-[11px] text-muted-foreground">{message.timestamp}</p>
      </div>
    </div>
  );
}
