import { getMemoryAdapter } from "@/lib/memory";
import { TELEGRAM_MESSAGE_MAX_LENGTH } from "@/lib/telegram/telegram-message-limit";

export const POST_MATCH_RECALL_QUERIES = [
  "What is this user's football prediction style and biases?",
  "What teams does this user trust or distrust?",
  "What contradictions exist in this user's football takes?",
  "recent post match prediction outcome result",
  "what happened after my last World Cup prediction",
];

export const LIVE_GOAL_RECALL_QUERIES = [
  "What is this user's football prediction style and biases?",
  "What did the user predict for this match or similar fixtures?",
  "What teams does this user support or distrust?",
  "recent emotional football memories and hot takes",
  "What contradictions exist in this user's football takes?",
];

const RECEIPT_FOOTER_HEADER = "\n\nWalrus receipt\n";
const MAX_RECEIPT_LINES = 2;
const MIN_RECEIPT_EXCERPT = 160;

export async function recallMemoriesForTelegram(
  userId: string,
  queries: string[] = POST_MATCH_RECALL_QUERIES,
): Promise<Array<{ text: string; id?: string }>> {
  const adapter = getMemoryAdapter();
  const recallResults = await Promise.all(
    queries.map((q) => adapter.recall(userId, q)),
  );

  const seen = new Set<string>();
  const recalled: Array<{ text: string; id?: string }> = [];

  for (const results of recallResults) {
    for (const r of results) {
      const key = r.text;
      if (seen.has(key)) continue;
      seen.add(key);
      recalled.push({
        text: r.text,
        id:
          typeof r.metadata?.memoryId === "string"
            ? r.metadata.memoryId
            : undefined,
      });
    }
  }

  return recalled.slice(0, 6);
}

export function formatMemoryExcerpt(text: string, max?: number): string {
  const cleaned = text.replace(/^\[[^\]]+\]\s*/, "").replace(/\s+/g, " ").trim();
  if (max == null || cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

export function formatReceiptFooter(
  recalledMemories: Array<{ text: string; id?: string }>,
  options?: { mainMessage?: string },
): string {
  if (recalledMemories.length === 0) return "";

  const receipts = recalledMemories.slice(0, MAX_RECEIPT_LINES);
  const mainLength = options?.mainMessage?.trim().length ?? 0;
  const bulletPrefixLength = 2;

  const fullLines = receipts.map(
    (memory) => `• ${formatMemoryExcerpt(memory.text)}`,
  );
  let footer = `${RECEIPT_FOOTER_HEADER}${fullLines.join("\n")}`;

  if (mainLength + footer.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
    return footer;
  }

  const availableForReceipts =
    TELEGRAM_MESSAGE_MAX_LENGTH -
    mainLength -
    RECEIPT_FOOTER_HEADER.length -
    (receipts.length - 1);

  const perReceiptBudget = Math.max(
    MIN_RECEIPT_EXCERPT,
    Math.floor(availableForReceipts / receipts.length) - bulletPrefixLength,
  );

  const trimmedLines = receipts.map(
    (memory) => `• ${formatMemoryExcerpt(memory.text, perReceiptBudget)}`,
  );

  footer = `${RECEIPT_FOOTER_HEADER}${trimmedLines.join("\n")}`;

  if (mainLength + footer.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
    return footer;
  }

  return `${RECEIPT_FOOTER_HEADER}${trimmedLines.join("\n")}`;
}
