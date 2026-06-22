import { getMemoryAdapter } from "@/lib/memory";

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

export function formatMemoryExcerpt(text: string, max = 96): string {
  const cleaned = text.replace(/^\[[^\]]+\]\s*/, "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

export function formatReceiptFooter(
  recalledMemories: Array<{ text: string; id?: string }>,
): string {
  if (recalledMemories.length === 0) return "";

  const lines = recalledMemories
    .slice(0, 2)
    .map((m) => `• ${formatMemoryExcerpt(m.text)}`);

  return `\n\nWalrus receipt\n${lines.join("\n")}`;
}
