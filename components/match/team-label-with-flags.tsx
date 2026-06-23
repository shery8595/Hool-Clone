import { TeamFlag } from "@/components/match/team-flag";
import { toTeam } from "@/lib/mock/matches";
import {
  parseMatchLabelTeams,
  tokenizeTextWithTeams,
} from "@/lib/match/team-text-tokens";
import { cn } from "@/lib/utils";

type FlagSize = "sm" | "md";

type TeamNameWithFlagProps = {
  name: string;
  code: string;
  size?: FlagSize;
  className?: string;
};

export function TeamNameWithFlag({
  name,
  code,
  size = "sm",
  className,
}: TeamNameWithFlagProps) {
  let team;
  try {
    team = toTeam(code);
  } catch {
    return <span className={className}>{name}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 align-middle",
        className,
      )}
    >
      <TeamFlag team={team} size={size} />
      <span>{name}</span>
    </span>
  );
}

type MatchLabelWithFlagsProps = {
  label: string;
  size?: FlagSize;
  className?: string;
  nameClassName?: string;
};

export function MatchLabelWithFlags({
  label,
  size = "sm",
  className,
  nameClassName,
}: MatchLabelWithFlagsProps) {
  const parsed = parseMatchLabelTeams(label);
  if (!parsed) {
    return (
      <TextWithTeamFlags
        text={label}
        size={size}
        className={className}
      />
    );
  }

  let homeTeam;
  let awayTeam;
  try {
    homeTeam = toTeam(parsed.homeCode);
    awayTeam = toTeam(parsed.awayCode);
  } catch {
    return (
      <TextWithTeamFlags
        text={label}
        size={size}
        className={className}
      />
    );
  }

  const scoreLabel =
    parsed.scoreA != null && parsed.scoreB != null
      ? ` (${parsed.scoreA}-${parsed.scoreB})`
      : "";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 align-middle",
        className,
      )}
    >
      <TeamFlag team={homeTeam} size={size} />
      <span className={cn("font-semibold", nameClassName)}>
        {parsed.homeLabel}
      </span>
      <span className="px-0.5 text-xs font-medium text-muted-foreground">
        vs
      </span>
      <TeamFlag team={awayTeam} size={size} />
      <span className={cn("font-semibold", nameClassName)}>
        {parsed.awayLabel}
      </span>
      {scoreLabel && (
        <span className="text-muted-foreground">{scoreLabel}</span>
      )}
    </span>
  );
}

type TextWithTeamFlagsProps = {
  text: string;
  size?: FlagSize;
  className?: string;
};

export function TextWithTeamFlags({
  text,
  size = "sm",
  className,
}: TextWithTeamFlagsProps) {
  const tokens = tokenizeTextWithTeams(text);

  return (
    <span className={cn("inline leading-relaxed", className)}>
      {tokens.map((token, index) =>
        token.type === "text" ? (
          <span key={`t-${index}`}>{token.value}</span>
        ) : (
          <TeamNameWithFlag
            key={`team-${index}-${token.code}`}
            name={token.value}
            code={token.code}
            size={size}
            className="mx-0.5"
          />
        ),
      )}
    </span>
  );
}
