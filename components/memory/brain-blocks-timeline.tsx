import { GitBranch } from "lucide-react";
import type { MemoryLineageStep } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type BrainBlocksTimelineProps = {
  steps: MemoryLineageStep[];
  className?: string;
};

function truncateBlob(blobId: string, max = 18): string {
  return blobId.length > max ? `${blobId.slice(0, max)}…` : blobId;
}

export function BrainBlocksTimeline({
  steps,
  className,
}: BrainBlocksTimelineProps) {
  if (steps.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No lineage steps recorded for this memory.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={`${step.label}-${index}`} className="relative flex gap-3 pb-6">
            {!isLast && (
              <span
                className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-hoolclone-green-200"
                aria-hidden
              />
            )}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-hoolclone-green-400 bg-white">
              <GitBranch className="h-3 w-3 text-hoolclone-green-700" />
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-hoolclone-green-100 bg-hoolclone-green-50/40 px-3 py-2">
              <p className="text-sm font-semibold text-hoolclone-green-900">
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.detail}
                </p>
              )}
              {step.blobId && (
                <p className="mt-1 font-mono text-[10px] text-hoolclone-green-800">
                  {truncateBlob(step.blobId)}
                </p>
              )}
              {step.timestamp && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
