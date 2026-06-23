import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { alignEvolutionCitations } from "@/lib/evolution/align-evolution-citations";
import { buildEvolutionPhaseReply } from "@/lib/evolution/build-evolution-chat";
import {
  buildEvolutionChatUserPrompt,
} from "@/lib/evolution/evolution-chat-prompts";
import { memoriesForEvolutionPhase } from "@/lib/evolution/evolution-phase-memories";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";

function memory(
  id: string,
  text: string,
  extra?: Partial<MemoryReceipt>,
): MemoryReceipt {
  return {
    id,
    number: Number(id.replace(/\D/g, "")) || 1,
    type: "remembered",
    text,
    date: "2026-01-01T00:00:00.000Z",
    publicVisible: true,
    usedInPrediction: false,
    ...extra,
  };
}

function debateMessage(
  role: DebateMessage["role"],
  text: string,
): DebateMessage {
  return {
    id: `${role}-${text}`,
    role,
    text,
    timestamp: "2026-01-01T00:00:00.000Z",
  };
}

describe("memoriesForEvolutionPhase", () => {
  it("returns zero memories for day 1 and all memories for day 7", () => {
    const receipts = [
      memory("m1", "first"),
      memory("m2", "second"),
      memory("m3", "third"),
    ];
    assert.equal(memoriesForEvolutionPhase("day1", receipts).length, 0);
    assert.equal(memoriesForEvolutionPhase("day7", receipts).length, 3);
  });
});

describe("buildEvolutionChatUserPrompt", () => {
  it("includes the full phase catalog without slicing", () => {
    const phaseMemories = Array.from({ length: 16 }, (_, index) =>
      memory(`m${index + 1}`, `memory line ${index + 1}`),
    );

    const prompt = buildEvolutionChatUserPrompt({
      phaseLabel: "Day 7 · Full memory clone",
      maturityLabel: "Learner",
      phaseMemories,
      transcript: "",
      userMessage: "who do u think i support",
    });

    for (let index = 1; index <= 16; index += 1) {
      assert.match(prompt, new RegExp(`memory line ${index}`));
    }
  });
});

describe("alignEvolutionCitations", () => {
  it("trusts valid cited memory ids from the phase catalog", () => {
    const catalog = [
      memory("m16", "Favorite team is Portugal.", { number: 16 }),
      memory(
        "m13",
        "Correction: japan are my second favourite team and are the dark horses of the tournament.",
        { number: 13 },
      ),
    ];

    const cited = alignEvolutionCitations(
      "Your second favorite is Japan.",
      ["m13"],
      catalog,
      "my second fav team?",
      [],
    );

    assert.equal(cited.length, 1);
    assert.match(cited[0]!.text.toLowerCase(), /japan/);
  });

  it("does not override explicit ids with unrelated search-term matches", () => {
    const catalog = [
      memory("m16", "Favorite team is Portugal.", { number: 16 }),
      memory(
        "m13",
        "Correction: japan are my second favourite team and are the dark horses of the tournament.",
        { number: 13 },
      ),
      memory(
        "m5",
        "[prediction] Portugal vs Uzbekistan: picked UZB 1-1. Reasoning: portugal may underperform",
        { number: 5, memorySource: "prediction_submit" },
      ),
    ];

    const cited = alignEvolutionCitations(
      "Japan is your second favorite.",
      ["m13"],
      catalog,
      "my second fav team?",
      [],
    );

    assert.equal(cited[0]!.id, "m13");
    assert.doesNotMatch(cited[0]!.text.toLowerCase(), /underperform/);
  });
});

