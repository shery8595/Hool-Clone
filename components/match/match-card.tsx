import { ArrowRight, CalendarDays, MapPin, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import type { Match, Team } from "@/lib/mock/types";
import { formatKickoff } from "@/lib/mock/demo-user";
import { formatMatchTitle, formatVenueLine } from "@/lib/mock/matches";
import { cn } from "@/lib/utils";
import { TeamFlag } from "./team-flag";

type MatchCardProps = {
  match: Match;
  showPredictButton?: boolean;
  footer?: string;
};

export function MatchCard({
  match,
  showPredictButton = true,
  footer,
}: MatchCardProps) {
  const canPredict = Boolean(match.homeTeam && match.awayTeam);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border border-white/90 p-0 ring-0",
        "bg-gradient-to-br from-white via-white to-hoolclone-green-50/50",
        "shadow-[6px_6px_20px_var(--btn-neu-shadow),-4px_-4px_16px_var(--btn-neu-highlight)]",
        "transition-all duration-300 hover:shadow-[8px_8px_24px_var(--btn-neu-shadow),-5px_-5px_18px_var(--btn-neu-highlight)]",
      )}
    >
      <div className="relative border-b border-hoolclone-green-100/90 bg-gradient-to-r from-hoolclone-green-100/50 via-white to-hoolclone-yellow-500/10 px-5 py-4">
        <div
          className="pointer-events-none absolute inset-0 pitch-pattern opacity-40"
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center rounded-full bg-gradient-to-b from-hoolclone-green-700 to-hoolclone-green-900 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2em] text-white shadow-sm">
              NEXT MATCH
            </span>
            <p className="text-sm font-semibold leading-snug text-hoolclone-green-900">
              {match.stage}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-hoolclone-green-700" />
                {formatKickoff(match.kickoffAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-hoolclone-green-700" />
                {formatVenueLine(match)}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border border-white/90 bg-white/90 px-2.5 py-1",
              "text-xs font-bold tabular-nums text-hoolclone-green-800",
              "shadow-[3px_3px_8px_var(--btn-neu-shadow),-2px_-2px_6px_var(--btn-neu-highlight)]",
            )}
          >
            #{match.matchNumber}
          </span>
        </div>
      </div>

      <CardContent className="space-y-5 px-5 py-6">
        <MatchTeamsDisplay match={match} size="xl" featured />

        {showPredictButton && canPredict && (
          <div className="flex justify-center border-t border-hoolclone-green-100/70 pt-4">
            <ButtonLink
              href={`/predict/${match.id}`}
              variant="default"
              size="sm"
              className={cn(
                "rounded-lg px-4 font-medium",
                "shadow-[0_1px_2px_rgba(10,61,46,0.12),0_4px_12px_rgba(26,107,74,0.18)]",
                "hover:shadow-[0_2px_4px_rgba(10,61,46,0.14),0_6px_16px_rgba(26,107,74,0.22)]",
                "active:shadow-[0_1px_2px_rgba(10,61,46,0.16)]",
              )}
            >
              <Target className="h-3.5 w-3.5 opacity-90" />
              Predict match
              <ArrowRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover/button:translate-x-0.5" />
            </ButtonLink>
          </div>
        )}

        {footer && (
          <p
            className={cn(
              "rounded-xl border border-hoolclone-green-100/80 bg-hoolclone-gray-50/80 px-3 py-2.5",
              "text-center text-xs leading-relaxed text-muted-foreground",
            )}
          >
            {footer}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function MatchTeamsDisplay({
  match,
  size = "lg",
  featured = false,
}: {
  match: Match;
  size?: "md" | "lg" | "xl";
  featured?: boolean;
}) {
  if (!match.homeTeam || !match.awayTeam) {
    return (
      <p className="text-center text-sm font-semibold text-muted-foreground">
        {match.matchupLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 sm:gap-5",
        featured && "rounded-2xl border border-hoolclone-green-100/60 bg-white/60 px-4 py-5",
      )}
    >
      <TeamBlock team={match.homeTeam} size={size} featured={featured} />
      <div
        className={cn(
          "flex shrink-0 flex-col items-center justify-center",
          featured ? "gap-1" : "gap-0",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center font-bold uppercase tracking-wide text-muted-foreground",
            featured
              ? "h-11 w-11 rounded-full border border-white/90 bg-gradient-to-b from-white to-hoolclone-gray-50 text-[11px] shadow-[4px_4px_10px_var(--btn-neu-shadow),-3px_-3px_8px_var(--btn-neu-highlight)]"
              : "h-10 w-10 rounded-full bg-hoolclone-gray-50 text-xs",
          )}
        >
          vs
        </div>
        {featured && (
          <span className="text-[10px] font-medium text-hoolclone-green-700">
            {match.group ? `Grp ${match.group}` : "Knockout"}
          </span>
        )}
      </div>
      <TeamBlock team={match.awayTeam} size={size} align="right" featured={featured} />
    </div>
  );
}

function TeamBlock({
  team,
  align = "left",
  size,
  featured = false,
}: {
  team: Team;
  align?: "left" | "right";
  size: "md" | "lg" | "xl";
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-2.5",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <div
        className={cn(
          featured &&
            "rounded-2xl border border-white/90 bg-gradient-to-b from-white to-hoolclone-gray-50 p-2.5 shadow-[4px_4px_12px_var(--btn-neu-shadow),-3px_-3px_10px_var(--btn-neu-highlight)]",
        )}
      >
        <TeamFlag team={team} size={size} className={featured ? "rounded-md" : undefined} />
      </div>
      <span
        className={cn(
          "max-w-[7rem] truncate text-center font-semibold sm:max-w-none",
          featured ? "text-base text-hoolclone-green-900" : "text-sm",
        )}
      >
        {team.name}
      </span>
    </div>
  );
}

export function MatchListCard({ match }: { match: Match }) {
  const canPredict = Boolean(match.homeTeam && match.awayTeam);

  return (
    <Card className="rounded-2xl border-0 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            #{match.matchNumber} · {match.stage}
          </p>
        </div>
        <div className="mt-2">
          <MatchTeamsDisplay match={match} size="lg" />
        </div>
        <p className="mt-2 text-center text-xs font-medium">
          {formatMatchTitle(match)}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {formatKickoff(match.kickoffAt)}
        </p>
        <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
          {formatVenueLine(match)}
        </p>
        {canPredict ? (
          <ButtonLink
            href={`/predict/${match.id}`}
            className="mt-4 w-full"
            size="sm"
          >
            Predict
          </ButtonLink>
        ) : (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Teams TBD
          </p>
        )}
      </CardContent>
    </Card>
  );
}
