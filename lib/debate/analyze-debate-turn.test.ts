import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import type { DebateMessage } from "@/lib/mock/types";

describe("analyzeDebateTurn", () => {
  it("detects loyalty topic", () => {
    const analysis = analyzeDebateTurn("I'm loyal to Brazil no matter what", []);
    assert.ok(analysis.topics.includes("loyalty"));
  });

  it("detects memory dispute", () => {
    const analysis = analyzeDebateTurn("Please correct that memory — it's wrong", []);
    assert.equal(analysis.disputingMemory, true);
    assert.ok(analysis.topics.includes("correction"));
  });

  it("detects denying prior claim", () => {
    const analysis = analyzeDebateTurn("I never said I predict with stats", []);
    assert.equal(analysis.denyingStyleClaim, true);
  });

  it("detects winner claim and entities", () => {
    const analysis = analyzeDebateTurn("Brazil will win the World Cup", [], {
      favoriteTeam: "Brazil",
    });
    assert.equal(analysis.winnerClaim, true);
    assert.ok(analysis.searchTerms.includes("brazil"));
  });

  it("collects prior cited receipt ids from clone messages", () => {
    const messages: DebateMessage[] = [
      {
        id: "c1",
        role: "clone",
        text: "Receipt cited",
        timestamp: "10:00",
        citedReceipts: [{ id: "mem-abc", text: "x", type: "remembered", date: "2026-01-01", publicVisible: true }],
      },
    ];
    const analysis = analyzeDebateTurn("Push back", messages);
    assert.deepEqual(analysis.priorCitedIds, ["mem-abc"]);
    assert.equal(analysis.cloneTurnIndex, 1);
  });
});
