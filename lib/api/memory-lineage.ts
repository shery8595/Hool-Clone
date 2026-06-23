import type { StoredMemory } from "@/lib/memory/memory-adapter";
import type { MemoryLineageStep } from "@/lib/mock/types";

function truncateBlob(blobId: string, max = 16): string {
  return blobId.length > max ? `${blobId.slice(0, max)}…` : blobId;
}

function formatMatchLabel(matchId: string): string {
  return matchId.startsWith("m") ? `match ${matchId}` : `match ${matchId}`;
}

function sourceStep(
  memory: StoredMemory,
  metadata: Record<string, unknown>,
): MemoryLineageStep {
  const source = metadata.source;
  const matchId =
    typeof metadata.matchId === "string" ? metadata.matchId : undefined;

  if (source === "onboarding") {
    return {
      label: "Learned from onboarding interview",
      detail:
        typeof metadata.questionId === "string"
          ? `Question ${metadata.questionId}`
          : undefined,
      timestamp: memory.createdAt,
    };
  }

  if (source === "clone_correction") {
    return {
      label: matchId
        ? `Corrected after clone prediction on ${formatMatchLabel(matchId)}`
        : "Corrected by user after clone disagreement",
      detail:
        typeof metadata.userCorrection === "string"
          ? metadata.userCorrection.slice(0, 120)
          : undefined,
      timestamp: memory.createdAt,
    };
  }

  if (source === "debate") {
    return {
      label: "Corrected during debate",
      detail:
        typeof metadata.userCorrection === "string"
          ? metadata.userCorrection.slice(0, 120)
          : undefined,
      timestamp: memory.createdAt,
    };
  }

  if (source === "telegram_post_match") {
    return {
      label: matchId
        ? `Post-match summary from ${formatMatchLabel(matchId)}`
        : "Post-match Telegram summary",
      timestamp: memory.createdAt,
    };
  }

  if (source === "telegram_live_goal") {
    return {
      label: matchId
        ? `Live goal reaction from ${formatMatchLabel(matchId)}`
        : "Live goal Telegram reaction",
      timestamp: memory.createdAt,
    };
  }

  if (source === "sleep_cycle") {
    const theme =
      typeof metadata.theme === "string" ? metadata.theme : undefined;
    return {
      label: "Consolidated during sleep cycle",
      detail: theme,
      timestamp: memory.createdAt,
    };
  }

  if (source === "prediction" || metadataTypeUsed(metadata)) {
    return {
      label: matchId
        ? `Learned from ${formatMatchLabel(matchId)} prediction`
        : "Learned from match prediction",
      timestamp: memory.createdAt,
    };
  }

  if (memory.type === "correction") {
    return {
      label: "User correction stored",
      timestamp: memory.createdAt,
    };
  }

  return {
    label: "Memory captured during training",
    timestamp: memory.createdAt,
  };
}

function metadataTypeUsed(metadata: Record<string, unknown>): boolean {
  return metadata.source === "prediction";
}

function walrusStorageStep(
  metadata: Record<string, unknown>,
  createdAt: string,
): MemoryLineageStep | null {
  const blobId =
    typeof metadata.walrusBlobId === "string" ? metadata.walrusBlobId : undefined;
  if (!blobId) return null;

  const namespace =
    typeof metadata.walrusNamespace === "string"
      ? metadata.walrusNamespace
      : undefined;

  return {
    label: "Stored on Walrus Memory",
    detail: namespace ? `Namespace ${namespace}` : undefined,
    blobId,
    timestamp: createdAt,
  };
}

function supersededStep(
  metadata: Record<string, unknown>,
): MemoryLineageStep | null {
  if (metadata.archived === true) {
    const reason =
      typeof metadata.archivedReason === "string"
        ? metadata.archivedReason
        : undefined;
    const consolidatedInto =
      typeof metadata.consolidatedInto === "string"
        ? metadata.consolidatedInto.slice(0, 8)
        : undefined;
    return {
      label:
        reason === "sleep_cycle"
          ? "Archived after sleep cycle consolidation"
          : "Archived / superseded",
      detail: consolidatedInto
        ? `Replaced by memory ${consolidatedInto}…`
        : undefined,
      timestamp:
        typeof metadata.archivedAt === "string"
          ? metadata.archivedAt
          : undefined,
    };
  }

  if (metadata.disputed !== true) return null;

  const reason =
    typeof metadata.disputedReason === "string"
      ? metadata.disputedReason.slice(0, 120)
      : undefined;

  return {
    label: "Superseded by user correction",
    detail: reason,
    timestamp:
      typeof metadata.disputedAt === "string" ? metadata.disputedAt : undefined,
  };
}

function correctionChainSteps(
  memory: StoredMemory,
  metadata: Record<string, unknown>,
  context?: MemoryLineageContext,
): MemoryLineageStep[] {
  const steps: MemoryLineageStep[] = [];

  const wrongMemoryId =
    typeof metadata.wrongMemoryId === "string"
      ? metadata.wrongMemoryId
      : undefined;

  if (wrongMemoryId && context?.memoryById) {
    const prior = context.memoryById.get(wrongMemoryId);
    const priorBlob =
      prior && typeof prior.metadata?.walrusBlobId === "string"
        ? prior.metadata.walrusBlobId
        : undefined;
    steps.push({
      label: "Replaces earlier memory",
      detail: priorBlob
        ? `Prior Walrus blob ${truncateBlob(priorBlob)}`
        : `Prior memory ${wrongMemoryId.slice(0, 8)}…`,
      blobId: priorBlob,
      timestamp: prior?.createdAt,
    });
  }

  const corrections = context?.correctionsByTargetId?.get(memory.id) ?? [];
  for (const correction of corrections) {
    const correctionBlob =
      typeof correction.metadata?.walrusBlobId === "string"
        ? correction.metadata.walrusBlobId
        : undefined;
    steps.push({
      label: "Corrected by user",
      detail: correction.text.slice(0, 120),
      blobId: correctionBlob,
      timestamp: correction.createdAt,
    });
  }

  return steps;
}

export type MemoryLineageContext = {
  memoryById?: Map<string, StoredMemory>;
  correctionsByTargetId?: Map<string, StoredMemory[]>;
};

export function buildMemoryLineage(
  memory: StoredMemory,
  context?: MemoryLineageContext,
): MemoryLineageStep[] {
  const metadata = memory.metadata ?? {};
  const steps: MemoryLineageStep[] = [];

  steps.push(sourceStep(memory, metadata));

  const storage = walrusStorageStep(metadata, memory.createdAt);
  if (storage) steps.push(storage);

  const superseded = supersededStep(metadata);
  if (superseded) steps.push(superseded);

  steps.push(...correctionChainSteps(memory, metadata, context));

  return steps;
}

export function buildLineageContextFromMemories(
  memories: StoredMemory[],
): MemoryLineageContext {
  const memoryById = new Map(memories.map((m) => [m.id, m]));
  const correctionsByTargetId = new Map<string, StoredMemory[]>();

  for (const memory of memories) {
    if (memory.type !== "correction") continue;
    const wrongId = memory.metadata?.wrongMemoryId;
    if (typeof wrongId !== "string") continue;
    const existing = correctionsByTargetId.get(wrongId) ?? [];
    existing.push(memory);
    correctionsByTargetId.set(wrongId, existing);
  }

  return { memoryById, correctionsByTargetId };
}
