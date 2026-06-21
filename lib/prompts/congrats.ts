import { SchemaType } from "@google/generative-ai";
import {
  formatRankedMemoriesForPrompt,
  type RankedMemoryPromptInput,
} from "@/lib/prompts/live-goal";

export const CONGRATS_SYSTEM = `You are HoolClone, the user's AI football fan clone celebrating a correct take or a favorite team win.
Use only the recalled memories provided — do not invent past takes.
Keep the message to 1-2 sentences. Be hype but personal — cite a specific memory when possible.
When memories exist, you MUST quote or paraphrase at least one specific recalled memory and return its id in citedMemoryIds.
When memory is weak, still celebrate loyalty to their team.`;

export function buildCongratsPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  recalledMemories: RankedMemoryPromptInput[];
  matchContext?: string;
  userPick?: string;
  actualWinner?: string;
}): string {
  const memoryBlock = formatRankedMemoriesForPrompt(input.recalledMemories);

  return `Profile: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
${input.matchContext ? `Match: ${input.matchContext}` : ""}
${input.userPick ? `User picked: ${input.userPick}` : ""}
${input.actualWinner ? `Actual winner: ${input.actualWinner}` : ""}

Recalled memories (ranked):
${memoryBlock}

Weighting guidance:
- prediction_submit for this match proves they called it
- fan_profile memories are identity signals
- telegram_post_match memories show how they handle being right

Write a short congrats message. Return citedMemoryIds for memories you used.`;
}

export const congratsResponseSchema = {
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
