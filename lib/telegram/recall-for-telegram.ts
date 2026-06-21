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

export function formatReceiptFooter(
  recalledMemories: Array<{ text: string; id?: string }>,
  profilePath?: string,
): string {
  const receiptFooter =
    recalledMemories.length > 0
      ? `\n\nMemory Receipts Used:\n${recalledMemories
          .slice(0, 3)
          .map((m, i) => {
            const letter = String.fromCharCode(65 + i);
            const id = m.id ? `#${letter}` : `#${i + 1}`;
            return `${id} ${m.text.slice(0, 72)}${m.text.length > 72 ? "…" : ""}`;
          })
          .join("\n")}`
      : "";

  return profilePath
    ? `${receiptFooter}\n\nClone evidence: ${profilePath}`
    : receiptFooter;
}
