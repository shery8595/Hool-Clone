import { Brain, Sparkles, Target, TrendingUp, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  const stats = [
    {
      icon: Sparkles,
      label: "Clone maturity",
      value: maturityLabel ?? "Stranger",
      showProgress: maturityLabel !== undefined,
      progress: levelProgress,
    },
    {
      icon: Target,
      label: "Clone matched fan",
      value: `${cloneMatchPercent}%`,
      showProgress: true,
      progress: cloneMatchPercent,
    },
    {
      icon: Brain,
      label: "Memories",
      value: `${memoriesCount} stored`,
      showProgress: false,
    },
    {
      icon: TrendingUp,
      label: "Predictions",
      value: `${predictionsCount} matches predicted`,
      showProgress: false,
    },
    {
      icon: Smile,
      label: "Contradictions",
      value: contradictionCount
        ? `${contradictionCount} caught`
        : hasDisagreement
          ? "Clone debates logged"
          : "Aligned so far",
      showProgress: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, showProgress, progress }) => (
        <Card key={label} className="rounded-2xl border-0 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-xl font-bold">{value}</p>
            {showProgress && progress !== undefined && (
              <Progress value={progress} className="h-1.5" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
