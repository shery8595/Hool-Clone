import { Database, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecallSource } from "@/lib/mock/types";

type RecallSourceBadgeProps = {
  source: RecallSource;
  className?: string;
};

export function RecallSourceBadge({ source, className }: RecallSourceBadgeProps) {
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
      {isWalrus ? "Recalled from Walrus" : "Postgres fallback recall"}
    </span>
  );
}
