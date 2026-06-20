import type { Match, Team } from "./types";
import { OFFICIAL_SCHEDULE_ROWS, CITY_TIMEZONES } from "./wc2026-schedule-rows";
import { getTeamDef, flagPath } from "./wc2026-teams";

export function toTeam(code: string): Team {
  const def = getTeamDef(code);
  if (!def) throw new Error(`Unknown team code: ${code}`);
  return {
    code: def.code,
    name: def.name,
    flag: flagPath(def.code),
  };
}

/** Format local kickoff as ISO string using stadium city timezone */
function toKickoffIso(date: string, timeLocal: string, city: string): string {
  const tz = CITY_TIMEZONES[city];
  if (!tz) {
    return `${date}T${timeLocal}:00`;
  }

  // Build UTC instant from local wall time in the venue timezone
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = timeLocal.split(":").map(Number);

  // Iterative offset resolution for DST (June/July 2026)
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(guess);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? 0);
    const localH = get("hour");
    const localM = get("minute");
    const localD = get("day");
    const diffMinutes =
      (hh - localH) * 60 + (mm - localM) + (d - localD) * 24 * 60;
    if (diffMinutes === 0) break;
    guess.setUTCMinutes(guess.getUTCMinutes() + diffMinutes);
  }

  return guess.toISOString();
}

function matchId(num: number): string {
  return `m${String(num).padStart(3, "0")}`;
}

function buildOfficialMatches(): Match[] {
  return OFFICIAL_SCHEDULE_ROWS.map((row) => {
    const [
      matchNumber,
      date,
      timeLocal,
      city,
      venue,
      homeCode,
      awayCode,
      group,
      stage,
      matchupLabel,
    ] = row;

    const hasTeams = homeCode && awayCode;

    return {
      id: matchId(matchNumber),
      matchNumber,
      stage: group ? `Group ${group} · ${stage}` : stage,
      group: group ?? undefined,
      homeTeam: hasTeams ? toTeam(homeCode) : null,
      awayTeam: hasTeams ? toTeam(awayCode) : null,
      matchupLabel: hasTeams
        ? undefined
        : (matchupLabel ?? "TBD v TBD"),
      kickoffAt: toKickoffIso(date, timeLocal, city),
      venue,
      city,
      featured: matchNumber === 71,
    };
  });
}

export const matches: Match[] = buildOfficialMatches();

export const groupMatches = matches.filter((m) => m.group !== undefined);

export function getMatch(matchIdStr: string): Match | undefined {
  return matches.find((m) => m.id === matchIdStr);
}

export function getFeaturedMatch(): Match {
  return matches.find((m) => m.featured) ?? matches[0];
}

export function getMatchesByStage(stagePrefix: string): Match[] {
  return matches.filter((m) =>
    m.stage.toLowerCase().includes(stagePrefix.toLowerCase()),
  );
}

export function getGroupMatches(group: string): Match[] {
  return groupMatches.filter((m) => m.group === group.toUpperCase());
}

export function getTeam(code: string): Team {
  return toTeam(code.toUpperCase());
}

export function formatMatchTitle(match: Match): string {
  if (match.homeTeam && match.awayTeam) {
    return `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  }
  return match.matchupLabel ?? match.stage;
}

export function formatVenueLine(match: Match): string {
  return `${match.venue} · ${match.city}`;
}
