import { Crosshair, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import type { DashboardContradiction } from "@/lib/clone/contradiction-hunter";
import type { ContradictionKind } from "@/lib/clone/contradiction-hunter";
import { cn } from "@/lib/utils";

type ContradictionHunterCardProps = {
  contradiction: DashboardContradiction | null;
  predictionsCount: number;
  className?: string;
};

const kindLabels: Record<ContradictionKind, string> = {
  loyalty: "Loyalty vs pick",
  rival: "Rival grudge",
  style: "Style mismatch",
  underdog: "Underdog bias",
  clone_disagreement: "Clone split",
};

function kindChipClass(kind?: ContradictionKind): string {
  switch (kind) {
    case "loyalty":
      return "bg-hoolclone-green-100 text-hoolclone-green-900";
    case "rival":
      return "bg-red-50 text-red-800";
    case "style":
      return "bg-sky-50 text-sky-900";
    case "underdog":
      return "bg-amber-50 text-amber-900";
    default:
      return "bg-hoolclone-yellow-500/15 text-hoolclone-gray-900";
  }
}

export function ContradictionHunterCard({
  contradiction,
  predictionsCount,
  className,
}: ContradictionHunterCardProps) {
  const isHunter = contradiction?.source === "hunter";
  const title = contradiction
    ? isHunter
      ? "Contradiction Hunter"
      : "Latest clone disagreement"
    : "Contradiction Hunter";

  return (
    <Card
      className={cn(
        "self-start overflow-hidden rounded-2xl border border-white/90 p-0 ring-0",
        "bg-gradient-to-br from-white via-white to-hoolclone-yellow-500/5",
        "shadow-[6px_6px_20px_var(--btn-neu-shadow),-4px_-4px_16px_var(--btn-neu-highlight)]",
        className,
      )}
    >
      <div className="border-b border-hoolclone-yellow-500/20 bg-gradient-to-r from-hoolclone-yellow-500/15 via-white to-hoolclone-green-50/30 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-hoolclone-yellow-500 to-amber-500 text-hoolclone-gray-900 shadow-sm">
              <Crosshair className="h-3.5 w-3.5" />
            </span>
            <h2 className="truncate text-sm font-semibold text-hoolclone-green-900">
              {title}
            </h2>
          </div>
          {contradiction?.kind && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                kindChipClass(contradiction.kind),
              )}
            >
              {kindLabels[contradiction.kind]}
            </span>
          )}
        </div>
      </div>

      <CardContent className="space-y-3 px-4 py-3.5">
        {contradiction ? (
          <>
            <blockquote
              className={cn(
                "relative rounded-lg border border-hoolclone-yellow-500/25",
                "bg-gradient-to-br from-hoolclone-yellow-500/10 via-white to-hoolclone-green-50/20",
                "px-3 py-3 text-sm font-medium leading-snug text-hoolclone-gray-900",
              )}
            >
              <span
                className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-full bg-hoolclone-yellow-500"
                aria-hidden
              />
              <p className="pl-2.5 italic">&ldquo;{contradiction.text}&rdquo;</p>
            </blockquote>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-hoolclone-green-100/80 bg-white/70 px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <CloneAvatar size="sm" className="h-6 w-6 shrink-0 ring-0" />
                <span className="truncate text-xs text-muted-foreground">
                  {contradiction.label}
                </span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-700">
                <Sparkles className="h-3 w-3" />
                Live
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-hoolclone-green-200/80 bg-hoolclone-gray-50/50 px-4 py-5 text-center">
            <Crosshair className="mx-auto mb-2 h-6 w-6 text-hoolclone-yellow-500/80" />
            <p className="text-sm leading-snug text-muted-foreground">
              {predictionsCount > 0
                ? "No claim-vs-pick mismatches yet. Add loyalty takes in Train and keep predicting — contradictions show up when your story and your picks diverge."
                : "Make predictions so your clone can compare what you say with what you pick."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
