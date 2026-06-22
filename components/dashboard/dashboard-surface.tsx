import { cn } from "@/lib/utils";

export function DashboardPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-white p-5 shadow-[0_1px_2px_rgba(10,61,46,0.04),0_12px_40px_-12px_rgba(10,61,46,0.08)] sm:p-6",
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
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/45 bg-white p-4 transition-colors",
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
