import { CheckCircle2, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReceiptsUsedPanel } from "@/components/memory/receipts-used-panel";
import type { Prediction } from "@/lib/mock/types";
import type { Match } from "@/lib/mock/types";

type HumanVsClonePanelProps = {
  match: Match;
  prediction: Prediction;
};

export function HumanVsClonePanel({
  match,
  prediction,
}: HumanVsClonePanelProps) {
  if (!match.homeTeam || !match.awayTeam) return null;

  const { homeTeam, awayTeam } = match;

  const scoreLabel = (home: number, away: number, winner: string) => {
    const winnerName =
      winner === homeTeam.code ? homeTeam.name : awayTeam.name;
    return `${winnerName} ${home} - ${away}`;
  };

  const userScore = scoreLabel(
    prediction.homeScore,
    prediction.awayScore,
    prediction.winner,
  );
  const cloneScore = prediction.clone
    ? scoreLabel(
        prediction.clone.homeScore,
        prediction.clone.awayScore,
        prediction.clone.winner,
      )
    : "—";

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground">
          YOU VS YOUR CLONE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <PredictionColumn
            label="YOU"
            score={userScore}
            confidence={prediction.confidence}
          />
          <PredictionColumn
            label="YOUR CLONE"
            score={cloneScore}
            confidence={prediction.clone?.confidence ?? 0}
          />
        </div>

        {prediction.agreed ? (
          <div className="flex items-center gap-2 rounded-xl bg-hoolclone-green-100 px-4 py-3 text-sm font-medium text-hoolclone-green-900">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your clone agrees with you
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-hoolclone-yellow-500/20 px-4 py-3 text-sm font-medium text-hoolclone-gray-900">
            <GitCompare className="h-4 w-4 shrink-0" />
            Your clone disagrees — teach it below so future picks improve
          </div>
        )}

        {prediction.clone?.receipts && prediction.clone.receipts.length > 0 && (
          <ReceiptsUsedPanel receipts={prediction.clone.receipts} />
        )}
      </CardContent>
    </Card>
  );
}

function PredictionColumn({
  label,
  score,
  confidence,
}: {
  label: string;
  score: string;
  confidence: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="font-bold">{score}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-1.5" />
      </div>
    </div>
  );
}
