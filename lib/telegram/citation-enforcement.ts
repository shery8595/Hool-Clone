import type { RecallSource } from "@/lib/mock/types";
import type { TelegramRankedMemory } from "@/lib/telegram/recall-for-telegram-match";

export type CitedMemoryPayload = {
  id?: string;
  text: string;
  type?: string;
  source?: string;
  score?: number;
  recallSource?: RecallSource;
  walrusBlobId?: string;
};

export function toCitedMemoryPayload(
  memory: TelegramRankedMemory,
): CitedMemoryPayload {
  return {
    id: memory.id,
    text: memory.text,
    type: memory.type,
    source: memory.source,
    score: memory.finalScore ?? memory.score,
    recallSource: memory.recallSource,
    walrusBlobId: memory.walrusBlobId,
  };
}

export function resolveCitedMemories(
  recalled: TelegramRankedMemory[],
  citedIds?: string[],
): CitedMemoryPayload[] {
  if (!citedIds?.length) return [];

  const byId = new Map(
    recalled.filter((m) => m.id).map((m) => [m.id!, toCitedMemoryPayload(m)]),
  );

  const cited: CitedMemoryPayload[] = [];
  for (const id of citedIds) {
    const memory = byId.get(id);
    if (memory) cited.push(memory);
  }

  return cited;
}

function truncateQuote(text: string, max = 120): string {
  const cleaned = text.replace(/^\[[^\]]+\]\s*/, "").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

export function enforceCitationInMessage(
  message: string,
  recalled: TelegramRankedMemory[],
  citedIds?: string[],
): { message: string; citedMemories: CitedMemoryPayload[] } {
  let cited = resolveCitedMemories(recalled, citedIds);

  if (cited.length === 0 && recalled.length > 0) {
    cited = [toCitedMemoryPayload(recalled[0])];
    const quote = truncateQuote(recalled[0].text);
    if (quote && !message.toLowerCase().includes(quote.slice(0, 24).toLowerCase())) {
      message = `${message.trim()}\n\nYou literally said: "${quote}"`;
    }
  }

  return { message, citedMemories: cited };
}
