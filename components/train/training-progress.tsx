import { Progress } from "@/components/ui/progress";
import { MaturityBadge } from "@/components/clone/clone-avatar";
import type { CloneMaturity } from "@/lib/mock/types";

type TrainingProgressProps = {
  current: number;
  total: number;
  maturity: CloneMaturity;
};

export function TrainingProgress({
  current,
  total,
  maturity,
}: TrainingProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Question {current} of {total}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Clone maturity</span>
          <MaturityBadge maturity={maturity} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={percent} className="h-2 flex-1" />
        <span className="text-sm font-bold">{percent}%</span>
      </div>
    </div>
  );
}
