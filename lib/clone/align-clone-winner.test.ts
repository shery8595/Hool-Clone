import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alignCloneWinnerToPrior,
  nudgeScoresForWinner,
} from "@/lib/clone/align-clone-winner";
import type { MemoryBackedPrior } from "@/lib/clone/memory-backed-winner";

describe("alignCloneWinnerToPrior", () => {
  const strongPrior: MemoryBackedPrior = {
    winner: "ENG",
    confidence: "strong",
    reason: "Loyalty",
    supportingMemoryIds: ["mem-1"],
    excerpt: "Always back England",
  };

  it("overrides when strong prior conflicts and no supporting citations", () => {
    const result = alignCloneWinnerToPrior({
      llmWinner: "PAN",
      prior: strongPrior,
      citedMemoryIds: ["other-mem"],
    });
    assert.equal(result.winner, "ENG");
    assert.equal(result.adjusted, true);
    assert.ok(result.reasoningNote);
  });

  it("keeps LLM winner when supporting memory was cited", () => {
    const result = alignCloneWinnerToPrior({
      llmWinner: "PAN",
      prior: strongPrior,
      citedMemoryIds: ["mem-1"],
    });
    assert.equal(result.winner, "PAN");
    assert.equal(result.adjusted, false);
  });
});

describe("nudgeScoresForWinner", () => {
  it("bumps home score when home wins but was tied or losing", () => {
    const scores = nudgeScoresForWinner("ENG", "ENG", "PAN", 1, 1);
    assert.equal(scores.homeScore, 2);
    assert.equal(scores.awayScore, 1);
  });
});
