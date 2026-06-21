import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  apiTeamNameToCode,
  codesMatchFixture,
} from "@/lib/match-data/football-team-map";

describe("apiTeamNameToCode", () => {
  it("maps official team names", () => {
    assert.equal(apiTeamNameToCode("Brazil"), "BRA");
    assert.equal(apiTeamNameToCode("France"), "FRA");
  });

  it("maps API aliases", () => {
    assert.equal(apiTeamNameToCode("South Korea"), "KOR");
    assert.equal(apiTeamNameToCode("United States"), "USA");
    assert.equal(apiTeamNameToCode("Türkiye"), "TUR");
  });

  it("returns null for unknown team", () => {
    assert.equal(apiTeamNameToCode("Atlantis FC"), null);
  });
});

describe("codesMatchFixture", () => {
  it("matches home/away orientation", () => {
    assert.equal(codesMatchFixture("BRA", "FRA", "BRA", "FRA"), true);
  });

  it("matches reversed orientation", () => {
    assert.equal(codesMatchFixture("BRA", "FRA", "FRA", "BRA"), true);
  });

  it("rejects mismatched fixtures", () => {
    assert.equal(codesMatchFixture("BRA", "FRA", "BRA", "ARG"), false);
  });
});
