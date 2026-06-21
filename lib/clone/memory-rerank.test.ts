import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  entityOverlapBoost,
  reciprocalRankFusion,
  recencyBoost,
  rerankMemoriesForMatch,
  selectDiverseMemories,
  typeWeight,
} from "@/lib/clone/memory-rerank";
import { makeMatch, makeRecalledMemory } from "@/lib/test/fixtures";

const match = makeMatch({ id: "m071" });

describe("typeWeight", () => {
  it("weights corrections higher than remembered", () => {
    const correction = makeRecalledMemory({
      text: "correction",
      type: "correction",
      source: "clone_correction",
    });
    const remembered = makeRecalledMemory({ text: "plain", type: "remembered" });
    assert.ok(typeWeight(correction) > typeWeight(remembered));
  });
});

describe("recencyBoost", () => {
  it("returns higher boost for recent memories", () => {
    const recent = makeRecalledMemory({
      text: "recent",
      createdAt: new Date().toISOString(),
    });
    const old = makeRecalledMemory({
      text: "old",
      createdAt: "2020-01-01T00:00:00.000Z",
    });
    assert.ok(recencyBoost(recent) > recencyBoost(old));
  });

  it("returns zero without createdAt", () => {
    assert.equal(recencyBoost(makeRecalledMemory({ text: "x" })), 0);
  });
});

describe("entityOverlapBoost", () => {
  it("boosts when memory mentions match teams", () => {
    const boost = entityOverlapBoost(
      makeRecalledMemory({ text: "Colombia physical style beats Portugal" }),
      match,
    );
    assert.ok(boost > 0);
  });

  it("adds extra boost for metadataMatchId", () => {
    const withMatch = entityOverlapBoost(
      makeRecalledMemory({
        text: "pick",
        metadataMatchId: "m071",
      }),
      match,
    );
    const without = entityOverlapBoost(
      makeRecalledMemory({ text: "pick" }),
      match,
    );
    assert.ok(withMatch > without);
  });
});

describe("reciprocalRankFusion", () => {
  it("merges multiple ranked lists", () => {
    const a = makeRecalledMemory({ id: "shared", text: "shared memory" });
    const b = makeRecalledMemory({ id: "only-b", text: "only in b" });
    const merged = reciprocalRankFusion([
      [a],
      [a, b],
    ]);
    assert.equal(merged.size, 2);
    assert.ok((merged.get("shared")?.rrfScore ?? 0) > (merged.get("only-b")?.rrfScore ?? 0));
  });
});

describe("selectDiverseMemories", () => {
  it("skips near-duplicate memories", () => {
    const ranked = [
      makeRecalledMemory({ id: "1", text: "Brazil loyalty picks always win", finalScore: 2 }),
      makeRecalledMemory({ id: "2", text: "Brazil loyalty picks always win!", finalScore: 1.9 }),
      makeRecalledMemory({ id: "3", text: "England choke in knockouts", finalScore: 1.5 }),
    ];
    const selected = selectDiverseMemories(ranked, 3);
    assert.ok(selected.length <= 2 || selected[0]?.id !== selected[1]?.id);
  });
});

describe("rerankMemoriesForMatch", () => {
  it("boosts corrections above telegram meta memories", () => {
    const memories = [
      makeRecalledMemory({
        id: "corr",
        text: "User corrected clone about Brazil",
        type: "correction",
        source: "clone_correction",
        rrfScore: 1.2,
        finalScore: 1.2,
      }),
      makeRecalledMemory({
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
      makeRecalledMemory({
        id: "submit",
        text: "Picked Brazil because of Neymar",
        type: "prediction_history_summary",
        source: "prediction_submit",
        metadataMatchId: "m071",
        rrfScore: 1.4,
        finalScore: 1.4,
      }),
      makeRecalledMemory({
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
