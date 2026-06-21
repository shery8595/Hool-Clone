import { queryOne } from "@/lib/db/client";
import { loadMatchByExternalId } from "@/lib/match-data/load-match-by-id";
import type { Match } from "@/lib/mock/types";

export type InferredRoastContext = {
  match: Match;
  matchDbId: string;
  matchContext: string;
  wrongPick?: string;
  actualWinner: string;
};

type RoastCandidateRow = {
  match_db_id: string;
  external_id: string;
  team_a_code: string | null;
  team_b_code: string | null;
  winner: string;
  score_a: number | null;
  score_b: number | null;
  predicted_winner: string | null;
  favorite_team: string | null;
};

function formatMatchLabel(row: RoastCandidateRow): string {
  return `${row.team_a_code ?? "?"} vs ${row.team_b_code ?? "?"} (${row.score_a ?? "?"}-${row.score_b ?? "?"})`;
}

function rowToContext(
  row: RoastCandidateRow,
  match: Match,
): InferredRoastContext {
  const favoriteInMatch =
    row.favorite_team &&
    (row.team_a_code === row.favorite_team ||
      row.team_b_code === row.favorite_team);

  const wrongPick =
    row.predicted_winner && row.predicted_winner !== row.winner
      ? row.predicted_winner
      : favoriteInMatch && row.favorite_team !== row.winner
        ? row.favorite_team
        : row.predicted_winner ?? undefined;

  return {
    match,
    matchDbId: row.match_db_id,
    matchContext: formatMatchLabel(row),
    wrongPick: wrongPick ?? undefined,
    actualWinner: row.winner,
  };
}

async function findRoastCandidate(
  userId: string,
  matchExternalId?: string,
): Promise<InferredRoastContext | null> {
  if (matchExternalId) {
    const match = await loadMatchByExternalId(matchExternalId);
    if (!match) return null;

    const row = await queryOne<RoastCandidateRow>(
      `select m.id as match_db_id, m.external_id, m.team_a_code, m.team_b_code,
              m.winner, m.score_a, m.score_b, p.predicted_winner,
              fp.favorite_team
       from matches m
       left join predictions p on p.match_id = m.id and p.user_id = $1
       left join fan_profiles fp on fp.user_id = $1
       where m.external_id = $2
       limit 1`,
      [userId, matchExternalId],
    );
    if (!row?.winner) return null;
    return rowToContext(row, match);
  }

  const row = await queryOne<RoastCandidateRow>(
    `select m.id as match_db_id, m.external_id, m.team_a_code, m.team_b_code,
            m.winner, m.score_a, m.score_b, p.predicted_winner,
            fp.favorite_team
     from matches m
     join fan_profiles fp on fp.user_id = $1
     left join predictions p on p.match_id = m.id and p.user_id = $1
     where m.status = 'final'
       and m.winner is not null
       and m.kickoff_at > now() - interval '14 days'
       and (
         (p.predicted_winner is not null and p.predicted_winner <> m.winner)
         or (
           fp.favorite_team is not null
           and fp.favorite_team in (m.team_a_code, m.team_b_code)
           and m.winner <> fp.favorite_team
         )
       )
     order by m.kickoff_at desc
     limit 1`,
    [userId],
  );

  if (!row) return null;

  const match = await loadMatchByExternalId(row.external_id);
  if (!match) return null;

  return rowToContext(row, match);
}

export async function inferRoastContext(
  userId: string,
  matchExternalId?: string,
): Promise<InferredRoastContext | null> {
  return findRoastCandidate(userId, matchExternalId?.trim() || undefined);
}
