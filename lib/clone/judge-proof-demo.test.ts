import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCorrectionOverrideFromProfile,
  buildRoastRecordFromProfile,
  buildSameQuestionProofFromTimeMachine,
  collectCitedMemoryIds,
  STATIC_CORRECTION_OVERRIDE_PROOF,
  STATIC_SAME_QUESTION_PROOF,
} from "@/lib/clone/judge-proof-demo";
import { makeReceipt } from "@/lib/test/fixtures";

describe("buildSameQuestionProofFromTimeMachine", () => {
  it("returns fallback when machine is null", () => {
    const result = buildSameQuestionProofFromTimeMachine(null);
    assert.equal(result.source, "fallback");
    assert.equal(result.data.question, STATIC_SAME_QUESTION_PROOF.question);
  });

  it("builds live proof from time machine phases", () => {
    const result = buildSameQuestionProofFromTimeMachine({
      matchLabel: "Portugal vs Colombia",
      phases: [
        {
          id: "day1",
          label: "Day 1",
          prediction: "Draw 1-1",
          confidence: 30,
          reasoning: "Weak memory",
          receipts: [],
        },
        {
          id: "day4",
          label: "Day 4",
          prediction: "Portugal 2-1",
          confidence: 70,
          reasoning: "Correction applied",
          receipts: [{ summary: "User correction: trust Portugal", walrusBacked: true }],
        },
      ],
    });
    assert.equal(result.data.day1.answer, "Draw 1-1");
    assert.equal(result.data.day4.answer, "Portugal 2-1");
  });
});

describe("buildCorrectionOverrideFromProfile", () => {
  it("returns null without correction memory", () => {
    assert.equal(buildCorrectionOverrideFromProfile([], null), null);
  });

  it("builds correction override from walrus-backed memories", () => {
    const memories = [
      makeReceipt({
        id: "stale",
        text: "Portugal would struggle if Ronaldo is isolated",
        date: "2026-06-01",
        walrusBlobId: "real-blob-stale",
        storageStatus: "stored",
      }),
      makeReceipt({
        id: "corr",
        text: "User correction: I trust Portugal in tight games",
        date: "2026-06-05",
        walrusBlobId: "real-blob-corr",
        storageStatus: "stored",
      }),
    ];
    const result = buildCorrectionOverrideFromProfile(memories, null);
    assert.ok(result);
    assert.ok(result!.data.userCorrection.includes("trust Portugal"));
    assert.equal(result!.data.correctionBlobId, "real-blob-corr");
  });
});

describe("buildRoastRecordFromProfile", () => {
  it("returns null without roast-related memories", () => {
    assert.equal(
      buildRoastRecordFromProfile([
        makeReceipt({ id: "a", text: "Generic memory" }),
      ]),
      null,
    );
  });

  it("builds roast record from colombia/portugal memories", () => {
    const result = buildRoastRecordFromProfile([
      makeReceipt({
        id: "r1",
        text: "Colombia are physical and Portugal would struggle",
        date: "2026-06-10",
        walrusBlobId: "blob-roast",
      }),
    ]);
    assert.ok(result);
    assert.ok(result!.body.includes("Colombia"));
  });
});

describe("collectCitedMemoryIds", () => {
  it("collects memory ids from proof panels", () => {
    const ids = collectCitedMemoryIds(
      {
        ...STATIC_SAME_QUESTION_PROOF,
        day4: {
          ...STATIC_SAME_QUESTION_PROOF.day4,
          citedReceipt: {
            ...STATIC_SAME_QUESTION_PROOF.day4.citedReceipt,
            memoryId: "mem-a",
          },
        },
      },
      {
        ...STATIC_CORRECTION_OVERRIDE_PROOF,
        updatedTake: {
          ...STATIC_CORRECTION_OVERRIDE_PROOF.updatedTake,
          citedReceipt: {
            ...STATIC_CORRECTION_OVERRIDE_PROOF.updatedTake.citedReceipt,
            memoryId: "mem-b",
          },
        },
      },
    );
    assert.ok(ids.has("mem-a"));
    assert.ok(ids.has("mem-b"));
  });
});
