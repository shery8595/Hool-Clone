import { query } from "@/lib/db/client";
import { isFootballApiConfigured } from "@/lib/env";
import { invalidateMatchDataCache } from "@/lib/match-data/db-match-data-adapter";
import type { NormalizedFixture } from "@/lib/match-data/fixture-types";
import {
  apiTeamNameToCode,
  codesMatchFixture,
} from "@/lib/match-data/football-team-map";
import { fetchWorldCup26FixturesForSync } from "@/lib/match-data/worldcup26-client";
import type { MatchStatus } from "@/lib/mock/types";

const KICKOFF_MATCH_WINDOW_MS = 6 * 60 * 60 * 1000;

export type LiveGoalEvent = {
  eventId: string;
  matchId: string;
  externalId: string;
  teamACode: string;
  teamBCode: string;
  scoreA: number;
  scoreB: number;
  scoringTeamCode: string | null;
};

type DbMatchRow = {
  id: string;
  external_id: string;
  match_number: number;
  team_a_code: string | null;
  team_b_code: string | null;
  kickoff_at: Date;
  status: string;
  score_a: number | null;
  score_b: number | null;
  winner: string | null;
};

function isFinishedStatus(status: MatchStatus): boolean {
  return status === "final";
}

function orientForDb(
  fixture: NormalizedFixture,
  apiHomeCode: string,
  apiAwayCode: string,
  dbHome: string,
  dbAway: string,
): {
  scoreA: number | null;
  scoreB: number | null;
  winner: string | null;
  status: MatchStatus;
} {
  const status = fixture.status;
  const { homeGoals, awayGoals } = fixture;

  let scoreA: number | null = null;
  let scoreB: number | null = null;

  if (homeGoals != null && awayGoals != null) {
    if (apiHomeCode === dbHome && apiAwayCode === dbAway) {
      scoreA = homeGoals;
      scoreB = awayGoals;
    } else {
      scoreA = awayGoals;
      scoreB = homeGoals;
    }
  }

  let winner: string | null = null;
  if (isFinishedStatus(status) && scoreA != null && scoreB != null) {
    if (scoreA > scoreB) winner = dbHome;
    else if (scoreB > scoreA) winner = dbAway;
  }

  return { scoreA, scoreB, winner, status };
}

function kickoffMatches(fixtureKickoff: string, dbKickoff: Date): boolean {
  const apiMs = new Date(fixtureKickoff).getTime();
  const dbMs = dbKickoff.getTime();
  return Math.abs(apiMs - dbMs) <= KICKOFF_MATCH_WINDOW_MS;
}

function findDbMatch(
  rows: DbMatchRow[],
  fixture: NormalizedFixture,
  apiHomeCode: string,
  apiAwayCode: string,
): DbMatchRow | undefined {
  if (fixture.matchNumber != null) {
    const byNumber = rows.find((row) => row.match_number === fixture.matchNumber);
    if (byNumber) return byNumber;
  }

  return rows.find(
    (row) =>
      row.team_a_code &&
      row.team_b_code &&
      codesMatchFixture(
        apiHomeCode,
        apiAwayCode,
        row.team_a_code,
        row.team_b_code,
      ) &&
      kickoffMatches(fixture.kickoffAt, row.kickoff_at),
  );
}

function rowNeedsUpdate(
  row: DbMatchRow,
  update: {
    status: MatchStatus;
    scoreA: number | null;
    scoreB: number | null;
    winner: string | null;
  },
): boolean {
  return (
    row.status !== update.status ||
    row.score_a !== update.scoreA ||
    row.score_b !== update.scoreB ||
    row.winner !== update.winner
  );
}

function detectScoringTeam(
  row: DbMatchRow,
  scoreA: number,
  scoreB: number,
): string | null {
  const prevA = row.score_a ?? 0;
  const prevB = row.score_b ?? 0;
  if (scoreA > prevA && scoreB === prevB) return row.team_a_code;
  if (scoreB > prevB && scoreA === prevA) return row.team_b_code;
  if (scoreA > prevA) return row.team_a_code;
  if (scoreB > prevB) return row.team_b_code;
  return null;
}

