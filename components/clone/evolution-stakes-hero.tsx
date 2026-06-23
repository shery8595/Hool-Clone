"use client";

import Link from "next/link";
import { Target, Trophy, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { MatchLabelWithFlags } from "@/components/match/team-label-with-flags";

type EvolutionStakesHeroProps = {
  matchLabel?: string;
  matchId?: string;
  cloneAccuracy: number;
  resolvedCount: number;
  className?: string;
};

export function EvolutionStakesHero({
  matchLabel,
  matchId = "m071",
  cloneAccuracy,
  resolvedCount,
  className,
}: EvolutionStakesHeroProps) {
  return (
    <Card
      className={`rounded-2xl border border-hoolclone-green-200/80 bg-gradient-to-r from-hoolclone-green-50 to-white shadow-sm ${className ?? ""}`}
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-hoolclone-green-800">
            World Cup stakes
          </p>
          {matchLabel && (
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-hoolclone-green-950">
              <Target className="h-4 w-4 shrink-0" />
              <span>Featured match:</span>
              <MatchLabelWithFlags label={matchLabel} size="sm" />
            </p>
          )}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 shrink-0 text-hoolclone-yellow-600" />
            Clone accuracy {cloneAccuracy}% across {resolvedCount} resolved picks
            — post-match Telegram roasts write new Walrus memories that shift the
            next prediction.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/predict/${matchId}`} size="sm">
            Predict next match
          </ButtonLink>
          <ButtonLink
            href="/telegram-history"
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Post-match loop
          </ButtonLink>
        </div>
      </CardContent>
    </Card>
  );
}
