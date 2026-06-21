import type { RecallSource } from "@/lib/mock/types";

/** Resolve Walrus vs Postgres fallback from memory metadata. */
export function recallSourceFromMetadata(
  metadata: Record<string, unknown> | undefined,
): RecallSource | undefined {
  if (!metadata) return undefined;

  if (metadata.backendSource === "walrus") return "walrus";
  if (metadata.backendSource === "postgres_fallback") return "postgres_fallback";

  if (typeof metadata.walrusBlobId === "string" && metadata.walrusBlobId.length > 0) {
    return "walrus";
  }

  // Legacy: some rows may have mis-tagged source
  if (metadata.source === "walrus") return "walrus";
  if (metadata.source === "postgres_fallback") return "postgres_fallback";

  return undefined;
}
