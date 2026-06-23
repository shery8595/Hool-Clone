import { query } from "@/lib/db/client";
import type { ClashDebateResult, ClashVerdict } from "@/lib/clash/types";

export type SavedClashBout = {
  id: string;
  slugA: string;
  slugB: string;
  matchId: string;
  winnerSlug: string | null;
  debate: ClashDebateResult;
  verdict: ClashVerdict | null;
  createdAt: string;
};

export type ArenaRecord = {
  wins: number;
  losses: number;
  draws: number;
};

type BoutRow = {
  id: string;
  slug_a: string;
  slug_b: string;
  match_id: string;
  winner_slug: string | null;
  debate_json: ClashDebateResult;
  verdict_json: ClashVerdict | null;
  created_at: Date;
};

function rowToBout(row: BoutRow): SavedClashBout {
  return {
    id: row.id,
    slugA: row.slug_a,
    slugB: row.slug_b,
    matchId: row.match_id,
    winnerSlug: row.winner_slug,
    debate: row.debate_json,
    verdict: row.verdict_json,
    createdAt: row.created_at.toISOString(),
  };
}

export async function saveClashBout(input: {
  slugA: string;
  slugB: string;
  matchId: string;
  debate: ClashDebateResult;
  verdict?: ClashVerdict | null;
}): Promise<SavedClashBout> {
  const winnerSlug = input.verdict?.winnerSlug ?? null;

  const row = await query<BoutRow>(
    `insert into clash_bouts (slug_a, slug_b, match_id, winner_slug, debate_json, verdict_json)
     values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
     returning *`,
    [
      input.slugA,
      input.slugB,
      input.matchId,
      winnerSlug,
      JSON.stringify({
        match: input.debate.match,
        participantA: input.debate.participantA,
        participantB: input.debate.participantB,
        turns: input.debate.turns,
      }),
      input.verdict ? JSON.stringify(input.verdict) : null,
    ],
  ).then((rows) => rows[0]);

  if (!row) {
    throw new Error("Failed to save clash bout");
  }

  return rowToBout(row);
}

export async function listRecentBouts(limit = 8): Promise<SavedClashBout[]> {
  const rows = await query<BoutRow>(
    `select * from clash_bouts
     order by created_at desc
     limit $1`,
    [limit],
  );
  return rows.map(rowToBout);
}

export async function getArenaRecord(slug: string): Promise<ArenaRecord> {
  const rows = await query<{
    wins: string;
    losses: string;
    draws: string;
  }>(
    `select
       count(*) filter (
         where winner_slug is not null and lower(winner_slug) = lower($1)
       )::text as wins,
       count(*) filter (
         where winner_slug is not null
           and lower(winner_slug) != lower($1)
           and (lower(slug_a) = lower($1) or lower(slug_b) = lower($1))
       )::text as losses,
       count(*) filter (
         where winner_slug is null
           and (lower(slug_a) = lower($1) or lower(slug_b) = lower($1))
       )::text as draws
     from clash_bouts
     where lower(slug_a) = lower($1) or lower(slug_b) = lower($1)`,
    [slug],
  );

  const row = rows[0];
  return {
    wins: Number(row?.wins ?? 0),
    losses: Number(row?.losses ?? 0),
    draws: Number(row?.draws ?? 0),
  };
}

export async function getArenaRecordsForSlugs(
  slugs: string[],
): Promise<Map<string, ArenaRecord>> {
  if (slugs.length === 0) return new Map();

  const rows = await query<{
    slug: string;
    wins: string;
    losses: string;
    draws: string;
  }>(
    `with slugs as (
       select unnest($1::text[]) as slug
     )
     select s.slug,
       count(*) filter (
         where b.winner_slug is not null and lower(b.winner_slug) = lower(s.slug)
       )::text as wins,
       count(*) filter (
         where b.winner_slug is not null
           and lower(b.winner_slug) != lower(s.slug)
           and (lower(b.slug_a) = lower(s.slug) or lower(b.slug_b) = lower(s.slug))
       )::text as losses,
       count(*) filter (
         where b.winner_slug is null
           and (lower(b.slug_a) = lower(s.slug) or lower(b.slug_b) = lower(s.slug))
       )::text as draws
     from slugs s
     left join clash_bouts b
       on lower(b.slug_a) = lower(s.slug) or lower(b.slug_b) = lower(s.slug)
     group by s.slug`,
    [slugs],
  );

  const map = new Map<string, ArenaRecord>();
  for (const row of rows) {
    map.set(row.slug, {
      wins: Number(row.wins ?? 0),
      losses: Number(row.losses ?? 0),
      draws: Number(row.draws ?? 0),
    });
  }
  return map;
}