async function recordLiveGoalEvent(input: {
  matchId: string;
  scoreA: number;
  scoreB: number;
  scoringTeamCode: string | null;
}): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `insert into telegram_live_events (match_id, score_a, score_b, scoring_team_code)
     values ($1, $2, $3, $4)
     on conflict (match_id, score_a, score_b) do nothing
     returning id`,
    [input.matchId, input.scoreA, input.scoreB, input.scoringTeamCode],
  );
  return rows[0]?.id ?? null;
}

export type MatchSyncResult = {
  skipped: boolean;
  fixturesFetched: number;
  matched: number;
  updated: number;
  liveGoalEvents: LiveGoalEvent[];
  unmatched: string[];
  syncError?: string;
};

export async function syncMatchResultsFromApi(): Promise<MatchSyncResult> {
  if (!isFootballApiConfigured()) {
    return {
      skipped: true,
      fixturesFetched: 0,
      matched: 0,
      updated: 0,
      liveGoalEvents: [],
      unmatched: [],
    };
  }

  const [fixtures, dbRows] = await Promise.all([
    fetchWorldCup26FixturesForSync(),
    query<DbMatchRow>(
      `select id, external_id, match_number, team_a_code, team_b_code, kickoff_at,
              status, score_a, score_b, winner
       from matches
       where team_a_code is not null and team_b_code is not null`,
    ),
  ]);

  let matched = 0;
  let updated = 0;
  const unmatched: string[] = [];
  const liveGoalEvents: LiveGoalEvent[] = [];

  for (const fixture of fixtures) {
    const apiHomeCode = apiTeamNameToCode(fixture.homeTeamName);
    const apiAwayCode = apiTeamNameToCode(fixture.awayTeamName);

    if (!apiHomeCode || !apiAwayCode) {
      unmatched.push(
        `${fixture.homeTeamName} vs ${fixture.awayTeamName} (unknown team code)`,
      );
      continue;
    }

    const row = findDbMatch(dbRows, fixture, apiHomeCode, apiAwayCode);
    if (!row?.team_a_code || !row.team_b_code) {
      unmatched.push(`${fixture.homeTeamName} vs ${fixture.awayTeamName}`);
      continue;
    }

    matched += 1;
    const oriented = orientForDb(
      fixture,
      apiHomeCode,
      apiAwayCode,
      row.team_a_code,
      row.team_b_code,
    );

    const prevTotal = (row.score_a ?? 0) + (row.score_b ?? 0);
    const newTotal = (oriented.scoreA ?? 0) + (oriented.scoreB ?? 0);
    const scoreChanged =
      oriented.scoreA != null &&
      oriented.scoreB != null &&
      newTotal > prevTotal &&
      (oriented.status === "live" || row.status === "live");

    if (scoreChanged) {
      const scoringTeamCode = detectScoringTeam(
        row,
        oriented.scoreA!,
        oriented.scoreB!,
      );
      const eventId = await recordLiveGoalEvent({
        matchId: row.id,
        scoreA: oriented.scoreA!,
        scoreB: oriented.scoreB!,
        scoringTeamCode,
      });

      if (eventId) {
        liveGoalEvents.push({
          eventId,
          matchId: row.id,
          externalId: row.external_id,
          teamACode: row.team_a_code,
          teamBCode: row.team_b_code,
          scoreA: oriented.scoreA!,
          scoreB: oriented.scoreB!,
          scoringTeamCode,
        });
      }
    }

    if (!rowNeedsUpdate(row, oriented)) continue;

    await query(
      `update matches
       set status = $2,
           score_a = $3,
           score_b = $4,
           winner = $5
       where id = $1`,
      [
        row.id,
        oriented.status,
        oriented.scoreA,
        oriented.scoreB,
        oriented.winner,
      ],
    );

    row.status = oriented.status;
    row.score_a = oriented.scoreA;
    row.score_b = oriented.scoreB;
    row.winner = oriented.winner;
    updated += 1;
  }

  if (updated > 0) {
    invalidateMatchDataCache();
  }

  return {
    skipped: false,
    fixturesFetched: fixtures.length,
    matched,
    updated,
    liveGoalEvents,
    unmatched: unmatched.slice(0, 10),
  };
}
