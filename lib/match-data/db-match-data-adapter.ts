import { query, queryOne } from "@/lib/db/client";
import type { Match } from "@/lib/mock/types";
import {
  dbMatchToMatch,
  type DbMatchRow,
} from "@/lib/match-data/mapper";
import type { MatchDataAdapter } from "@/lib/match-data/match-data-adapter";

const MATCH_LIST_TTL_MS = 60_000;
let cachedMatches: Match[] | null = null;
let cachedMatchesAt = 0;

export class DbMatchDataAdapter implements MatchDataAdapter {
  async listMatches(): Promise<Match[]> {
    const now = Date.now();
    if (cachedMatches && now - cachedMatchesAt < MATCH_LIST_TTL_MS) {
      return cachedMatches;
    }

    const rows = await query<DbMatchRow>(
      `select * from matches order by match_number asc`,
    );
    cachedMatches = rows.map(dbMatchToMatch);
    cachedMatchesAt = now;
    return cachedMatches;
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const row = await queryOne<DbMatchRow>(
      `select * from matches where external_id = $1`,
      [matchId],
    );
    return row ? dbMatchToMatch(row) : null;
  }
}
