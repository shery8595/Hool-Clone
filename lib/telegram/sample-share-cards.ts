import type { TelegramCitedMemory } from "@/components/telegram/telegram-memory-receipts";

export const SAMPLE_CONGRATS_CARD = {
  messageType: "post_match_congrats" as const,
  matchLabel: "POR vs COL (2-1)",
  body: `You called it — Portugal 2-1 Colombia, just like your Walrus memory said you would. Loyalty beats spreadsheets again.

Receipt: "Predicted Portugal 2-1 Colombia because I always ride my team in group games."`,
  sentAt: new Date().toISOString(),
  recallSource: "walrus" as const,
  citedMemories: [
    {
      id: "sample-memory-001",
      text: "Predicted Portugal 2-1 Colombia because I always ride my team in group games.",
      type: "used",
      source: "prediction_submit",
      walrusBlobId: "0xabc123def456…",
      recallSource: "walrus" as const,
    },
    {
      id: "sample-memory-002",
      text: "User correction: I do trust Portugal in tight games — loyalty matters more than xG.",
      type: "correction",
      source: "clone_correction",
      recallSource: "walrus" as const,
    },
  ] satisfies TelegramCitedMemory[],
};

export const SAMPLE_ROAST_CARD = {
  messageType: "post_match_roast" as const,
  matchLabel: "POR vs COL (1-2)",
  body: `You picked Portugal to win — Colombia just beat them 1-2. Your Walrus memory literally warned you about fading South American pace. Classic you.

Receipt: "Colombia are physical and fast — bad matchup on paper for Portugal."`,
  sentAt: new Date().toISOString(),
  recallSource: "walrus" as const,
  citedMemories: [
    {
      id: "sample-memory-roast-001",
      text: "Colombia are physical and fast — bad matchup on paper for Portugal.",
      type: "inferred",
      source: "onboarding",
      walrusBlobId: "0xdef456abc789…",
      recallSource: "walrus" as const,
    },
    {
      id: "sample-memory-roast-002",
      text: "I said Portugal would struggle if Ronaldo is isolated — still believe it.",
      type: "remembered",
      source: "prediction_submit",
      recallSource: "walrus" as const,
    },
  ] satisfies TelegramCitedMemory[],
};
