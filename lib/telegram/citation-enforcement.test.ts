import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enforceCitationInMessage } from "@/lib/telegram/citation-enforcement";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";

function memory(
  id: string,
  text: string,
  overrides: Partial<TelegramRankedMemory> = {},
): TelegramRankedMemory {
  return {
    id,
    text,
    score: 0.8,
    rrfScore: 1,
    finalScore: 0.9,
    ...overrides,
  };
}

describe("enforceCitationInMessage", () => {
  const recalled = [
    memory("a", "I always back Brazil in knockouts"),
    memory("b", "Spain struggle against emotional teams"),
    memory("c", "I hate picking favorites"),
  ];

  it("keeps valid LLM citations", () => {
    const result = enforceCitationInMessage("Brazil energy again.", recalled, [
      "a",
    ]);
    assert.equal(result.citationSource, "llm");
    assert.equal(result.citedMemories.length, 1);
    assert.equal(result.citedMemories[0]?.id, "a");
    assert.equal(result.droppedInvalidIds.length, 0);
  });

  it("drops invalid cited IDs and records warnings", () => {
    const result = enforceCitationInMessage("Take that.", recalled, [
      "a",
      "missing-id",
    ]);
    assert.equal(result.citedMemories.length, 1);
    assert.deepEqual(result.droppedInvalidIds, ["missing-id"]);
    assert.ok(result.citationWarnings.some((w) => w.includes("Dropped")));
  });

  it("enforces top memory when LLM cites nothing", () => {
    const result = enforceCitationInMessage("Generic roast.", recalled);
    assert.equal(result.citationSource, "enforced");
    assert.equal(result.citedMemories[0]?.id, "a");
    assert.equal(result.citedMemories[0]?.citationSource, "enforced");
    assert.ok(result.message.includes("You literally said"));
  });

  it("enforces two citations when recall is strong", () => {
    const result = enforceCitationInMessage(
      "Double roast.",
      recalled,
      ["a"],
      { minCitations: 2, minCitationsWhenRecalledAtLeast: 3 },
    );
    assert.ok(result.citedMemories.length >= 2);
    assert.ok(
      result.citationWarnings.some((w) => w.includes("minimum 2 citation")),
    );
  });
});
