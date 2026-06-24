import type { TelegramHistoryItem } from "@/components/telegram/telegram-history-list";
import { excerptMemoryText } from "@/lib/telegram/recalled-memory-snapshot";

/** Curated judge-facing Telegram loop for the demo profile (no wallet). */
export function buildDemoTelegramHistory(
  memories: Array<{
    id: string;
    text: string;
    walrusBlobId?: string;
    date: string;
  }>,
): TelegramHistoryItem[] {
  const colombiaMemory = memories.find((m) =>
    m.text.toLowerCase().includes("colombia are physical"),
  );
  const portugalMemory = memories.find((m) =>
    m.text.toLowerCase().includes("portugal is my team"),
  );

  const cited = (memory: typeof colombiaMemory) =>
    memory
      ? [
          {
            id: memory.id,
            text: memory.text,
            type: "remembered",
            source: "onboarding",
            walrusBlobId: memory.walrusBlobId,
            recallSource: "walrus" as const,
          },
        ]
      : [];

  return [
    {
      id: "demo-tg-roast-1",
      matchId: "m071",
      messageType: "post_match_roast",
      body: `You picked Portugal to win — Colombia beat them 1-2. Your Walrus memory warned you about fading South American pace.

Receipt: "${colombiaMemory?.text ?? "Colombia are physical and fast — bad matchup on paper for Portugal."}"`,
      metadata: { source: "telegram_post_match", demo: true },
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      recallSource: "walrus",
      citationSource: "enforced",
      citedMemories: cited(colombiaMemory),
      recalledMemories: cited(colombiaMemory).map((m) => ({
        id: m.id,
        textExcerpt: excerptMemoryText(m.text),
        type: m.type,
        source: m.source,
        recallSource: m.recallSource,
        walrusBlobId: m.walrusBlobId,
      })),
      match: {
        externalId: "m071",
        teamACode: "COL",
        teamBCode: "POR",
        scoreA: 2,
        scoreB: 1,
      },
    },
    {
      id: "demo-tg-congrats-1",
      matchId: "m066",
      messageType: "post_match_congrats",
      body: `Called it — Uruguay couldn't hang. Your loyalty receipts are finally paying off.`,
      metadata: { source: "telegram_post_match", demo: true },
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recallSource: "walrus",
      citationSource: "llm",
      citedMemories: cited(portugalMemory),
      recalledMemories: [],
      match: {
        externalId: "m066",
        teamACode: "URU",
        teamBCode: "ESP",
        scoreA: 1,
        scoreB: 2,
      },
    },
  ];
}
