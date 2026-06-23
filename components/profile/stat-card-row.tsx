import { Brain, Smile, Sparkles, Target, TrendingUp } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-surface";

export type ProfileStats = {
  cloneMatchPercent: number;
  memoriesCount: number;
  predictionsCount: number;
  hasDisagreement: boolean;
  contradictionCount?: number;
  maturityLabel?: string;
  levelProgress?: number;
};

export function StatCardRow({
  cloneMatchPercent,
  memoriesCount,
  predictionsCount,
  hasDisagreement,
  contradictionCount,
  maturityLabel,
  levelProgress,
}: ProfileStats) {
  const contradictionLabel = contradictionCount
    ? `${contradictionCount} caught`
    : hasDisagreement
      ? "Debates logged"
      : "Aligned";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <DashboardStatCard
        label="Clone maturity"
        value={maturityLabel ?? "Stranger"}
        icon={Sparkles}
        accent="green"
        hint={
          levelProgress != null
            ? `${levelProgress}% toward next tier`
            : "Train to grow"
        }
      />
      <DashboardStatCard
        label="Clone matched fan"
        value={`${cloneMatchPercent}%`}
        icon={Target}
        accent="yellow"
        hint="Agreement on locked picks"
      />
      <DashboardStatCard
        label="Memories"
        value={memoriesCount}
        icon={Brain}
        accent="emerald"
        hint="Walrus receipts powering clone"
      />
      <DashboardStatCard
        label="Predictions"
        value={predictionsCount}
        icon={TrendingUp}
        accent="green"
        hint="Matches with locked scores"
      />
      <DashboardStatCard
        label="Contradictions"
        value={contradictionLabel}
        icon={Smile}
        accent="yellow"
        hint={
          contradictionCount
            ? "Behavioral splits surfaced"
            : "Clone consistency check"
        }
      />
    </div>
  );
}
