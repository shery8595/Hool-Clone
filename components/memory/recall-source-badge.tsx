import { Database, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecallSource } from "@/lib/mock/types";
import type { MessageRecallBackend } from "@/lib/telegram/message-recall-backend";

type RecallSourceBadgeProps = {
  source: RecallSource | MessageRecallBackend;
  className?: string;
};

export function RecallSourceBadge({ source, className }: RecallSourceBadgeProps) {
  if (source === "none") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground",
          className,
        )}
      >
        <HardDrive className="h-3 w-3" />
        No Walrus recall
      </span>
    );
  }

  const isWalrus = source === "walrus";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isWalrus
          ? "bg-hoolclone-green-100 text-hoolclone-green-900"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {isWalrus ? (
        <Database className="h-3 w-3" />
      ) : (
        <HardDrive className="h-3 w-3" />
      )}
      {isWalrus ? "Walrus: Verified recall" : "Postgres fallback recall"}
    </span>
  );
}
