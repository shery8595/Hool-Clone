import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findDbMatch } from "@/lib/match-data/sync-match-results";
import type { NormalizedFixture } from "@/lib/match-data/fixture-types";

type Row = {
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

function makeRow(overrides: Partial<Row> & Pick<Row, "match_number" | "team_a_code" | "team_b_code" | "kickoff_at">): Row {
  return {
    id: `db-${overrides.match_number}`,
    external_id: `m${String(overrides.match_number).padStart(3, "0")}`,
    status: "scheduled",
    score_a: null,
    score_b: null,
    winner: null,
    ...overrides,
  };
}

function makeFixture(overrides: Partial<NormalizedFixture> & Pick<NormalizedFixture, "matchNumber" | "homeTeamName" | "awayTeamName" | "kickoffAt">): NormalizedFixture {
  return {
    providerId: String(overrides.matchNumber),
    status: "final",
    homeGoals: 4,
    awayGoals: 0,
    timeElapsed: "finished",
    finished: true,
    ...overrides,
  };
}

describe("findDbMatch", () => {
  it("matches by unique teams when API id and kickoff disagree with FIFA schedule", () => {
    const rows: Row[] = [
      makeRow({
        match_number: 38,
        team_a_code: "ESP",
        team_b_code: "KSA",
        kickoff_at: new Date("2026-06-21T16:00:00Z"),
      }),
      makeRow({
        match_number: 39,
        team_a_code: "BEL",
        team_b_code: "IRN",
        kickoff_at: new Date("2026-06-21T19:00:00Z"),
      }),
    ];

    const fixture = makeFixture({
      matchNumber: 39,
      homeTeamName: "Spain",
      awayTeamName: "Saudi Arabia",
      kickoffAt: "2026-06-21T07:00:00.000Z",
    });

    const match = findDbMatch(rows, fixture, "ESP", "KSA");
    assert.equal(match?.match_number, 38);
  });

  it("falls back to match number when teams align", () => {
    const rows: Row[] = [
      makeRow({
        match_number: 36,
        team_a_code: "TUN",
        team_b_code: "JPN",
        kickoff_at: new Date("2026-06-20T22:00:00"),
      }),
    ];

    const fixture = makeFixture({
      matchNumber: 36,
      homeTeamName: "Tunisia",
      awayTeamName: "Japan",
      kickoffAt: "2026-06-20T22:00:00.000Z",
    });

    const match = findDbMatch(rows, fixture, "TUN", "JPN");
    assert.equal(match?.match_number, 36);
  });

  it("does not pair by match number when teams disagree", () => {
    const rows: Row[] = [
      makeRow({
        match_number: 39,
        team_a_code: "BEL",
        team_b_code: "IRN",
        kickoff_at: new Date("2026-06-21T12:00:00"),
      }),
    ];

    const fixture = makeFixture({
      matchNumber: 39,
      homeTeamName: "Spain",
      awayTeamName: "Saudi Arabia",
      kickoffAt: "2026-06-21T12:00:00.000Z",
    });

    const match = findDbMatch(rows, fixture, "ESP", "KSA");
    assert.equal(match, undefined);
  });
});
