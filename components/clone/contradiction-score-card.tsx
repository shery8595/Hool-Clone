"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemporalContradiction } from "@/lib/clone/temporal-contradictions";
import { formatDate } from "@/lib/mock/demo-user";

type ContradictionScoreCardProps = {
  contradictions: TemporalContradiction[];
  consistencyScore: number;
  totalCount?: number;
  roastLine?: string | null;
};

export function ContradictionScoreCard({
  contradictions,
  consistencyScore,
  totalCount,
  roastLine,
}: ContradictionScoreCardProps) {
  const count = totalCount ?? contradictions.length;

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-hoolclone-yellow-600" />
          Contradictions Found: {count}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your clone tracks when your football opinions flip on the same team.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {contradictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No temporal flip-flops detected yet. Keep talking — contradictions are
            inevitable.
          </p>
        ) : (
          <ul className="space-y-4">
            {contradictions.slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-hoolclone-yellow-200/80 bg-hoolclone-yellow-50/40 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {c.team}
                </p>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-foreground">
                      {formatDate(c.dateA)}:
                    </span>{" "}
                    &ldquo;{c.textA.length > 80 ? `${c.textA.slice(0, 80)}…` : c.textA}&rdquo;
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      {formatDate(c.dateB)}:
                    </span>{" "}
                    &ldquo;{c.textB.length > 80 ? `${c.textB.slice(0, 80)}…` : c.textB}&rdquo;
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-xl bg-hoolclone-green-900 px-4 py-3 text-center text-white">
          <p className="text-lg font-bold">
            Your football opinions are {consistencyScore}% consistent.
          </p>
          {roastLine && (
            <p className="mt-1 text-sm text-hoolclone-green-100">{roastLine}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
