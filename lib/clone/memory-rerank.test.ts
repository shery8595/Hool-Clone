import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rerankMemoriesForMatch } from "@/lib/clone/memory-rerank";
import type { RecalledMemory } from "@/lib/clone/recall-memories";
import type { Match } from "@/lib/mock/types";

const match: Match = {
  id: "m071",
  homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
  awayTeam: { code: "FRA", name: "France", flag: "fr" },
  kickoff: "2026-06-15T20:00:00Z",
  stage: "group",
  status: "final",
};

function recalled(
  overrides: Partial<RecalledMemory> & Pick<RecalledMemory, "text">,
): RecalledMemory {
  return {
    score: 0.7,
    rrfScore: 1,
    finalScore: 0.7,
    ...overrides,
  };
}

describe("rerankMemoriesForMatch", () => {
  it("boosts corrections above telegram meta memories", () => {
    const memories = [
      recalled({
        id: "corr",
        text: "User corrected clone about Brazil",
        type: "correction",
        source: "clone_correction",
        rrfScore: 1.2,
        finalScore: 1.2,
      }),
      recalled({
        id: "tg",
        text: "[live_goal] Clone reacted live",
        type: "prediction_history_summary",
        source: "telegram_live_goal",
        rrfScore: 1,
        finalScore: 1,
      }),
    ];

    const ranked = rerankMemoriesForMatch(memories, match, {
      liveMatchId: "m071",
    });

    assert.equal(ranked[0]?.id, "corr");
    assert.ok((ranked[0]?.finalScore ?? 0) > (ranked[1]?.finalScore ?? 0));
  });

  it("boosts prediction_submit for the live match", () => {
    const memories = [
      recalled({
        id: "submit",
        text: "Picked Brazil because of Neymar",
        type: "prediction_history_summary",
        source: "prediction_submit",
        metadataMatchId: "m071",
        rrfScore: 1.4,
        finalScore: 1.4,
      }),
      recalled({
        id: "bias",
        text: "I love underdogs",
        type: "bias",
        source: "onboarding",
        rrfScore: 1,
        finalScore: 1,
      }),
    ];

    const ranked = rerankMemoriesForMatch(memories, match, {
      liveMatchId: "m071",
    });

    assert.equal(ranked[0]?.id, "submit");
  });
});
