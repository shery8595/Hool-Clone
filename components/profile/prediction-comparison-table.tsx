import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamFlag } from "@/components/match/team-flag";
import type { PredictionComparison } from "@/lib/mock/types";

type PredictionComparisonTableProps = {
  comparisons: PredictionComparison[];
};

export function PredictionComparisonTable({
  comparisons,
}: PredictionComparisonTableProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          Recent Prediction Comparisons
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Match</th>
              <th className="pb-3 pr-4 font-medium">You</th>
              <th className="pb-3 pr-4 font-medium">Clone</th>
              <th className="pb-3 font-medium">Agreed?</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr key={row.matchId} className="border-b border-border/50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <TeamFlag team={row.homeTeam} size="sm" />
                    <span className="font-medium">
                      {row.homeTeam.name} vs {row.awayTeam.name}
                    </span>
                    <TeamFlag team={row.awayTeam} size="sm" />
                  </div>
                </td>
                <td className="py-3 pr-4 font-medium">{row.userPrediction}</td>
                <td className="py-3 pr-4 font-medium">{row.clonePrediction}</td>
                <td className="py-3">
                  {row.agreed ? (
                    <Check className="h-5 w-5 text-hoolclone-green-700" aria-label="Agreed" />
                  ) : (
                    <X className="h-5 w-5 text-destructive" aria-label="Disagreed" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
