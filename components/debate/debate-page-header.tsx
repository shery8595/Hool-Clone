import { Database, MessageCircle, Swords } from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import { cloneDebateTagline } from "@/lib/mock/debate-messages";
import type { CloneMaturity } from "@/lib/mock/types";

type DebatePageHeaderProps = {
  displayName: string | null;
  namespace: string;
  maturityLabel: CloneMaturity;
  memoriesCount: number;
  citedReceiptCount: number;
  turnCount: number;
};

export function DebatePageHeader({
  displayName,
  namespace,
  maturityLabel,
  memoriesCount,
  citedReceiptCount,
  turnCount,
}: DebatePageHeaderProps) {
  const name = displayName?.trim() || namespace;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
              Argue with receipts
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-hoolclone-green-950">
              Debate your clone
            </h1>
            <p className="text-sm text-muted-foreground">
              {name} · {cloneDebateTagline}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <MaturityBadge maturity={maturityLabel} />
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-hoolclone-green-900 ring-1 ring-hoolclone-green-200">
                <Swords className="h-3.5 w-3.5" />
                {turnCount} {turnCount === 1 ? "message" : "messages"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:max-w-md lg:flex-1">
          <DebateStat
            label="Memories"
            value={memoriesCount}
            icon={Database}
            accent="green"
          />
          <DebateStat
            label="Cited"
            value={citedReceiptCount}
            icon={MessageCircle}
            accent="yellow"
          />
          <DebateStat
            label="Fuel"
            value={memoriesCount >= 8 ? "Ready" : "Train"}
            icon={Swords}
            accent="emerald"
            hint={memoriesCount >= 8 ? "Sharp debate" : "Add memories"}
          />
        </div>
      </div>
    </header>
  );
}

function DebateStat({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Database;
  accent: "green" | "yellow" | "emerald";
  hint?: string;
}) {
  const styles = {
    green: "border-hoolclone-green-200/70 bg-white/80 text-hoolclone-green-950",
    yellow: "border-amber-200/70 bg-white/80 text-amber-950",
    emerald: "border-emerald-200/70 bg-white/80 text-emerald-950",
  }[accent];

  const iconStyles = {
    green: "text-hoolclone-green-700",
    yellow: "text-amber-700",
    emerald: "text-emerald-700",
  }[accent];

  return (
    <div className={`rounded-xl border p-3 ${styles}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className={`h-3.5 w-3.5 ${iconStyles}`} />
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
