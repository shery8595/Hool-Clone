import { getMemoryAdapter } from "@/lib/memory";

type HighlightMessage = {
  id: string;
  role: "user" | "clone";
  text: string;
  citedReceipts?: Array<{ id: string }>;
};

function extractTopics(messages: HighlightMessage[]): string[] {
  return messages
    .filter((message) => message.role === "user" && message.id !== "opening")
    .slice(0, 3)
    .map((message) => message.text.trim())
    .filter((text) => text.length > 0);
}

function countCitedMemories(messages: HighlightMessage[]): number {
  const cited = new Set<string>();
  for (const message of messages) {
    if (message.role !== "clone") continue;
    for (const receipt of message.citedReceipts ?? []) {
      cited.add(receipt.id);
    }
  }
  return cited.size;
}

function buildHighlightSummary(input: {
  topics: string[];
  exchangeCount: number;
  citedMemoryCount: number;
}): string {
  const topicLine =
    input.topics.length > 0
      ? `Challenged clone on ${input.topics.join(" · ")}.`
      : "Challenged clone on football takes.";
  return `${topicLine} ${input.exchangeCount} exchanges. Clone cited ${input.citedMemoryCount} memory receipts.`;
}

export async function storeDebateHighlight(
  userId: string,
  messages: HighlightMessage[],
): Promise<{ id?: string; status: string } | null> {
  const conversation = messages.filter((message) => message.id !== "opening");
  if (conversation.length < 2) return null;

  const topics = extractTopics(messages);
  const citedMemoryCount = countCitedMemories(messages);
  const exchangeCount = Math.max(
    0,
    messages.filter((message) => message.role === "user").length,
  );
  const summary = buildHighlightSummary({
    topics,
    exchangeCount,
    citedMemoryCount,
  });

  const memoryAdapter = getMemoryAdapter();
  return memoryAdapter.remember(userId, {
    type: "remembered",
    text: summary,
    metadata: {
      source: "debate_highlight",
      exchangeCount,
      citedMemoryCount,
      topics,
      public_visible: true,
    },
  });
}
