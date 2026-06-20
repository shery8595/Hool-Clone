import { Brain, Fingerprint, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CloneAvatar, MaturityBadge } from "./clone-avatar";
import type { CloneMaturity } from "@/lib/mock/types";

export type CloneStatusCardProps = {
  maturity: CloneMaturity;
  level: number;
  maxLevel: number;
  levelProgress: number;
  quote: string | null;
  memoriesCount: number;
  cloneMatchPercent: number;
  predictionsCount: number;
};

export function CloneStatusCard({
  maturity,
  level,
  maxLevel,
  levelProgress,
  quote,
  memoriesCount,
  cloneMatchPercent,
  predictionsCount,
}: CloneStatusCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
        <CloneAvatar size="xl" className="mx-auto lg:mx-0" />

        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Clone status
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <MaturityBadge maturity={maturity} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Level {level} of {maxLevel}
              </span>
              <span className="text-muted-foreground">{levelProgress}%</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>

          {quote && (
            <blockquote className="border-l-4 border-hoolclone-green-700 pl-4 text-sm italic text-muted-foreground">
              &ldquo;{quote}&rdquo;
            </blockquote>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
          <StatPill
            icon={Brain}
            value={`${memoriesCount}`}
            label="memories stored"
          />
          <StatPill
            icon={Fingerprint}
            value={`${cloneMatchPercent}%`}
            label="clone matched you"
          />
          <StatPill
            icon={Target}
            value={`${predictionsCount}`}
            label="predictions made"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-hoolclone-gray-50 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hoolclone-green-100">
        <Icon className="h-5 w-5 text-hoolclone-green-700" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
