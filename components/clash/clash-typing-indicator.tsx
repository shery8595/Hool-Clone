import { CloneAvatar } from "@/components/clone/clone-avatar";
import { cn } from "@/lib/utils";

type ClashTypingIndicatorProps = {
  displayName: string;
  side: "A" | "B";
  label?: string;
};

export function ClashTypingIndicator({
  displayName,
  side,
  label = "typing",
}: ClashTypingIndicatorProps) {
  const isA = side === "A";

  return (
    <div
      className={cn("flex gap-3", isA ? "flex-row" : "flex-row-reverse")}
      aria-live="polite"
      aria-label={`${displayName}'s clone is ${label}`}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isA ? "bg-hoolclone-green-100" : "bg-amber-100",
        )}
      >
        <CloneAvatar size="sm" className="h-9 w-9 ring-0" />
      </div>

      <div className={cn("max-w-[85%] space-y-2", !isA && "text-right")}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {displayName}&apos;s clone
        </p>
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-2xl px-4 py-3",
            isA
              ? "rounded-tl-sm bg-hoolclone-green-100 text-hoolclone-green-900"
              : "rounded-tr-sm bg-amber-100 text-amber-950",
          )}
        >
          <span className="sr-only">{label}</span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-current opacity-70 [animation-delay:0ms]"
            aria-hidden
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-current opacity-70 [animation-delay:150ms]"
            aria-hidden
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-current opacity-70 [animation-delay:300ms]"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
