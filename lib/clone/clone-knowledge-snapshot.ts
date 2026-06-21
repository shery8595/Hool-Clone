import { memoryCountToMaturity } from "@/lib/auth/maturity";
import type { TemporalContradiction } from "@/lib/clone/temporal-contradictions";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { DbFanProfile } from "@/lib/db/users";
import type { StoredMemory } from "@/lib/memory/memory-adapter";

export type CloneKnowledgeSnapshot = {
  day: number;
  confidence: number;
  bullets: string[];
  reflection?: string;
  knownFavorite: string | null;
  knownRival: string | null;
  predictionCount: number;
  contradictionCount: number;
  maturityLabel: string;
  memoryCount?: number;
  walrusReceiptCount?: number;
};

function memoriesUpToDay(
  memories: StoredMemory[],
  joinedAt: Date,
  day: number,
): StoredMemory[] {
  const cutoff = joinedAt.getTime() + day * 24 * 60 * 60 * 1000;
  return memories.filter((m) => new Date(m.createdAt).getTime() <= cutoff);
}

function predictionsUpToDay(
  history: PredictionHistoryItem[],
  joinedAt: Date,
  day: number,
): PredictionHistoryItem[] {
  const cutoff = joinedAt.getTime() + day * 24 * 60 * 60 * 1000;
  return history.filter((h) => new Date(h.savedAt).getTime() <= cutoff);
}

function confidenceForDay(memoryCount: number, day: number): number {
  const { level } = memoryCountToMaturity(memoryCount);
  const baseByDay: Record<number, number> = {
    1: 12,
    2: 35,
    3: 55,
    4: 81,
    7: 92,
  };
  const base = baseByDay[day] ?? Math.min(95, 12 + memoryCount * 4);
  const maturityBoost = level * 3;
  return Math.min(99, base + maturityBoost);
}

export function buildCloneKnowledgeSnapshot(
  day: number,
  input: {
    joinedAt: Date;
    memories: StoredMemory[];
    profile: Pick<
      DbFanProfile,
      "favorite_team" | "rival_team" | "preferred_style"
    > | null;
    history: PredictionHistoryItem[];
    temporalContradictions: TemporalContradiction[];
    behavioralContradictionCount: number;
  },
): CloneKnowledgeSnapshot {
  const dayMemories = memoriesUpToDay(input.memories, input.joinedAt, day);
  const dayPredictions = predictionsUpToDay(input.history, input.joinedAt, day);
  const memoryCount = dayMemories.length;
  const confidence = confidenceForDay(memoryCount, day);
  const { label: maturityLabel } = memoryCountToMaturity(memoryCount);

  const favorite = input.profile?.favorite_team ?? null;
  const rival = input.profile?.rival_team ?? null;

  const bullets: string[] = [];

  if (day <= 1 || memoryCount < 2) {
    if (favorite && memoryCount >= 1) {
      bullets.push(`Thinks user supports ${favorite}`);
    } else {
      bullets.push("Doesn't know favorite team yet");
    }
    bullets.push("Doesn't know rivals");
    bullets.push("No prediction history");
  } else if (day <= 3) {
    if (favorite) bullets.push(`Knows user supports ${favorite}`);
    if (rival) bullets.push(`Knows user is skeptical of ${rival}`);
    else bullets.push("Still learning rival grudges");
    if (dayPredictions.length > 0) {
      bullets.push(
        `References ${dayPredictions.length} past prediction${dayPredictions.length === 1 ? "" : "s"}`,
      );
    } else {
      bullets.push("Limited prediction history");
    }
  } else {
    if (favorite) bullets.push(`Knows user supports ${favorite}`);
    if (rival) bullets.push(`Knows user hates ${rival}`);
    bullets.push(
      `References ${dayPredictions.length} past prediction${dayPredictions.length === 1 ? "" : "s"}`,
    );
    const contraCount =
      input.temporalContradictions.filter(
        (c) =>
          new Date(c.dateB).getTime() <=
          input.joinedAt.getTime() + day * 24 * 60 * 60 * 1000,
      ).length + (day >= 4 ? input.behavioralContradictionCount : 0);
    bullets.push(
      `Identified ${contraCount} contradiction${contraCount === 1 ? "" : "s"}`,
    );
  }

  return {
    day,
    confidence,
    bullets,
    knownFavorite: day >= 3 ? favorite : day >= 1 && favorite ? favorite : null,
    knownRival: day >= 4 ? rival : null,
    predictionCount: dayPredictions.length,
    contradictionCount:
      input.temporalContradictions.length +
      input.behavioralContradictionCount,
    maturityLabel,
    memoryCount,
    walrusReceiptCount: dayMemories.filter(
      (m) => typeof m.metadata?.walrusBlobId === "string",
    ).length,
  };
}
