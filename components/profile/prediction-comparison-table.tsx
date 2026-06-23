import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamFlag } from "@/components/match/team-flag";
import type { PredictionComparison } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type PredictionComparisonTableProps = {
  comparisons: PredictionComparison[];
  bare?: boolean;
};

export function PredictionComparisonTable({
  comparisons,
  bare = false,
}: PredictionComparisonTableProps) {
  const table = (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Match</th>
            <th className="px-4 py-3 font-semibold">Fan</th>
            <th className="px-4 py-3 font-semibold">Clone</th>
            <th className="px-4 py-3 font-semibold">Agreed?</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((row) => (
            <tr
              key={row.matchId}
              className="border-b border-border/50 last:border-0 even:bg-hoolclone-green-50/15"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <TeamFlag team={row.homeTeam} size="sm" />
                  <span className="font-medium text-hoolclone-green-950">
                    {row.homeTeam.name} vs {row.awayTeam.name}
                  </span>
                  <TeamFlag team={row.awayTeam} size="sm" />
                </div>
              </td>
              <td className="px-4 py-3 font-medium">{row.userPrediction}</td>
              <td className="px-4 py-3 font-medium">{row.clonePrediction}</td>
              <td className="px-4 py-3">
                {row.agreed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Split
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (bare) return table;

  return (
    <Card className={cn("rounded-2xl border-0 shadow-sm")}>
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Recent prediction comparisons
        </CardTitle>
      </CardHeader>
      <CardContent>{table}</CardContent>
    </Card>
  );
}
