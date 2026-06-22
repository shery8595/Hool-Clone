import { DashboardEyebrow, DashboardPanel } from "./dashboard-surface";

export function DashboardInsightsSection({
  title = "Insights",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <DashboardEyebrow>Analytics</DashboardEyebrow>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-hoolclone-gray-900">
            {title}
          </h2>
        </div>
      </div>
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
