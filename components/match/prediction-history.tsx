import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionHistoryItem } from "@/lib/api/client";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle } from "@/lib/mock/matches";

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
        {items.slice(0, 5).map(({ match, prediction, savedAt }) => (
          <Link
            key={prediction.matchId}
            href={`/predict/${prediction.matchId}`}
            className="block rounded-xl border border-border p-3 transition-colors hover:bg-hoolclone-gray-50"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{formatMatchTitle(match)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKickoff(match.kickoffAt)} · {match.stage}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-hoolclone-green-100 px-2 py-0.5 text-xs font-semibold text-hoolclone-green-900">
                {prediction.winner} {prediction.homeScore}-{prediction.awayScore}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Saved {new Date(savedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
