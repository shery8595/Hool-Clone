import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferMemoryBackedWinner } from "@/lib/clone/memory-backed-winner";
import { makeMatch, makeRecalledMemory } from "@/lib/test/fixtures";

const engPanama = makeMatch({
  id: "m-eng-pan",
  homeTeam: { code: "ENG", name: "England", flag: "eng" },
  awayTeam: { code: "PAN", name: "Panama", flag: "pan" },
});

describe("inferMemoryBackedWinner", () => {
  it("backs England when favorite is England vs Panama", () => {
    const prior = inferMemoryBackedWinner(
      engPanama,
      [
        makeRecalledMemory({
          id: "11111111-2222-4333-8444-555555555555",
          text: "Always back England with loyalty through thick and thin",
          type: "fan_profile",
        }),
      ],
      { favorite_team: "England", rival_team: null },
    );
    assert.equal(prior.winner, "ENG");
    assert.equal(prior.confidence, "strong");
    assert.ok(prior.supportingMemoryIds.length > 0);
  });

  it("picks against rival when rival is home team", () => {
    const engFra = makeMatch({
      homeTeam: { code: "ENG", name: "England", flag: "eng" },
      awayTeam: { code: "FRA", name: "France", flag: "fra" },
    });
    const prior = inferMemoryBackedWinner(
      engFra,
      [
        makeRecalledMemory({
          id: "22222222-3333-4333-8444-666666666666",
          text: "I never trust England in knockouts",
          type: "bias",
        }),
      ],
      { favorite_team: "France", rival_team: "England" },
    );
    assert.equal(prior.winner, "FRA");
    assert.equal(prior.confidence, "strong");
  });

  it("correction for this fixture overrides generic memory", () => {
    const prior = inferMemoryBackedWinner(
      engPanama,
      [
        makeRecalledMemory({
          id: "aaaaaaaa-bbbb-4333-8444-555555555555",
          text: "Correction: Panama are underrated. Match: England vs Panama. My pick: PAN 1-0. Clone picked: ENG 2-0.",
          type: "correction",
          source: "clone_correction",
          metadataMatchId: "m-eng-pan",
        }),
        makeRecalledMemory({
          id: "11111111-2222-4333-8444-555555555555",
          text: "Always back England",
          type: "fan_profile",
        }),
      ],
      { favorite_team: "England", rival_team: null },
    );
    assert.equal(prior.winner, "PAN");
    assert.equal(prior.confidence, "strong");
    assert.equal(prior.supportingMemoryIds[0], "aaaaaaaa-bbbb-4333-8444-555555555555");
  });

  it("underdog memory backs non-favorite side", () => {
    const prior = inferMemoryBackedWinner(
      engPanama,
      [
        makeRecalledMemory({
          id: "33333333-4444-4333-8444-777777777777",
          text: "I love an underdog upset every World Cup",
          type: "bias",
        }),
      ],
      { favorite_team: "England", rival_team: null },
    );
    assert.equal(prior.winner, "PAN");
    assert.equal(prior.confidence, "weak");
  });

  it("returns none when no signals apply", () => {
    const braFra = makeMatch({
      homeTeam: { code: "BRA", name: "Brazil", flag: "br" },
      awayTeam: { code: "FRA", name: "France", flag: "fr" },
    });
    const prior = inferMemoryBackedWinner(
      braFra,
      [],
      { favorite_team: "England", rival_team: "Germany" },
    );
    assert.equal(prior.winner, null);
    assert.equal(prior.confidence, "none");
  });
});
