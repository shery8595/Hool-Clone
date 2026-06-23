import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamNameWithFlag } from "@/components/match/team-label-with-flags";
import { resolveTeamCode } from "@/lib/match/team-text-tokens";
import type { SeasonReportCard as SeasonReportData } from "@/lib/stats/clone-analytics";

type SeasonReportCardProps = {
  report: SeasonReportData;
};

export function SeasonReportCard({ report }: SeasonReportCardProps) {
  return (
    <Card className="mx-auto max-w-md rounded-2xl border-2 border-hoolclone-green-800 bg-gradient-to-br from-hoolclone-green-900 to-hoolclone-green-800 text-white shadow-lg">
      <CardHeader className="text-center">
        <Trophy className="mx-auto h-8 w-8 text-hoolclone-yellow-400" />
        <CardTitle className="text-lg font-bold tracking-wide">
          2026 World Cup Fan Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-white/20 pb-2">
          <span>Loyalty Score</span>
          <span className="font-bold">{report.loyaltyScore}%</span>
        </div>
        <div className="flex justify-between border-b border-white/20 pb-2">
          <span>Prediction Accuracy</span>
          <span className="font-bold">{report.predictionAccuracy}%</span>
        </div>
        <div className="flex justify-between border-b border-white/20 pb-2">
          <span>Contradictions</span>
          <span className="font-bold">{report.contradictionCount}</span>
        </div>
        {report.mostDefendedTeam && (
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span>Most Defended Team</span>
            <TeamReportValue name={report.mostDefendedTeam} />
          </div>
        )}
        {report.mostHatedTeam && (
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span>Most Hated Team</span>
            <TeamReportValue name={report.mostHatedTeam} />
          </div>
        )}
        <div className="pt-2 text-center">
          <p className="text-xs uppercase tracking-wider text-hoolclone-yellow-300">
            Verdict
          </p>
          <p className="mt-1 text-base font-bold">{report.verdict}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamReportValue({ name }: { name: string }) {
  const code = resolveTeamCode(name);
  if (!code) {
    return <span className="font-bold">{name}</span>;
  }
  return <TeamNameWithFlag name={name} code={code} size="sm" className="font-bold" />;
}
