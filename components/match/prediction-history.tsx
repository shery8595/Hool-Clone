"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PredictionHistoryItem } from "@/lib/api/client";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle } from "@/lib/mock/matches";
import { formatFinalScore, isMatchFinished } from "@/lib/match-data/match-status";
import { cn } from "@/lib/utils";

const DEFAULT_LIMIT = 3;

export function PredictionHistory({
  items,
  limit = DEFAULT_LIMIT,
}: {
  items: PredictionHistoryItem[];
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, limit);
  const hiddenCount = Math.max(0, items.length - limit);

  return (
    <Card className="rounded-2xl border border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Recent predictions</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your latest picks — tap to open a match
          </p>
        </div>
        {items.length > 0 && (
          <span className="rounded-full bg-hoolclone-green-100 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-hoolclone-green-900">
            {items.length} total
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ match, prediction, savedAt, matchResult }) => {
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
                  "block rounded-xl border border-border/60 p-3 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40",
                  finished && "bg-muted/15",
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {formatMatchTitle(match)}
                    </p>
                    {finished && (
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-label="Full time"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatKickoff(match.kickoffAt)} · {match.stage}
                  </p>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      predictedCorrect
                        ? "bg-hoolclone-green-100 text-hoolclone-green-900"
                        : finished
                          ? "bg-muted text-muted-foreground"
                          : "bg-hoolclone-green-100 text-hoolclone-green-900",
                    )}
                  >
                    {prediction.winner} {prediction.homeScore}-{prediction.awayScore}
                  </span>
                  {finished && actualScore && (
                    <p className="text-[11px] font-medium text-foreground">
                      Final {actualScore}
                      {matchResult?.winner && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {predictedCorrect ? "called it" : "missed"}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Saved {new Date(savedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-hoolclone-green-800 transition hover:bg-muted/30"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                View {hiddenCount} more prediction{hiddenCount === 1 ? "" : "s"}
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
