import { TeamFlag } from "@/components/match/team-flag";
import type { Match, Team } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type MatchTeamsRowProps = {
  homeTeam: Team | null | undefined;
  awayTeam: Team | null | undefined;
  size?: "sm" | "md";
  className?: string;
  nameClassName?: string;
};

export function MatchTeamsRow({
  homeTeam,
  awayTeam,
  size = "sm",
  className,
  nameClassName,
}: MatchTeamsRowProps) {
  if (!homeTeam || !awayTeam) return null;

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1",
        className,
      )}
    >
      <TeamFlag team={homeTeam} size={size} />
      <span className={cn("font-semibold", nameClassName)}>{homeTeam.name}</span>
      <span className="px-0.5 text-xs font-medium text-muted-foreground">vs</span>
      <TeamFlag team={awayTeam} size={size} />
      <span className={cn("font-semibold", nameClassName)}>{awayTeam.name}</span>
    </span>
  );
}

export function MatchTeamsRowFromMatch({
  match,
  size = "sm",
  className,
  nameClassName,
}: {
  match: Match;
  size?: "sm" | "md";
  className?: string;
  nameClassName?: string;
}) {
  return (
    <MatchTeamsRow
      homeTeam={match.homeTeam}
      awayTeam={match.awayTeam}
      size={size}
      className={className}
      nameClassName={nameClassName}
    />
  );
}
