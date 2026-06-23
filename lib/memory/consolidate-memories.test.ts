import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clusterMemoriesForConsolidation,
  MIN_CLUSTER_SIZE,
} from "@/lib/memory/consolidate-memories";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import { isActiveMemory } from "@/lib/memory/memory-filters";

function memory(
  id: string,
  text: string,
  team?: string,
): StoredMemory {
  return {
    id,
    type: "prediction_pattern",
    text,
    metadata: team ? { team, source: "prediction_submit" } : {},
    storageStatus: "stored",
    publicVisible: true,
    createdAt: new Date().toISOString(),
  };
}

describe("clusterMemoriesForConsolidation", () => {
  it("groups similar Colombia pace memories", () => {
    const memories = [
      memory("a", "Colombia pace wins group stage games", "Colombia"),
      memory("b", "Colombia pace beats group stage opponents", "Colombia"),
      memory("c", "Colombia pace dominates group stage matches", "Colombia"),
      memory("d", "Argentina Messi brilliance wins tight knockout games", "Argentina"),
    ];

    const clusters = clusterMemoriesForConsolidation(memories);
    const colombiaCluster = clusters.find((c) =>
      c.every((m) => m.metadata.team === "Colombia"),
    );

    assert.ok(colombiaCluster);
    assert.ok(colombiaCluster.length >= MIN_CLUSTER_SIZE);
  });

  it("skips clusters smaller than MIN_CLUSTER_SIZE", () => {
    const memories = [
      memory("a", "Unique take one", "France"),
      memory("b", "Unique take two", "France"),
    ];

    const clusters = clusterMemoriesForConsolidation(memories);
    assert.equal(clusters.length, 0);
  });
});

describe("isActiveMemory", () => {
  it("excludes disputed, archived, and superseded", () => {
    assert.equal(isActiveMemory({}), true);
    assert.equal(isActiveMemory({ disputed: true }), false);
    assert.equal(isActiveMemory({ archived: true }), false);
    assert.equal(isActiveMemory({ superseded: true }), false);
  });
});
