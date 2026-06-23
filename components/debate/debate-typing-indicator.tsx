import { cn } from "@/lib/utils";

export function DebateTypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-label="Clone is thinking"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hoolclone-green-100">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hoolclone-green-500 opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-hoolclone-green-700" />
        </span>
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-hoolclone-green-100 bg-hoolclone-green-50/80 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
