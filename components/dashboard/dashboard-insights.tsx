import {
  DashboardPanel,
  DashboardSectionHeader,
} from "./dashboard-surface";
import { cn } from "@/lib/utils";

export function DashboardInsightsSection({
  title = "Insights",
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <DashboardSectionHeader
        eyebrow="Analytics"
        title={title}
        description={description}
      />
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function DashboardInsightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardPanel className={className}>{children}</DashboardPanel>
  );
}

export function DashboardInsightsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-2", className)}>{children}</div>
  );
}

export function DashboardEmptyInsight({
  children,
  hydrating,
  hydratingMessage = "Loading...",
}: {
  children: React.ReactNode;
  hydrating?: boolean;
  hydratingMessage?: string;
}) {
  return (
    <DashboardInsightCard>
      <p className="py-6 text-center text-sm text-muted-foreground">
        {hydrating ? hydratingMessage : children}
      </p>
    </DashboardInsightCard>
  );
}
