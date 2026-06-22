import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MATCH_DURATION_MS,
  effectiveMatchStatus,
} from "@/lib/match-data/match-status";
import { makeMatch } from "@/lib/test/fixtures";

describe("effectiveMatchStatus", () => {
  it("returns final when stored as final", () => {
    const match = makeMatch({ status: "final" });
    assert.equal(effectiveMatchStatus(match), "final");
  });

  it("infers scheduled before kickoff without API", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const match = makeMatch({ status: "scheduled", kickoffAt: future });
    assert.equal(effectiveMatchStatus(match), "scheduled");
  });

  it("infers live during match window without API", () => {
    const kickoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const match = makeMatch({ status: "scheduled", kickoffAt: kickoff });
    assert.equal(effectiveMatchStatus(match), "live");
  });

  it("infers final when football API is configured past kickoff window", () => {
    const kickoff = new Date(Date.now() - MATCH_DURATION_MS - 60_000).toISOString();
    const match = makeMatch({ status: "scheduled", kickoffAt: kickoff });
    assert.equal(effectiveMatchStatus(match), "final");
  });

  it("promotes stale live status to final after duration", () => {
    const kickoff = new Date(Date.now() - MATCH_DURATION_MS - 60_000).toISOString();
    const match = makeMatch({ status: "live", kickoffAt: kickoff });
    assert.equal(effectiveMatchStatus(match), "final");
  });
});
