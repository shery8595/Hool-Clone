import { query, queryOne } from "@/lib/db/client";
import { matchToDbFields } from "@/lib/match-data/mapper";
import { matches } from "@/lib/mock/matches";

export async function seedMatches(): Promise<{ inserted: number; total: number }> {
  let inserted = 0;

  for (const match of matches) {
    const fields = matchToDbFields(match);
    const existing = await queryOne<{ id: string }>(
      `select id from matches where external_id = $1`,
      [fields.external_id],
    );

    if (existing) {
      await query(
        `update matches set
           match_number = $2,
           tournament_stage = $3,
           group_code = $4,
           team_a_code = $5,
           team_b_code = $6,
           matchup_label = $7,
           venue = $8,
           city = $9,
           kickoff_at = $10,
           featured = $11
         where external_id = $1`,
        [
          fields.external_id,
          fields.match_number,
          fields.tournament_stage,
          fields.group_code,
          fields.team_a_code,
          fields.team_b_code,
          fields.matchup_label,
          fields.venue,
          fields.city,
          fields.kickoff_at,
          fields.featured,
        ],
      );
    } else {
      await query(
        `insert into matches (
           external_id, match_number, tournament_stage, group_code,
           team_a_code, team_b_code, matchup_label, venue, city,
           kickoff_at, featured
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         returning id`,
        [
          fields.external_id,
          fields.match_number,
          fields.tournament_stage,
          fields.group_code,
          fields.team_a_code,
          fields.team_b_code,
          fields.matchup_label,
          fields.venue,
          fields.city,
          fields.kickoff_at,
          fields.featured,
        ],
      );
      inserted++;
    }
  }

  return { inserted, total: matches.length };
}
