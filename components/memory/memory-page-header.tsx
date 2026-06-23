import Link from "next/link";
import { Brain, Database, Eye, Globe, Shield } from "lucide-react";
import { CloneAvatar, MaturityBadge } from "@/components/clone/clone-avatar";
import type { CloneMaturity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type MemoryPageHeaderProps = {
  displayName: string | null;
  namespace: string;
  maturityLabel: CloneMaturity;
  totalCount: number;
  walrusCount: number;
  publicCount: number;
  backend: "Local" | "Walrus";
  pendingCount?: number;
  failedCount?: number;
};

export function MemoryPageHeader({
  displayName,
  namespace,
  maturityLabel,
  totalCount,
  walrusCount,
  publicCount,
  backend,
  pendingCount = 0,
  failedCount = 0,
}: MemoryPageHeaderProps) {
  const name = displayName?.trim() || namespace;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-hoolclone-yellow-50/40 p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-hoolclone-yellow-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <CloneAvatar size="lg" />
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-hoolclone-green-800">
              Walrus receipt vault
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-hoolclone-green-950">
              Memory
            </h1>
            <p className="text-sm text-muted-foreground">
              {name} · Private receipts that fuel your clone
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <MaturityBadge maturity={maturityLabel} />
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  backend === "Walrus"
                    ? "bg-white text-hoolclone-green-900 ring-hoolclone-green-200"
                    : "bg-muted/50 text-muted-foreground ring-border",
                )}
              >
                <Database className="h-3.5 w-3.5" />
                {backend} backend
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-xl lg:flex-1">
          <MemoryStat label="Total" value={totalCount} icon={Brain} accent="green" />
          <MemoryStat
            label="Walrus"
            value={walrusCount}
            icon={Shield}
            accent="emerald"
            hint={backend === "Walrus" ? "Verified" : "N/A"}
          />
          <MemoryStat label="Public" value={publicCount} icon={Globe} accent="yellow" />
          <MemoryStat
            label="Visible"
            value={publicCount > 0 ? "On" : "Off"}
            icon={Eye}
            accent="green"
            hint="Profile receipts"
          />
        </div>
      </div>

      {(pendingCount > 0 || failedCount > 0) && backend === "Walrus" && (
        <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-900">
              {pendingCount} writing to Walrus
            </span>
          )}
          {failedCount > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-900">
              {failedCount} failed — retry below
            </span>
          )}
        </div>
      )}

      {totalCount < 3 && (
        <div className="relative mt-4 rounded-xl border border-dashed border-hoolclone-green-200 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
          Train your clone on{" "}
          <Link href="/train" className="font-semibold text-hoolclone-green-800 hover:underline">
            /train
          </Link>{" "}
          to grow your first receipts.
        </div>
      )}
    </header>
  );
}

function MemoryStat({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Brain;
  accent: "green" | "yellow" | "emerald";
  hint?: string;
}) {
  const styles = {
    green: "border-hoolclone-green-200/70 bg-white/80",
    yellow: "border-amber-200/70 bg-white/80",
    emerald: "border-emerald-200/70 bg-white/80",
  }[accent];

  const iconColor = {
    green: "text-hoolclone-green-700",
    yellow: "text-amber-700",
    emerald: "text-emerald-700",
  }[accent];

  return (
    <div className={cn("rounded-xl border p-3", styles)}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-hoolclone-green-950">
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
