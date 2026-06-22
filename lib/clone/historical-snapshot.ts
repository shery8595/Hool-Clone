import { memoryCountToMaturity } from "@/lib/auth/maturity";
import {
  type TemporalContradiction,
} from "@/lib/clone/temporal-contradictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import { SchemaType } from "@google/generative-ai";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import {
  buildHistoricalSnapshotPrompt,
  HISTORICAL_SNAPSHOT_SYSTEM,
} from "@/lib/prompts/historical-snapshot";
import { buildCloneKnowledgeSnapshot } from "@/lib/clone/clone-knowledge-snapshot";
import type { CloneKnowledgeSnapshot } from "@/lib/clone/clone-knowledge-snapshot";

const historicalSnapshotSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reflection: { type: SchemaType.STRING },
    bullets: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    confidence: { type: SchemaType.INTEGER },
  },
  required: ["reflection", "bullets", "confidence"],
};

type LlmSnapshotOutput = {
  reflection: string;
  bullets: string[];
  confidence: number;
};

function cutoffForDay(joinedAt: Date, day: number): Date {
  return new Date(joinedAt.getTime() + day * 24 * 60 * 60 * 1000);
}

function memoriesUpToCutoff(
  memories: StoredMemory[],
  cutoff: Date,
): StoredMemory[] {
  const cutoffMs = cutoff.getTime();
  return memories.filter((m) => new Date(m.createdAt).getTime() <= cutoffMs);
}

function predictionsUpToCutoff(
  history: PredictionHistoryItem[],
  cutoff: Date,
): PredictionHistoryItem[] {
  const cutoffMs = cutoff.getTime();
  return history.filter((h) => new Date(h.savedAt).getTime() <= cutoffMs);
}

function deterministicFallback(input: {
  day: number;
  joinedAt: Date;
  memories: StoredMemory[];
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null;
  history: PredictionHistoryItem[];
  temporalContradictions: TemporalContradiction[];
  behavioralContradictionCount: number;
}): CloneKnowledgeSnapshot {
  const snapshot = buildCloneKnowledgeSnapshot(input.day, {
    joinedAt: input.joinedAt,
    memories: input.memories,
    profile: input.profile,
    history: input.history,
    temporalContradictions: input.temporalContradictions,
    behavioralContradictionCount: input.behavioralContradictionCount,
  });

  const dayMemories = memoriesUpToCutoff(
    input.memories,
    cutoffForDay(input.joinedAt, input.day),
  );
  const memoryCount = dayMemories.length;
  const favorite = input.profile?.favorite_team;

  let reflection = "I barely know this fan yet.";
  if (input.day <= 1 || memoryCount < 2) {
    reflection = favorite
      ? `I've got one early take — maybe they support ${favorite}, but I'm mostly guessing.`
      : "I don't have enough Walrus receipts to imitate anyone yet.";
  } else if (input.day <= 3) {
    reflection = `I'm starting to see patterns from ${memoryCount} memories, but I'm still missing the full picture.`;
  } else {
    reflection = `With ${memoryCount} Walrus-backed receipts, I can argue like this fan — and call out their contradictions.`;
  }

  return { ...snapshot, reflection };
}

export function buildDeterministicHistoricalSnapshot(input: {
  day: number;
  joinedAt: Date;
  memories: StoredMemory[];
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style"
  > | null;
  history: PredictionHistoryItem[];
  temporalContradictions: TemporalContradiction[];
  behavioralContradictionCount: number;
}): CloneKnowledgeSnapshot {
  return deterministicFallback(input);
}

export async function synthesizeHistoricalSnapshot(input: {
  day: number;
  joinedAt: Date;
  memories: StoredMemory[];
  profile: Pick<
    DbFanProfile,
    "favorite_team" | "rival_team" | "preferred_style" | "summary"
  > | null;
  history: PredictionHistoryItem[];
  temporalContradictions: TemporalContradiction[];
  behavioralContradictionCount: number;
  walrusNamespace?: string;
}): Promise<CloneKnowledgeSnapshot> {
  const cutoff = cutoffForDay(input.joinedAt, input.day);
  const memoriesAtCutoff = memoriesUpToCutoff(input.memories, cutoff);
  const predictionsAtCutoff = predictionsUpToCutoff(input.history, cutoff);

  const fallback = deterministicFallback({
    day: input.day,
    joinedAt: input.joinedAt,
    memories: input.memories,
    profile: input.profile,
    history: input.history,
    temporalContradictions: input.temporalContradictions,
    behavioralContradictionCount: input.behavioralContradictionCount,
  });

  const llm = getLlmAdapter();
  if (!llm) return fallback;

  try {
    const raw = await llm.generateJson<LlmSnapshotOutput>({
      system: HISTORICAL_SNAPSHOT_SYSTEM,
      user: buildHistoricalSnapshotPrompt({
        day: input.day,
        cutoffIso: cutoff.toISOString(),
        profile: input.profile,
        memories: memoriesAtCutoff,
        predictions: predictionsAtCutoff,
        walrusNamespace: input.walrusNamespace,
      }),
      schemaName: "HistoricalSnapshot",
      schema: historicalSnapshotSchema,
    });

    const memoryCount = memoriesAtCutoff.length;
    const { label: maturityLabel } = memoryCountToMaturity(memoryCount);
    const confidence = Math.min(99, Math.max(0, Math.round(raw.confidence)));
    const bullets =
      raw.bullets?.filter((b) => b.trim().length > 0).slice(0, 6) ??
      fallback.bullets;

    return {
      day: input.day,
      confidence,
      bullets: bullets.length > 0 ? bullets : fallback.bullets,
      reflection: raw.reflection?.trim() || fallback.reflection,
      knownFavorite: fallback.knownFavorite,
      knownRival: fallback.knownRival,
      predictionCount: predictionsAtCutoff.length,
      contradictionCount: fallback.contradictionCount,
      maturityLabel,
      memoryCount,
      walrusReceiptCount: memoriesAtCutoff.filter(
        (m) => typeof m.metadata?.walrusBlobId === "string",
      ).length,
    };
  } catch {
    return fallback;
  }
}
