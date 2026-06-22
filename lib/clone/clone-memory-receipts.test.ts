import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildStoredCloneReceipts,
  memoryRelevantToMatch,
  pickInfluentialReceiptsForFallback,
} from "@/lib/clone/clone-memory-receipts";
import { makeMatch, makeRecalledMemory } from "@/lib/test/fixtures";

const franceIraq = makeMatch({
  id: "m042",
  homeTeam: { code: "FRA", name: "France", flag: "fr" },
  awayTeam: { code: "IRQ", name: "Iraq", flag: "iq" },
});

describe("memoryRelevantToMatch", () => {
  it("excludes past predictions that do not mention this fixture", () => {
    const memory = makeRecalledMemory({
      text: "[prediction] Spain vs Saudi Arabia (Group H): picked ESP 2-0",
      source: "prediction_submit",
      type: "prediction_pattern",
    });

    assert.equal(memoryRelevantToMatch(memory, franceIraq), false);
  });

  it("includes corrections stored for this fixture", () => {
    const memory = makeRecalledMemory({
      text: "Correction: France have the best attack",
      source: "clone_correction",
      metadataMatchId: "m042",
    });

    assert.equal(memoryRelevantToMatch(memory, franceIraq), true);
  });
});

describe("pickInfluentialReceiptsForFallback", () => {
  it("skips unrelated onboarding memories", () => {
    const receipts = pickInfluentialReceiptsForFallback(
      [
        makeRecalledMemory({
          id: "11111111-2222-4333-8444-555555555555",
          text: "I drink coffee before every match",
          score: 0.95,
          source: "onboarding",
        }),
        makeRecalledMemory({
          id: "22222222-3333-4333-8444-666666666666",
          text: "Always back France with loyalty",
          score: 0.7,
        }),
      ],
      franceIraq,
      { favoriteTeam: "France" },
    );

    assert.equal(receipts.length, 1);
    assert.equal(receipts[0]?.memoryId, "22222222-3333-4333-8444-666666666666");
  });
});

describe("buildStoredCloneReceipts", () => {
  it("keeps only recalled memory ids cited by the model", () => {
    const recalled = makeRecalledMemory({
      id: "11111111-2222-4333-8444-555555555555",
      text: "Back France in big games",
      score: 0.8,
    });
    const recallById = new Map([[recalled.id!, recalled]]);

    const stored = buildStoredCloneReceipts(
      [
        {
          memoryId: recalled.id,
          summary: "Back France in big games",
          memoryType: "prediction_style",
          strength: "high",
        },
        {
          memoryId: "99999999-9999-4999-8999-999999999999",
          summary: "Fabricated memory",
          memoryType: "remembered",
          strength: "low",
        },
      ],
      recallById,
      { match: franceIraq },
    );

    assert.equal(stored.length, 1);
    assert.equal(stored[0]?.memoryId, recalled.id);
  });

  it("drops cited memories from other fixtures", () => {
    const franceMemory = makeRecalledMemory({
      id: "11111111-2222-4333-8444-555555555555",
      text: "Correction: France have the best attack",
      source: "clone_correction",
      metadataMatchId: "m042",
    });
    const spainMemory = makeRecalledMemory({
      id: "22222222-3333-4333-8444-666666666666",
      text: "[prediction] Spain vs Saudi Arabia: picked ESP 2-0",
      source: "prediction_submit",
      type: "prediction_pattern",
    });
    const recallById = new Map([
      [franceMemory.id!, franceMemory],
      [spainMemory.id!, spainMemory],
    ]);

    const stored = buildStoredCloneReceipts(
      [
        {
          memoryId: franceMemory.id,
          summary: "Correction: France have the best attack",
          memoryType: "correction",
          strength: "high",
        },
        {
          memoryId: spainMemory.id,
          summary: "[prediction] Spain vs Saudi Arabia: picked ESP 2-0",
          memoryType: "prediction_pattern",
          strength: "medium",
        },
      ],
      recallById,
      { match: franceIraq },
    );

    assert.equal(stored.length, 1);
    assert.equal(stored[0]?.memoryId, franceMemory.id);
  });
});
