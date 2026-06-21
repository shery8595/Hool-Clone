import type { CloneMood } from "@/lib/clone/clone-mood";
import { cn } from "@/lib/utils";

const MOOD_STYLES: Record<
  CloneMood["id"],
  { ring: string; bg: string; text: string }
> = {
  on_fire: {
    ring: "ring-orange-300",
    bg: "bg-orange-50",
    text: "text-orange-900",
  },
  salty: {
    ring: "ring-rose-300",
    bg: "bg-rose-50",
    text: "text-rose-900",
  },
  loyalist: {
    ring: "ring-hoolclone-green-300",
    bg: "bg-hoolclone-green-50",
    text: "text-hoolclone-green-900",
  },
  contradiction_hunter: {
    ring: "ring-hoolclone-yellow-400",
    bg: "bg-hoolclone-yellow-50",
    text: "text-hoolclone-green-950",
  },
  neutral: {
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-800",
  },
};

type CloneMoodBadgeProps = {
  mood: CloneMood;
  compact?: boolean;
  className?: string;
};

export function CloneMoodBadge({
  mood,
  compact = false,
  className,
}: CloneMoodBadgeProps) {
  const style = MOOD_STYLES[mood.id];

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
          style.bg,
          style.text,
          style.ring,
          className,
        )}
        title={mood.description}
      >
        Clone mood: {mood.label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 ring-1",
        style.bg,
        style.ring,
        className,
      )}
    >
      <p className={cn("text-xs font-bold uppercase tracking-wider", style.text)}>
        Current clone mood
      </p>
      <p className={cn("mt-1 text-sm font-semibold", style.text)}>{mood.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{mood.description}</p>
    </div>
  );
}
