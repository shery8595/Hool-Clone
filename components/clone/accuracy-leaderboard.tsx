import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccuracyLeaderboard } from "@/lib/stats/clone-analytics";
import { Target } from "lucide-react";

type AccuracyLeaderboardProps = {
  data: AccuracyLeaderboard;
};

export function AccuracyLeaderboardCard({ data }: AccuracyLeaderboardProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-hoolclone-green-700" />
          Clone vs User Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data.ready ? (
          <p className="text-sm text-muted-foreground">
            Waiting for match results — need at least 3 resolved matches with
            predictions. ({data.resolvedCount}/3 so far)
          </p>
        ) : (
          <div className="space-y-4 text-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  User Accuracy
                </p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {data.userAccuracy}%
                </p>
              </div>
              <div className="rounded-xl bg-hoolclone-green-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-hoolclone-green-800">
                  Clone Accuracy
                </p>
                <p className="mt-1 text-3xl font-bold text-hoolclone-green-900">
                  {data.cloneAccuracy}%
                </p>
              </div>
            </div>
            {data.cloneAccuracy > data.userAccuracy && (
              <p className="text-sm font-semibold text-hoolclone-green-800">
                The clone officially understands football better than you.
              </p>
            )}
            {data.userAccuracy > data.cloneAccuracy && (
              <p className="text-sm font-semibold text-muted-foreground">
                You still beat your clone — for now.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
