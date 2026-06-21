import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pinPredictionMemory } from "@/lib/telegram/recall-for-telegram-match";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";
import { primaryRecallSource } from "@/lib/telegram/message-recall-backend";

describe("pinPredictionMemory", () => {
  it("pins prediction_submit memory at rank one", () => {
    const ranked: TelegramRankedMemory[] = [
      {
        id: "other",
        text: "Some other memory",
        score: 0.9,
        rrfScore: 1.2,
        finalScore: 1.1,
      },
    ];

    const pinned = pinPredictionMemory(
      ranked,
      {
        id: "pick-1",
        text: "[prediction_submit] Brazil to win",
        type: "prediction_history_summary",
        source: "prediction_submit",
        createdAt: "2026-06-01T00:00:00.000Z",
        walrusBlobId: "blob-123",
      },
      "m071",
    );

    assert.equal(pinned[0]?.id, "pick-1");
    assert.equal(pinned[0]?.finalScore, 10);
    assert.equal(pinned[0]?.metadataMatchId, "m071");
    assert.equal(pinned.length, 2);
  });
});

describe("primaryRecallSource", () => {
  it("returns none when no memories were recalled", () => {
    assert.equal(primaryRecallSource([]), "none");
  });

  it("prefers walrus when any recalled memory is walrus-backed", () => {
    assert.equal(
      primaryRecallSource([
        { id: "1", text: "a", score: 1, rrfScore: 1, finalScore: 1, recallSource: "walrus" },
        {
          id: "2",
          text: "b",
          score: 1,
          rrfScore: 1,
          finalScore: 1,
          recallSource: "postgres_fallback",
        },
      ]),
      "walrus",
    );
  });

  it("returns postgres_fallback when only fallback memories exist", () => {
    assert.equal(
      primaryRecallSource([
        {
          id: "1",
          text: "a",
          score: 1,
          rrfScore: 1,
          finalScore: 1,
          recallSource: "postgres_fallback",
        },
      ]),
      "postgres_fallback",
    );
  });

  it("returns none when recall source is missing", () => {
    assert.equal(
      primaryRecallSource([
        { id: "1", text: "a", score: 1, rrfScore: 1, finalScore: 1 },
      ]),
      "none",
    );
  });
});
