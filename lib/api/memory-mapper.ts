import type { StoredMemory } from "@/lib/memory/memory-adapter";
import { formatProvenanceLabel } from "@/lib/clone/memory-provenance";
import { recallSourceFromMetadata } from "@/lib/memory/recall-provenance";
import {
  buildLineageContextFromMemories,
  buildMemoryLineage,
  type MemoryLineageContext,
} from "@/lib/api/memory-lineage";
import type { MemoryReceipt, RecallSource } from "@/lib/mock/types";

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function metadataRecallSource(
  metadata: Record<string, unknown>,
): ReturnType<typeof recallSourceFromMetadata> {
  return recallSourceFromMetadata(metadata);
}

export function storedMemoryToReceipt(
  memory: StoredMemory,
  index: number,
  context?: MemoryLineageContext,
): MemoryReceipt {
  const metadata = memory.metadata ?? {};
  const metadataType = metadata.source;
  const type =
    memory.type === "correction" ||
    metadataType === "debate" ||
    metadataType === "debate_highlight"
      ? "remembered"
      : memory.type === "used" || metadataType === "prediction"
        ? "used"
        : memory.type === "inferred"
          ? "inferred"
          : "remembered";

  const matchId = metadataString(metadata, "matchId");
  const memorySource =
    metadataString(metadata, "source") ??
    (memory.type === "correction" ? "correction" : undefined);

  return {
    id: memory.id,
    number: index + 1,
    type,
    text: memory.text,
    date: memory.createdAt,
    matchContext: matchId ? `Match ${matchId}` : undefined,
    publicVisible: memory.publicVisible,
    usedInPrediction: type === "used",
    storageStatus: memory.storageStatus as
      | "stored"
      | "pending"
      | "failed"
      | undefined,
    walrusBlobId: metadataString(metadata, "walrusBlobId"),
    walrusNamespace: metadataString(metadata, "walrusNamespace"),
    walrusJobId: metadataString(metadata, "walrusJobId"),
    recallSource: metadataRecallSource(metadata),
    memorySource,
    provenanceLabel: formatProvenanceLabel(
      memorySource,
      memory.createdAt,
      matchId,
    ),
    lineage: buildMemoryLineage(memory, context),
  };
}

export function storedMemoriesToReceipts(
  memories: StoredMemory[],
): MemoryReceipt[] {
  const context = buildLineageContextFromMemories(memories);
  return memories.map((memory, index) =>
    storedMemoryToReceipt(memory, index, context),
  );
}
