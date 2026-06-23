import { buildMemoryExtractionPrompt } from "@/lib/prompts/memory-extraction";
import {
  getLlmAdapter,
  memoryExtractionResponseSchema,
} from "@/lib/llm/gemini-adapter";
import {
  memoryExtractionSchema,
  type MemoryExtraction,
} from "@/lib/llm/schemas/memory-extraction";
import type { DriverChip } from "@/lib/mock/types";

export function fallbackExtraction(input: {
  question: string;
  answer: string;
  driver?: DriverChip;
}): MemoryExtraction {
  const trimmed = input.answer.trim();
  const summaryLine = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;

  const facts: MemoryExtraction["facts"] = [
    {
      type: "fan_profile",
      text: summaryLine,
      driver: input.driver,
    },
  ];

  const profileHints: MemoryExtraction["profileHints"] = {};

  const lowerQ = input.question.toLowerCase();
  const lowerA = input.answer.toLowerCase();

  if (lowerQ.includes("favorite team")) {
    const teamMatch = input.answer.split(/[—–-]/)[0]?.trim();
    if (teamMatch) profileHints.favoriteTeam = teamMatch;
  }
  if (lowerQ.includes("never trust")) {
    const teamMatch = input.answer.split(/[—–-]/)[0]?.trim();
    if (teamMatch) profileHints.rivalTeam = teamMatch;
  }
  if (lowerQ.includes("stats") || lowerQ.includes("vibes")) {
    profileHints.preferredStyle = input.driver ?? "vibes";
  }

  if (lowerA.includes("england")) {
    facts.push({
      type: "bias",
      text: "Skeptical of England in knockouts",
      team: "England",
      driver: input.driver,
    });
  }

  if (lowerQ.includes("heartbreak")) {
    facts.push({
      type: "emotional_memory",
      text: summaryLine,
      searchText: "Strong World Cup heartbreak and emotional football bias",
      driver: input.driver,
    });
  }

  return { facts, profileHints, summaryLine };
}

export async function extractMemoryFromAnswer(input: {
  question: string;
  answer: string;
  driver?: DriverChip;
}): Promise<MemoryExtraction> {
  const llm = getLlmAdapter();
  if (!llm) {
    return fallbackExtraction(input);
  }

  const prompt = buildMemoryExtractionPrompt(input);

  try {
    const raw = await llm.generateJson<unknown>({
      ...prompt,
      schemaName: "MemoryExtraction",
      schema: memoryExtractionResponseSchema,
    });
    return memoryExtractionSchema.parse(raw);
  } catch {
    return fallbackExtraction(input);
  }
}
