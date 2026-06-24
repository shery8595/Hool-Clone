import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickShowcaseMatch } from "@/lib/clone/clone-showcase";
import type { ClonePredictionEntry } from "@/lib/db/clone-predictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { Match } from "@/lib/mock/types";

function makeMatch(id: string, featured = false): Match {
  return {
    id,
    homeTeam: { code: "COL", name: "Colombia", flag: "COL" },
    awayTeam: { code: "POR", name: "Portugal", flag: "POR" },
    status: "scheduled",
    featured,
    kickoff: "2026-06-27T00:00:00Z",
    stage: "Group Stage",
    group: "K",
  };
}

function makeHistory(match: Match, winner: string): PredictionHistoryItem {
  return {
    match,
    prediction: {
      matchId: match.id,
      winner,
      homeScore: 2,
      awayScore: 1,
      confidence: 70,
      reasoning: "test",
      emotion: "hyped",
    },
  };
}

function makeClone(matchId: string, winner: string): ClonePredictionEntry {
  return {
    matchId,
    clone: {
      winner,
      homeScore: 2,
      awayScore: 1,
      confidence: 68,
      reasoning: "clone",
      receipts: [],
    },
    insight: null,
    trainingQuestion: null,
  };
}

describe("pickShowcaseMatch", () => {
  it("prefers featured match when clone prediction exists", () => {
    const featured = makeMatch("m071", true);
    const other = makeMatch("m068");
    const history = [
      makeHistory(other, "GHA"),
      makeHistory(featured, "POR"),
    ];
    const cloneByMatchId = new Map<string, ClonePredictionEntry>([
      ["m068", makeClone("m068", "CRO")],
      ["m071", makeClone("m071", "POR")],
    ]);

    const picked = pickShowcaseMatch({
      history,
      cloneByMatchId,
      matches: [other, featured],
    });

    assert.equal(picked?.match.id, "m071");
  });

  it("uses preferredMatchId when set", () => {
    const featured = makeMatch("m071", true);
    const other = makeMatch("m068");
    const history = [makeHistory(other, "GHA")];
    const cloneByMatchId = new Map<string, ClonePredictionEntry>([
      ["m068", makeClone("m068", "CRO")],
      ["m071", makeClone("m071", "POR")],
    ]);

    const picked = pickShowcaseMatch({
      history,
      cloneByMatchId,
      matches: [other, featured],
      preferredMatchId: "m071",
    });

    assert.equal(picked?.match.id, "m071");
  });
});
