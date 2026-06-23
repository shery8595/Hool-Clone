import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeCloneWinner } from "@/lib/clone/normalize-clone-winner";
import { makeMatch } from "@/lib/test/fixtures";

const match = makeMatch({
  homeTeam: { code: "ENG", name: "England", flag: "eng" },
  awayTeam: { code: "PAN", name: "Panama", flag: "pan" },
});

describe("normalizeCloneWinner", () => {
  it("accepts exact team codes", () => {
    assert.equal(normalizeCloneWinner("ENG", match), "ENG");
    assert.equal(normalizeCloneWinner("pan", match), "PAN");
  });

  it("fuzzy-matches team names", () => {
    assert.equal(normalizeCloneWinner("England", match), "ENG");
    assert.equal(normalizeCloneWinner("Panama", match), "PAN");
  });

  it("uses fallback winner when unparseable", () => {
    assert.equal(normalizeCloneWinner("???", match, "ENG"), "ENG");
  });

  it("defaults to home when no fallback", () => {
    assert.equal(normalizeCloneWinner("???", match), "ENG");
  });
});