describe("buildEvolutionPhaseReply", () => {
  it("does not leak loyalty knowledge on day 1", () => {
    const result = buildEvolutionPhaseReply({
      phaseId: "day1",
      userMessage: "who do u think i support",
      recentMessages: [],
      allMemoryReceipts: [
        memory("m1", "User bleeds Portugal — loyalty over stats."),
        memory(
          "m2",
          "[prediction] Portugal vs Uzbekistan: picked UZB 1-1. Reasoning: portugal may underperform",
          { memorySource: "prediction_submit" },
        ),
      ],
      memoryTimeMachine: null,
    });

    assert.equal(result.memoryCount, 0);
    assert.equal(result.citedReceipts.length, 0);
    assert.doesNotMatch(result.reply.toLowerCase(), /portugal/);
    assert.match(result.reply.toLowerCase(), /don't know|no walrus|train/);
  });

  it("returns ranked receipt-backed fallback on day 7", () => {
    const receipts = [
      memory("m16", "Favorite team is Portugal.", { memorySource: "onboarding" }),
      memory(
        "m13",
        "Correction: japan are my second favourite team and are the dark horses of the tournament Match: Tunisia vs Japan.",
      ),
      memory(
        "m5",
        "[prediction] Portugal vs Uzbekistan: picked UZB 1-1. Reasoning: portugal may underperform",
        { memorySource: "prediction_submit" },
      ),
    ];

    const result = buildEvolutionPhaseReply({
      phaseId: "day7",
      userMessage: "my second fav team?",
      recentMessages: [],
      allMemoryReceipts: receipts,
      memoryTimeMachine: null,
    });

    assert.match(result.reply.toLowerCase(), /japan/);
    assert.match(result.citedReceipts[0]!.text.toLowerCase(), /second favourite/);
    assert.doesNotMatch(result.reply.toLowerCase(), /receipt #/);
  });

  it("uses thread context to answer an other-than-primary follow-up", () => {
    const receipts = [
      memory("m16", "Favorite team is Portugal.", { memorySource: "onboarding" }),
      memory(
        "m13",
        "Correction: japan are my second favourite team and are the dark horses of the tournament Match: Tunisia vs Japan.",
      ),
      memory(
        "m4",
        "Correction: well cristiano underperformed in previous match Match: Portugal vs Uzbekistan.",
      ),
    ];

    const result = buildEvolutionPhaseReply({
      phaseId: "day7",
      userMessage: "i meant aside for portugal",
      recentMessages: [debateMessage("user", "what is my second fav team")],
      allMemoryReceipts: receipts,
      memoryTimeMachine: null,
    });

    assert.match(result.reply.toLowerCase(), /japan/);
    assert.match(result.citedReceipts[0]!.text.toLowerCase(), /japan/);
    assert.doesNotMatch(result.citedReceipts[0]!.text.toLowerCase(), /cristiano/);
  });

  it("answers primary favorite from onboarding memory, not predictions", () => {
    const receipts = [
      memory("m1", "The user predicts mostly with stats.", {
        memorySource: "onboarding",
      }),
      memory("m2", "England — great team, always back them.", {
        memorySource: "onboarding",
      }),
      memory(
        "m3",
        "[prediction] Spain vs Saudi Arabia (Group H · Group Stage): picked ESP 2-0 at 90% confidence. Feeling: hyped. Reasoning: because spain are a much better team",
        { memorySource: "prediction_submit" },
      ),
    ];

    const result = buildEvolutionPhaseReply({
      phaseId: "day4",
      userMessage: "what is my favourite team",
      recentMessages: [],
      allMemoryReceipts: receipts,
      memoryTimeMachine: null,
    });

    assert.match(result.reply.toLowerCase(), /england/);
    assert.match(result.citedReceipts[0]!.text.toLowerCase(), /england/);
    assert.doesNotMatch(result.citedReceipts[0]!.text.toLowerCase(), /\[prediction\]/);
    assert.doesNotMatch(result.reply.toLowerCase(), /spain/);
  });

  it("answers most hated team from rival onboarding, not predictions", () => {
    const receipts = [
      memory("m1", "The user predicts mostly with stats.", {
        memorySource: "onboarding",
      }),
      memory("m2", "England — great team, always back them.", {
        memorySource: "onboarding",
      }),
      memory("m3", "France — they always disappoint in knockouts.", {
        memorySource: "onboarding",
      }),
      memory(
        "m4",
        "[prediction] Spain vs Saudi Arabia (Group H · Group Stage): picked ESP 2-0 at 90% confidence. Feeling: hyped. Reasoning: because spain are a much better team",
        { memorySource: "prediction_submit" },
      ),
    ];

    const result = buildEvolutionPhaseReply({
      phaseId: "day7",
      userMessage: "what is my most hated team",
      recentMessages: [],
      allMemoryReceipts: receipts,
      memoryTimeMachine: null,
    });

    assert.match(result.reply.toLowerCase(), /france/);
    assert.match(result.citedReceipts[0]!.text.toLowerCase(), /france/);
    assert.doesNotMatch(result.citedReceipts[0]!.text.toLowerCase(), /\[prediction\]/);
  });
});
