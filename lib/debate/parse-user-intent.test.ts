import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { parseDebateUserIntent } from "@/lib/debate/parse-user-intent";
import {
  shouldUseSpecializedDebateReply,
  trySpecializedDebateReply,
} from "@/lib/debate/specialized-replies";
import { makeReceipt } from "@/lib/test/fixtures";
import type { DebateMessage } from "@/lib/mock/types";

const franceReceipt = makeReceipt({
  id: "r8",
  number: 8,
  text: "[prediction] France vs Iraq (Group I): picked FRA 3-0 at 90% confidence. france have the best attack",
});

const portugalCorrection = makeReceipt({
  id: "r13",
  number: 13,
  text: "Correction: cristiano underperformed Match: Portugal vs Uzbekistan. My pick: UZB 1-1. Clone picked: POR 3-0.",
});

const franceCorrection = makeReceipt({
  id: "r9",
  number: 9,
  text: "Correction: france have the best attack Match: France vs Iraq. My pick: FRA 3-0. Clone picked: FRA 2-1.",
});

describe("parseDebateUserIntent", () => {
  it("detects France beating Portugal from pronoun context", () => {
    const recentMessages: DebateMessage[] = [
      {
        id: "opening",
        role: "clone",
        text: "You claim loyalty to Portugal...",
        timestamp: "7:00",
        citedReceipts: [franceReceipt],
      },
    ];

    const intent = parseDebateUserIntent(
      "well they really do and i think they will win against portugal",
      recentMessages,
      { favoriteTeam: "Portugal" },
    );

    assert.equal(intent.opponentTeam, "portugal");
    assert.equal(intent.backedTeam, "france");
    assert.ok(intent.affirmingPriorPoint);
  });

  it("detects favorite team switch to France", () => {
    const intent = parseDebateUserIntent("well i think france is my fav now", [], {
      favoriteTeam: "Portugal",
    });

    assert.equal(intent.declaringFavoriteTeam, "france");
    assert.ok(intent.intentSummary?.includes("switching"));
  });
});

describe("trySpecializedDebateReply head-to-head", () => {
  it("backs France over Portugal instead of arguing Portugal to win", () => {
    const message =
      "well they really do and i think they will win against portugal";
    const recentMessages: DebateMessage[] = [
      {
        id: "opening",
        role: "clone",
        text: "Portugal loyalty roast",
        timestamp: "7:00",
        citedReceipts: [franceReceipt],
      },
    ];
    const analysis = analyzeDebateTurn(message, recentMessages, {
      favoriteTeam: "Portugal",
    });

    const result = trySpecializedDebateReply({
      userMessage: message,
      analysis,
      catalog: [franceReceipt, portugalCorrection, franceCorrection],
      profileFavoriteTeam: "Portugal",
    });

    assert.ok(result);
    assert.ok(result.text.toLowerCase().includes("france"));
    assert.ok(result.text.toLowerCase().includes("portugal"));
    assert.ok(!result.text.toLowerCase().startsWith("portugal to win"));
    assert.ok(result.citedReceipts[0]?.text.toLowerCase().includes("france"));
  });

  it("acknowledges France as new favorite", () => {
    const message = "well i think france is my fav now";
    const analysis = analyzeDebateTurn(message, [], { favoriteTeam: "Portugal" });
    const result = trySpecializedDebateReply({
      userMessage: message,
      analysis,
      catalog: [franceCorrection, portugalCorrection],
      profileFavoriteTeam: "Portugal",
    });

    assert.ok(result);
    assert.ok(result.text.toLowerCase().includes("france is your team"));
    assert.equal(result.citedReceipts[0]?.id, "r9");
  });
});

describe("shouldUseSpecializedDebateReply", () => {
  it("does not force specialized path for vague winner claims", () => {
    const analysis = analyzeDebateTurn("Brazil will win the world cup", [], {
      favoriteTeam: "Brazil",
    });
    assert.equal(
      shouldUseSpecializedDebateReply(analysis, "Brazil will win the world cup"),
      false,
    );
  });
});
