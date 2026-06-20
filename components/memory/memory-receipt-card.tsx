import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RecallSourceBadge } from "@/components/memory/recall-source-badge";
import { cn } from "@/lib/utils";
import type { MemoryReceipt } from "@/lib/mock/types";
import { formatDate } from "@/lib/mock/demo-user";
import { Database, ArrowRight, Loader2, AlertCircle, RotateCcw } from "lucide-react";

const typeLabels: Record<string, string> = {
  remembered: "REMEMBERED",
  inferred: "INFERRED",
  used: "USED MEMORY",
  stored: "Stored on Walrus Memory",
};

type MemoryReceiptCardProps = {
  receipt: MemoryReceipt;
  highlighted?: boolean;
  compact?: boolean;
  variant?: "default" | "dashboard";
  showActions?: boolean;
  onTogglePublic?: () => void;
  onRetry?: () => void;
  retrying?: boolean;
  onClick?: () => void;
};

export function MemoryReceiptCard({
  receipt,
  highlighted = false,
  compact = false,
  variant = "default",
  showActions = false,
  onTogglePublic,
  onRetry,
  retrying = false,
  onClick,
}: MemoryReceiptCardProps) {
  const hasWalrusProof = Boolean(
    receipt.walrusBlobId || receipt.walrusNamespace || receipt.walrusJobId,
  );
  const isDashboard = variant === "dashboard";
  const revealProofOnHover = !compact && hasWalrusProof;

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick || revealProofOnHover ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "group rounded-xl border transition-all duration-300 ease-out",
        revealProofOnHover &&
          "hover:-translate-y-0.5 hover:border-hoolclone-green-300 hover:shadow-md hover:shadow-hoolclone-green-900/8",
        onClick && "cursor-pointer hover:border-hoolclone-green-700/40",
        highlighted
          ? "border-hoolclone-yellow-500 bg-hoolclone-yellow-500/10 p-4"
          : isDashboard
            ? "border-hoolclone-green-100/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(10,61,46,0.04)]"
            : "border-border bg-white p-4",
        compact && !isDashboard && "p-3",
        isDashboard &&
          revealProofOnHover &&
          "focus-within:-translate-y-0.5 focus-within:border-hoolclone-green-300 focus-within:shadow-md focus-within:shadow-hoolclone-green-900/8",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {receipt.number && (
            <span
              className={cn(
                "text-xs font-bold tabular-nums",
                isDashboard ? "text-hoolclone-green-800" : "text-muted-foreground",
              )}
            >
              #{receipt.number}
            </span>
          )}
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-bold",
              isDashboard
                ? "border-0 bg-hoolclone-green-100/90 text-hoolclone-green-900"
                : "bg-hoolclone-green-100 text-hoolclone-green-900",
            )}
          >
            {typeLabels[receipt.type] ?? receipt.type}
          </Badge>
        </div>
        <time
          dateTime={receipt.date}
          className="shrink-0 text-[11px] text-muted-foreground"
        >
          {formatDate(receipt.date)}
        </time>
      </div>

      <p
        className={cn(
          "mt-2 leading-relaxed text-foreground/90",
          compact && "text-xs",
          isDashboard
            ? "line-clamp-2 text-[13px] group-hover:line-clamp-none group-focus-within:line-clamp-none"
            : "text-sm",
        )}
      >
        {receipt.text}
      </p>

      {receipt.quote && (
        <p className="mt-2 text-sm italic text-muted-foreground">
          &ldquo;{receipt.quote}&rdquo;
        </p>
      )}

      {receipt.recallSource && (
        <div className="mt-2">
          <RecallSourceBadge source={receipt.recallSource} />
        </div>
      )}

      {receipt.storageStatus === "stored" && (
        <div className="mt-2.5">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs text-hoolclone-green-700",
              isDashboard &&
                "rounded-md border border-hoolclone-green-100/80 bg-hoolclone-green-50/60 px-2 py-1 text-[11px]",
            )}
          >
            <Database className="h-3 w-3 shrink-0" />
            <span className="font-medium">
              {isDashboard ? "Walrus verified" : "Verified on Walrus Mainnet"}
            </span>
            {receipt.walrusBlobId && (
              <span className="font-mono text-[10px] text-hoolclone-green-800/80">
                {receipt.walrusBlobId.length > 16
                  ? `${receipt.walrusBlobId.slice(0, 16)}…`
                  : receipt.walrusBlobId}
              </span>
            )}
            {revealProofOnHover && (
              <span className="ml-auto text-[10px] font-normal text-muted-foreground transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
                Hover for proof
              </span>
            )}
          </div>
          {hasWalrusProof && (
            <dl
              className={cn(
                "rounded-lg border border-hoolclone-green-100 bg-hoolclone-green-50/50 px-3 py-2 text-[11px]",
                revealProofOnHover
                  ? "mt-0 max-h-0 overflow-hidden border-transparent bg-transparent px-3 py-0 opacity-0 transition-all duration-300 ease-out group-hover:mt-2 group-hover:max-h-56 group-hover:border-hoolclone-green-100 group-hover:bg-hoolclone-green-50/80 group-hover:py-2 group-hover:opacity-100 group-focus-within:mt-2 group-focus-within:max-h-56 group-focus-within:border-hoolclone-green-100 group-focus-within:bg-hoolclone-green-50/80 group-focus-within:py-2 group-focus-within:opacity-100"
                  : "mt-2",
              )}
            >
              {receipt.walrusNamespace && (
                <div className="grid gap-0.5 sm:grid-cols-[4.5rem_1fr]">
                  <dt className="font-semibold text-muted-foreground">
                    Namespace
                  </dt>
                  <dd className="font-mono break-all text-hoolclone-green-900">
                    {receipt.walrusNamespace}
                  </dd>
                </div>
              )}
              {receipt.walrusBlobId && (
                <div className="mt-1 grid gap-0.5 sm:grid-cols-[4.5rem_1fr]">
                  <dt className="font-semibold text-muted-foreground">Blob ID</dt>
                  <dd className="font-mono break-all text-hoolclone-green-900">
                    {receipt.walrusBlobId}
                  </dd>
                </div>
              )}
              {receipt.walrusJobId && (
                <div className="mt-1 grid gap-0.5 sm:grid-cols-[4.5rem_1fr]">
                  <dt className="font-semibold text-muted-foreground">Job ID</dt>
                  <dd className="font-mono break-all text-hoolclone-green-900">
                    {receipt.walrusJobId}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}

      {receipt.storageStatus === "pending" && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Writing to Walrus…
        </div>
      )}

      {receipt.storageStatus === "failed" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Walrus write failed
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="flex items-center gap-1 text-xs font-medium text-hoolclone-green-700 hover:underline disabled:opacity-50"
            >
              <RotateCcw className={cn("h-3 w-3", retrying && "animate-spin")} />
              Retry
            </button>
          )}
        </div>
      )}

      {showActions && (
        <button
          type="button"
          onClick={onTogglePublic}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-hoolclone-green-700 hover:underline"
        >
          {receipt.publicVisible ? "Public" : "Private"} · Toggle
        </button>
      )}

      {!compact && receipt.number && !isDashboard && (
        <Link
          href="/memory"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-hoolclone-green-700 hover:underline"
        >
          View in memory
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </article>
  );
}
