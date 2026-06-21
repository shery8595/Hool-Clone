import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  huntContradictions,
  pickDashboardContradiction,
} from "@/lib/clone/contradiction-hunter";
import { makeMatch } from "@/lib/test/fixtures";
import type { PredictionHistoryItem } from "@/lib/db/predictions";

function historyItem(
  favorite: string,
  winnerCode: string,
  stage = "Knockout Round",
): PredictionHistoryItem {
  const match = makeMatch({
    homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
    awayTeam: { code: "ARG", name: "Argentina", flag: "arg" },
    stage,
    status: "final",
    winnerCode,
    homeScore: winnerCode === "BRA" ? 2 : 0,
    awayScore: winnerCode === "ARG" ? 2 : 1,
  });
  return {
    match,
    prediction: {
      matchId: match.id,
      winner: winnerCode,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      confidence: 70,
      reasoning: "test",
      emotion: "calm",
    },
    matchResult: {
      status: "final",
      winner: winnerCode,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
    },
  };
}

describe("huntContradictions", () => {
  it("finds loyalty abandonment when favorite not backed", () => {
    const findings = huntContradictions({
      profile: {
        favorite_team: "Brazil",
        rival_team: "Argentina",
        preferred_style: "loyalty",
        summary: null,
      },
      history: [
        historyItem("Brazil", "ARG"),
        historyItem("Brazil", "ARG"),
        historyItem("Brazil", "ARG"),
      ],
      memoryDrivers: ["loyalty"],
      memoryTexts: ["I am loyal to Brazil through thick and thin"],
    });
    assert.ok(findings.some((f) => f.kind === "loyalty"));
  });

  it("finds underdog contradiction from memory claim", () => {
    const findings = huntContradictions({
      profile: {
        favorite_team: "Brazil",
        rival_team: null,
        preferred_style: "chaos",
        summary: null,
      },
      history: [
        historyItem("Brazil", "BRA", "Group Stage"),
        historyItem("Brazil", "BRA", "Group Stage"),
        historyItem("Brazil", "BRA", "Group Stage"),
      ],
      memoryDrivers: [],
      memoryTexts: ["I always root for the underdog in World Cup matches"],
    });
    assert.ok(findings.some((f) => f.kind === "underdog"));
  });

  it("returns empty when insufficient data", () => {
    const findings = huntContradictions({
      profile: null,
      history: [],
      memoryDrivers: [],
      memoryTexts: [],
    });
    assert.equal(findings.length, 0);
  });
});

describe("pickDashboardContradiction", () => {
  it("returns top hunter finding", () => {
    const picked = pickDashboardContradiction(
      [
        {
          id: "1",
          kind: "rival",
          text: "Rival betrayal",
          label: "Rival",
          severity: 9,
        },
      ],
      null,
    );
    assert.equal(picked?.source, "hunter");
    assert.equal(picked?.text, "Rival betrayal");
  });

  it("falls back to clone disagreement", () => {
    const picked = pickDashboardContradiction([], {
      text: "Clone disagrees",
      label: "Clone",
    });
    assert.equal(picked?.source, "clone");
  });
});
