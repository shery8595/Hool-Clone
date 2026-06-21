import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionHistoryItem } from "@/lib/api/client";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle } from "@/lib/mock/matches";
import { formatFinalScore, isMatchFinished } from "@/lib/match-data/match-status";
import { cn } from "@/lib/utils";

export function PredictionHistory({
  items,
}: {
  items: PredictionHistoryItem[];
}) {
  if (items.length === 0) return null;

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your recent predictions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 5).map(({ match, prediction, savedAt, matchResult }) => {
          const finished = isMatchFinished(match);
          const actualScore = formatFinalScore(match);
          const predictedCorrect =
            finished &&
            match.winnerCode &&
            prediction.winner === match.winnerCode;

          return (
          <Link
            key={prediction.matchId}
            href={`/predict/${prediction.matchId}`}
            className={cn(
              "block rounded-xl border border-border p-3 transition-colors hover:bg-hoolclone-gray-50",
              finished && "bg-muted/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatMatchTitle(match)}</p>
                  {finished && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      FT
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatKickoff(match.kickoffAt)} · {match.stage}
                </p>
                {finished && actualScore && (
                  <p className="mt-0.5 text-xs font-medium text-foreground">
                    Final: {actualScore}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                  predictedCorrect
                    ? "bg-hoolclone-green-100 text-hoolclone-green-900"
                    : finished
                      ? "bg-muted text-muted-foreground"
                      : "bg-hoolclone-green-100 text-hoolclone-green-900",
                )}
              >
                {prediction.winner} {prediction.homeScore}-{prediction.awayScore}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Saved {new Date(savedAt).toLocaleDateString()}
              {finished && matchResult?.winner && (
                <> · {predictedCorrect ? "You called it" : "Result in"}</>
              )}
            </p>
          </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
