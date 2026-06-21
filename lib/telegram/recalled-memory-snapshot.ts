import type { RecallSource } from "@/lib/mock/types";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";

const TEXT_EXCERPT_MAX = 160;

export type RecalledMemorySnapshot = {
  id?: string;
  textExcerpt: string;
  type?: string;
  source?: string;
  score?: number;
  finalScore?: number;
  recallSource?: RecallSource;
  walrusBlobId?: string;
};

export function excerptMemoryText(text: string, max = TEXT_EXCERPT_MAX): string {
  const cleaned = text.trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

export function toRecalledMemorySnapshots(
  memories: TelegramRankedMemory[],
): RecalledMemorySnapshot[] {
  return memories.map((memory) => ({
    id: memory.id,
    textExcerpt: excerptMemoryText(memory.text),
    type: memory.type,
    source: memory.source,
    score: memory.score,
    finalScore: memory.finalScore ?? memory.score,
    recallSource: memory.recallSource,
    walrusBlobId: memory.walrusBlobId,
  }));
}

export function parseRecalledMemorySnapshots(
  raw: unknown,
): RecalledMemorySnapshot[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      textExcerpt:
        typeof item.textExcerpt === "string"
          ? item.textExcerpt
          : typeof item.text === "string"
            ? excerptMemoryText(item.text)
            : "",
      type: typeof item.type === "string" ? item.type : undefined,
      source: typeof item.source === "string" ? item.source : undefined,
      score: typeof item.score === "number" ? item.score : undefined,
      finalScore: typeof item.finalScore === "number" ? item.finalScore : undefined,
      recallSource:
        item.recallSource === "walrus"
          ? ("walrus" as const)
          : item.recallSource === "postgres_fallback"
            ? ("postgres_fallback" as const)
            : undefined,
      walrusBlobId:
        typeof item.walrusBlobId === "string" ? item.walrusBlobId : undefined,
    }))
    .filter((item) => item.textExcerpt.length > 0);
}
