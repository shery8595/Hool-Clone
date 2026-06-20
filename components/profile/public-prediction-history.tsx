import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle } from "@/lib/mock/matches";

type PublicPredictionHistoryProps = {
  items: PredictionHistoryItem[];
  fanName: string;
};

export function PublicPredictionHistory({
  items,
  fanName,
}: PublicPredictionHistoryProps) {
  if (items.length === 0) return null;

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Prediction history</CardTitle>
        <p className="text-sm text-muted-foreground">
          {fanName}&apos;s locked picks and how the clone responded.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 8).map(({ match, prediction, savedAt }) => (
          <Link
            key={prediction.matchId}
            href={`/predict/${prediction.matchId}`}
            className="block rounded-xl border border-border p-4 transition-colors hover:bg-hoolclone-gray-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold">{formatMatchTitle(match)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKickoff(match.kickoffAt)} · {match.stage}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Saved {new Date(savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-hoolclone-green-100 px-2.5 py-1 font-semibold text-hoolclone-green-900">
                  Fan: {prediction.winner} {prediction.homeScore}-
                  {prediction.awayScore}
                </span>
                {prediction.clone ? (
                  <span
                    className={
                      prediction.agreed
                        ? "rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-900"
                        : "rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-900"
                    }
                  >
                    Clone: {prediction.clone.winner}{" "}
                    {prediction.clone.homeScore}-{prediction.clone.awayScore}
                    {prediction.agreed ? " · agreed" : " · disagreed"}
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    Clone pending
                  </span>
                )}
              </div>
            </div>
            {prediction.reasoning && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                &ldquo;{prediction.reasoning}&rdquo;
              </p>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
