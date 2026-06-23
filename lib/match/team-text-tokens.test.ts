import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseMatchLabelTeams,
  tokenizeTextWithTeams,
} from "@/lib/match/team-text-tokens";

describe("parseMatchLabelTeams", () => {
  it("parses full country names", () => {
    const parsed = parseMatchLabelTeams("Croatia vs Ghana");
    assert.ok(parsed);
    assert.equal(parsed.homeCode, "CRO");
    assert.equal(parsed.awayCode, "GHA");
  });

  it("parses FIFA codes with score", () => {
    const parsed = parseMatchLabelTeams("POR vs COL (1-2)");
    assert.ok(parsed);
    assert.equal(parsed.homeCode, "POR");
    assert.equal(parsed.awayCode, "COL");
    assert.equal(parsed.scoreA, 1);
    assert.equal(parsed.scoreB, 2);
  });
});

describe("tokenizeTextWithTeams", () => {
  it("flags team names inside sentences", () => {
    const tokens = tokenizeTextWithTeams(
      "Knows user supports Portugal and hates Brazil",
    );
    const teams = tokens.filter((t) => t.type === "team").map((t) => t.code);
    assert.deepEqual(teams, ["POR", "BRA"]);
  });

  it("flags scoreline picks", () => {
    const tokens = tokenizeTextWithTeams("2-1 Ghana");
    assert.equal(tokens.some((t) => t.type === "team" && t.code === "GHA"), true);
  });
});
