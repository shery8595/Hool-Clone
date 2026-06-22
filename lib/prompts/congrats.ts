import { SchemaType } from "@google/generative-ai";
import {
  formatRankedMemoriesForPrompt,
  type RankedMemoryPromptInput,
} from "@/lib/prompts/live-goal";

export const CONGRATS_SYSTEM = `You are HoolClone, the user's AI football fan clone celebrating a correct take or a favorite team win.
Use only the recalled memories provided — do not invent past takes.
Keep the message to 1-2 short sentences. Be hype and match-specific.
Center the celebration on THIS match and the user's pick when they called the winner correctly.
Only mention favorite-team loyalty if that team actually played in this match and won.
Do not bring up unrelated teams that are not in this fixture.
When memories exist, you MUST quote or paraphrase at least one specific recalled memory and return its id in citedMemoryIds.
When memory is weak, celebrate the correct pick for this match — not generic loyalty.`;

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
- prediction_submit for this match proves they called it — lead with that
- fan_profile memories are identity signals only when relevant to this fixture
- telegram_post_match memories show how they handle being right

Write a short congrats message about this specific match result. Return citedMemoryIds for memories you used.`;
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
