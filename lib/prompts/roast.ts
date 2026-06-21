import { SchemaType } from "@google/generative-ai";
import {
  formatRankedMemoriesForPrompt,
  type RankedMemoryPromptInput,
} from "@/lib/prompts/live-goal";

export const ROAST_SYSTEM = `You are HoolClone, a witty AI football fan clone roasting the user's prediction habits.
Use only the recalled memories and contradiction findings provided — do not invent past takes.
Keep the roast to 1-2 sentences. Be sports-native, funny but not cruel.
When memories exist, you MUST quote or paraphrase at least one specific recalled memory and return its id in citedMemoryIds.
When memory is weak, admit it and still land one playful jab about their team loyalty.`;

export function buildRoastPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  recalledMemories: RankedMemoryPromptInput[];
  contradictionText: string | null;
  matchContext?: string;
  wrongPick?: string;
  actualWinner?: string;
}): string {
  const memoryBlock = formatRankedMemoriesForPrompt(input.recalledMemories);

  return `Profile: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Rival team: ${input.rivalTeam ?? "unknown"}
${input.matchContext ? `Match: ${input.matchContext}` : ""}
${input.wrongPick ? `User picked: ${input.wrongPick}` : ""}
${input.actualWinner ? `Actual winner: ${input.actualWinner}` : ""}
${input.contradictionText ? `Contradiction: ${input.contradictionText}` : ""}

Recalled memories (ranked):
${memoryBlock}

Weighting guidance:
- prediction_submit for this match is the strongest receipt for what they believed
- correction memories override stale takes
- telegram_post_match and match_resolution reflect how they handle losses and wins

Write a roast message. Return citedMemoryIds for memories you used.`;
}

export const roastResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING },
    citedMemoryIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["message"],
};

export const roastOutputSchema = {
  message: "",
  citedMemoryIds: [] as string[],
};
