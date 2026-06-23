import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardPanel({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "subtle";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        variant === "subtle"
          ? "border-hoolclone-green-100/80 bg-hoolclone-green-50/25 shadow-none"
          : "border-border/50 bg-white shadow-[0_1px_2px_rgba(10,61,46,0.04),0_12px_40px_-12px_rgba(10,61,46,0.08)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashboardEyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function DashboardMiniCard({
  className,
  children,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/45 bg-white p-4",
        interactive && "transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardStatusPill({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
        active
          ? "border-hoolclone-green-200 bg-hoolclone-green-50 text-hoolclone-green-800"
          : "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

const statThemes = {
  green: {
    card: "border-hoolclone-green-200/60 bg-gradient-to-br from-hoolclone-green-50 via-white to-emerald-50/30",
    glow: "bg-hoolclone-green-500/25",
    icon: "border-hoolclone-green-200/80 bg-gradient-to-br from-white to-hoolclone-green-100 text-hoolclone-green-800 shadow-[0_8px_20px_-6px_rgba(26,107,74,0.35)]",
    value: "text-hoolclone-green-950",
    label: "text-hoolclone-green-800/75",
    bar: "from-hoolclone-green-700 via-hoolclone-green-500 to-emerald-400",
  },
  yellow: {
    card: "border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-hoolclone-yellow-50/40",
    glow: "bg-hoolclone-yellow-500/30",
    icon: "border-amber-200/80 bg-gradient-to-br from-white to-amber-100 text-amber-800 shadow-[0_8px_20px_-6px_rgba(180,83,9,0.3)]",
    value: "text-amber-950",
    label: "text-amber-900/70",
    bar: "from-amber-700 via-hoolclone-yellow-500 to-amber-300",
  },
  emerald: {
    card: "border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50/30",
    glow: "bg-emerald-500/20",
    icon: "border-emerald-200/80 bg-gradient-to-br from-white to-emerald-100 text-emerald-800 shadow-[0_8px_20px_-6px_rgba(5,150,105,0.3)]",
    value: "text-emerald-950",
    label: "text-emerald-900/70",
    bar: "from-emerald-700 via-emerald-500 to-teal-400",
  },
} as const;

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  accent = "green",
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof statThemes;
  hint?: string;
  className?: string;
}) {
  const theme = statThemes[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 shadow-[0_10px_30px_-12px_rgba(10,61,46,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(10,61,46,0.22)] sm:p-5",
        theme.card,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100",
          theme.glow,
        )}
        aria-hidden
      />

      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90",
          theme.bar,
        )}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
              theme.label,
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-[2rem] sm:leading-none",
              theme.value,
            )}
          >
            {value}
          </p>
        </div>

        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            theme.icon,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
      </div>

      <div className="relative mt-4 min-h-[2.25rem] border-t border-black/5 pt-3">
        {hint && (
          <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 border-b border-border/40 pb-4",
        className,
      )}
    >
      <div>
        {eyebrow && <DashboardEyebrow>{eyebrow}</DashboardEyebrow>}
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-hoolclone-gray-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
