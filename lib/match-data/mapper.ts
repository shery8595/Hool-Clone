import { toTeam } from "@/lib/mock/matches";
import { resolveMatch } from "@/lib/match-data/match-status";
import type { Match, MatchStatus } from "@/lib/mock/types";
export type DbMatchRow = {
  id: string;
  external_id: string;
  match_number: number;
  tournament_stage: string;
  group_code: string | null;
  team_a_code: string | null;
  team_b_code: string | null;
  matchup_label: string | null;
  venue: string;
  city: string;
  kickoff_at: Date;
  status: string;
  score_a: number | null;
  score_b: number | null;
  winner: string | null;
  featured: boolean;
};

function toMatchStatus(status: string): MatchStatus {
  if (
    status === "scheduled" ||
    status === "live" ||
    status === "final" ||
    status === "postponed" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "scheduled";
}

export function dbMatchToMatch(row: DbMatchRow): Match {
  const hasTeams = Boolean(row.team_a_code && row.team_b_code);

  return resolveMatch({
    id: row.external_id,
    matchNumber: row.match_number,
    stage: row.tournament_stage,
    group: row.group_code ?? undefined,
    homeTeam: row.team_a_code ? toTeam(row.team_a_code) : null,
    awayTeam: row.team_b_code ? toTeam(row.team_b_code) : null,
    matchupLabel: hasTeams ? undefined : (row.matchup_label ?? "TBD v TBD"),
    kickoffAt: row.kickoff_at.toISOString(),
    venue: row.venue,
    city: row.city,
    featured: row.featured,
    status: toMatchStatus(row.status),
    homeScore: row.score_a,
    awayScore: row.score_b,
    winnerCode: row.winner,
  });
}
export function matchToDbFields(match: Match) {
  return {
    external_id: match.id,
    match_number: match.matchNumber,
    tournament_stage: match.stage,
    group_code: match.group ?? null,
    team_a_code: match.homeTeam?.code ?? null,
    team_b_code: match.awayTeam?.code ?? null,
    matchup_label: match.matchupLabel ?? null,
    venue: match.venue,
    city: match.city,
    kickoff_at: match.kickoffAt,
    featured: match.featured ?? false,
  };
}
