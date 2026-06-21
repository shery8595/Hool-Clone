import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import {
  isRepeatingReply,
  pickContradictionForTurn,
} from "@/lib/debate/thread-variation";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";

describe("isRepeatingReply", () => {
  it("detects identical prior clone text", () => {
    const prior = ["You picked England twice last week. I have receipts."];
    assert.equal(
      isRepeatingReply("You picked England twice last week. I have receipts.", prior),
      true,
    );
  });

  it("allows sufficiently different replies", () => {
    const prior = ["You picked England twice last week. I have receipts."];
    assert.equal(
      isRepeatingReply("Brazil loyalty drives your knockout picks.", prior),
      false,
    );
  });
});

describe("pickContradictionForTurn", () => {
  const contradictions: ContradictionFinding[] = [
    { id: "l1", kind: "loyalty", text: "Loyalty contradiction A", label: "Loyalty", severity: 8 },
    { id: "r1", kind: "rival", text: "Rival contradiction B", label: "Rival", severity: 6 },
  ];

  it("prefers topic-matching contradiction", () => {
    const analysis = analyzeDebateTurn("I'm loyal to Brazil", []);
    const picked = pickContradictionForTurn(contradictions, analysis, 0);
    assert.equal(picked?.kind, "loyalty");
  });

  it("rotates by turn index when no topic match", () => {
    const analysis = analyzeDebateTurn("Hello there", []);
    const first = pickContradictionForTurn(contradictions, analysis, 0);
    const second = pickContradictionForTurn(contradictions, analysis, 1);
    assert.notEqual(first?.text, second?.text);
  });
});
