import type { StoredMemory } from "@/lib/memory/memory-adapter";
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
): RecallSource | undefined {
  if (metadata.source === "walrus") return "walrus";
  if (metadata.source === "postgres_fallback") return "postgres_fallback";
  return undefined;
}

export function storedMemoryToReceipt(
  memory: StoredMemory,
  index: number,
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

  return {
    id: memory.id,
    number: index + 1,
    type,
    text: memory.text,
    date: memory.createdAt,
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
  };
}
