import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeConsistencyScore,
  detectTemporalContradictions,
} from "@/lib/clone/temporal-contradictions";
import type { StoredMemory } from "@/lib/memory/memory-adapter";

function memory(
  id: string,
  text: string,
  createdAt: string,
  metadata?: Record<string, unknown>,
): StoredMemory {
  return {
    id,
    text,
    type: "fan_profile",
    publicVisible: true,
    storageStatus: "stored",
    createdAt,
    metadata: metadata ?? {},
  };
}

describe("detectTemporalContradictions", () => {
  it("finds positive vs negative takes on same team", () => {
    const findings = detectTemporalContradictions([
      memory("a", "Brazil are my favorites to win it all", "2026-06-01", {
        team: "Brazil",
      }),
      memory("b", "Brazil are overrated and always choke", "2026-06-05", {
        team: "Brazil",
      }),
    ]);
    assert.equal(findings.length, 1);
    assert.equal(findings[0]?.team.toLowerCase(), "brazil");
  });

  it("returns empty when sentiment is consistent", () => {
    const findings = detectTemporalContradictions([
      memory("a", "I love Brazil loyalty picks", "2026-06-01", { team: "Brazil" }),
      memory("b", "Brazil are my favorites forever", "2026-06-05", { team: "Brazil" }),
    ]);
    assert.equal(findings.length, 0);
  });
});

describe("computeConsistencyScore", () => {
  it("returns 100 with no contradictions", () => {
    assert.equal(computeConsistencyScore([]), 100);
  });

  it("penalizes each finding", () => {
    const findings = detectTemporalContradictions([
      memory("a", "I trust England", "2026-06-01", { team: "England" }),
      memory("b", "I hate England in knockouts", "2026-06-05", { team: "England" }),
    ]);
    assert.equal(computeConsistencyScore(findings), 95);
  });
});
