import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pinFixtureCriticalMemories } from "@/lib/clone/recall-memories";
import { makeMatch, makeRecalledMemory } from "@/lib/test/fixtures";

const match = makeMatch({
  id: "m-fix",
  homeTeam: { code: "ENG", name: "England", flag: "eng" },
  awayTeam: { code: "PAN", name: "Panama", flag: "pan" },
});

describe("pinFixtureCriticalMemories", () => {
  it("pins correction and bias memories at the front", () => {
    const ranked = [
      makeRecalledMemory({
        id: "generic-1",
        text: "Some unrelated memory",
        finalScore: 0.9,
      }),
      makeRecalledMemory({
        id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
        text: "Correction: trust England here",
        type: "correction",
        source: "clone_correction",
        metadataMatchId: "m-fix",
        finalScore: 0.5,
      }),
      makeRecalledMemory({
        id: "11111111-2222-4333-8444-555555555555",
        text: "Always back England",
        type: "fan_profile",
        finalScore: 0.6,
      }),
    ];

    const pinned = pinFixtureCriticalMemories(ranked, match, {
      favoriteTeam: "England",
    });

    assert.equal(pinned[0]?.id, "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee");
    assert.equal(pinned[1]?.id, "11111111-2222-4333-8444-555555555555");
    assert.equal(pinned.length, 3);
  });
});
