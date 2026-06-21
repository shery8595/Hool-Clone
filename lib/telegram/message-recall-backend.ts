import type { RecallSource } from "@/lib/mock/types";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";

/** Message-level recall backend including empty recall. */
export type MessageRecallBackend = RecallSource | "none";

export function primaryRecallSource(
  memories: TelegramRankedMemory[],
): MessageRecallBackend {
  if (memories.length === 0) return "none";
  if (memories.some((m) => m.recallSource === "walrus")) return "walrus";
  if (memories.some((m) => m.recallSource === "postgres_fallback")) {
    return "postgres_fallback";
  }
  return "none";
}

export function isMessageRecallBackend(value: unknown): value is MessageRecallBackend {
  return (
    value === "walrus" ||
    value === "postgres_fallback" ||
    value === "none"
  );
}
