import type { Match, MatchStatus } from "@/lib/mock/types";
import { isFootballApiConfigured } from "@/lib/env";

/** Typical match length + stoppage (minutes) */
export const MATCH_DURATION_MS = 105 * 60 * 1000;

export function matchStatus(match: Match): MatchStatus {
  return match.status ?? "scheduled";
}

function kickoffMs(match: Match): number {
  return new Date(match.kickoffAt).getTime();
}

/**
 * Status from DB when authoritative; otherwise infer from kickoff time
 * so past fixtures don't stay in "upcoming" when cron hasn't updated the row.
 */
export function effectiveMatchStatus(match: Match): MatchStatus {
  const stored = matchStatus(match);

  if (
    stored === "final" ||
    stored === "cancelled" ||
    stored === "postponed"
  ) {
    return stored;
  }

  if (stored === "live") {
    if (match.homeTeam && match.awayTeam) {
      const kickoff = kickoffMs(match);
      if (Date.now() >= kickoff + MATCH_DURATION_MS) {
        return "final";
      }
    }
    return "live";
  }

  if (!match.homeTeam || !match.awayTeam) {
    return stored;
  }

  if (isFootballApiConfigured()) {
    const kickoff = kickoffMs(match);
    const now = Date.now();
    if (now >= kickoff + MATCH_DURATION_MS) {
      return "final";
    }
    if (stored === "scheduled" && now >= kickoff) {
      return "live";
    }
    return stored;
  }

  const kickoff = kickoffMs(match);
  const now = Date.now();

  if (now < kickoff) return "scheduled";
  if (now < kickoff + MATCH_DURATION_MS) return "live";
  return "final";
}

function inferPlaceholderResult(match: Match): Pick<
  Match,
  "homeScore" | "awayScore" | "winnerCode"
> {
  const homeScore = (match.matchNumber % 3) + 1;
  const awayScore = match.matchNumber % 2;
  const winner =
    homeScore > awayScore
      ? match.homeTeam!.code
      : awayScore > homeScore
        ? match.awayTeam!.code
        : match.homeTeam!.code;

  return { homeScore, awayScore, winnerCode: winner };
}

/** Normalize match for display / partitioning (kickoff-aware). */
export function resolveMatch(match: Match): Match {
  const effective = effectiveMatchStatus(match);

  if (effective === "scheduled" || effective === "live") {
    if (match.status === effective) return match;
    return { ...match, status: effective };
  }

  if (effective === "final") {
    const hasScores =
      match.homeScore != null &&
      match.awayScore != null &&
      match.winnerCode != null;

    if (match.status === "final" && hasScores) return match;

    if (hasScores) {
      return { ...match, status: "final" };
    }

    if (!match.homeTeam || !match.awayTeam) {
      return { ...match, status: "final" };
    }

    if (isFootballApiConfigured()) {
      return { ...match, status: "final" };
    }

    return {
      ...match,
      status: "final",
      ...inferPlaceholderResult(match),
    };
  }

  return match;
}

export function resolveMatches(matches: Match[]): Match[] {
  return matches.map(resolveMatch);
}

export function isMatchFinished(match: Match): boolean {
  return effectiveMatchStatus(match) === "final";
}

export function isMatchLive(match: Match): boolean {
  return effectiveMatchStatus(match) === "live";
}

export function isMatchUpcoming(match: Match): boolean {
  return effectiveMatchStatus(match) === "scheduled";
}

export function partitionMatches(matches: Match[]): {
  upcoming: Match[];
  finished: Match[];
  live: Match[];
} {
  const resolved = resolveMatches(matches);
  const upcoming: Match[] = [];
  const finished: Match[] = [];
  const live: Match[] = [];

  for (const match of resolved) {
    if (isMatchFinished(match)) {
      finished.push(match);
    } else if (isMatchLive(match)) {
      live.push(match);
    } else if (isMatchUpcoming(match)) {
      upcoming.push(match);
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
  );
  finished.sort(
    (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime(),
  );

  return { upcoming, finished, live };
}

export function formatFinalScore(match: Match): string | null {
  const resolved = resolveMatch(match);
  if (
    resolved.homeScore == null ||
    resolved.awayScore == null ||
    !resolved.homeTeam ||
    !resolved.awayTeam
  ) {
    return null;
  }
  return `${resolved.homeScore}–${resolved.awayScore}`;
}

export function winnerTeamName(match: Match): string | null {
  const resolved = resolveMatch(match);
  if (!resolved.winnerCode || !resolved.homeTeam || !resolved.awayTeam) {
    return null;
  }
  if (resolved.winnerCode === resolved.homeTeam.code) {
    return resolved.homeTeam.name;
  }
  if (resolved.winnerCode === resolved.awayTeam.code) {
    return resolved.awayTeam.name;
  }
  return resolved.winnerCode;
}
