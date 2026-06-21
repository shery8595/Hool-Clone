import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContradictionFinding } from "@/lib/clone/contradiction-hunter";
import { filterDebateContradictions } from "@/lib/debate/filter-contradictions";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";

function contradiction(
  kind: ContradictionFinding["kind"],
  text: string,
): ContradictionFinding {
  return { id: kind, kind, text, label: kind, severity: 6 };
}

describe("filterDebateContradictions", () => {
  const pool: ContradictionFinding[] = [
    contradiction("style", "You claim stats but pick with loyalty"),
    contradiction("loyalty", "You say loyal but pick rivals"),
    contradiction("rival", "You hate Argentina but back them"),
  ];

  it("removes style contradictions when denying style claim", () => {
    const analysis = analyzeDebateTurn("I never said I predict with stats", []);
    const filtered = filterDebateContradictions(pool, analysis, []);
    assert.ok(!filtered.some((c) => c.kind === "style"));
  });

  it("prefers entity-relevant kinds when entities mentioned", () => {
    const analysis = analyzeDebateTurn("England is overrated", []);
    const filtered = filterDebateContradictions(pool, analysis, []);
    assert.ok(filtered.every((c) => c.kind === "loyalty" || c.kind === "rival"));
  });

  it("drops style when loyalty memories dominate", () => {
    const analysis = analyzeDebateTurn("Talk football", []);
    const memoryTexts = [
      "I am loyal to Brazil",
      "Loyalty over everything",
      "Stats matter sometimes",
    ];
    const filtered = filterDebateContradictions(pool, analysis, memoryTexts);
    assert.ok(!filtered.some((c) => c.kind === "style"));
  });
});
