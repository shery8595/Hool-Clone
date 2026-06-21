import { queryOne } from "@/lib/db/client";
import {
  dbMatchToMatch,
  type DbMatchRow,
} from "@/lib/match-data/mapper";
import type { Match } from "@/lib/mock/types";

const MATCH_SELECT = `select id, external_id, match_number, tournament_stage, group_code,
       team_a_code, team_b_code, matchup_label, venue, city, kickoff_at,
       status, score_a, score_b, winner, featured
 from matches`;

export async function loadMatchByDbId(matchDbId: string): Promise<Match | null> {
  const row = await queryOne<DbMatchRow>(
    `${MATCH_SELECT} where id = $1`,
    [matchDbId],
  );
  if (!row) return null;
  return dbMatchToMatch(row);
}
