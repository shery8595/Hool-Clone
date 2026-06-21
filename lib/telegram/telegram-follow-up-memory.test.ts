import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLiveGoalFollowUpMemoryText,
  buildPostMatchFollowUpMemoryText,
} from "@/lib/telegram/telegram-follow-up-memory";

describe("buildLiveGoalFollowUpMemoryText", () => {
  it("includes scorer and cited memory", () => {
    const text = buildLiveGoalFollowUpMemoryText({
      matchLabel: "BRA vs FRA",
      scoringTeam: "Brazil",
      situation: "equalizer",
      citedMemories: [{ id: "1", text: "Brazil always score late" }],
    });
    assert.ok(text.includes("[live_goal]"));
    assert.ok(text.includes("Brazil"));
    assert.ok(text.includes("Brazil always score late"));
  });

  it("handles missing citation", () => {
    const text = buildLiveGoalFollowUpMemoryText({
      matchLabel: "BRA vs FRA",
      scoringTeam: null,
      situation: "opener",
      citedMemories: [],
    });
    assert.ok(text.includes("No strong prior memory"));
  });
});

describe("buildPostMatchFollowUpMemoryText", () => {
  it("formats win outcome with memory anchor", () => {
    const text = buildPostMatchFollowUpMemoryText({
      matchLabel: "BRA vs FRA",
      predictedWinner: "BRA",
      actualWinner: "BRA",
      outcome: "win",
      citedMemories: [{ id: "1", text: "Loyalty to Brazil" }],
    });
    assert.ok(text.includes("[post_match]"));
    assert.ok(text.includes("Outcome: win"));
    assert.ok(text.includes("Loyalty to Brazil"));
  });
});
