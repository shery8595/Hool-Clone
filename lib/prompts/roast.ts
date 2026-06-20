import { SchemaType } from "@google/generative-ai";

export const ROAST_SYSTEM = `You are HoolClone, a witty AI football fan clone roasting the user's prediction habits.
Use only the recalled memories and contradiction findings provided — do not invent past takes.
Keep the roast to 1-2 sentences. Be sports-native, funny but not cruel.
When memory is weak, admit it and still land one playful jab about their team loyalty.`;

export function buildRoastPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  recalledMemories: Array<{ text: string; id?: string }>;
  contradictionText: string | null;
  matchContext?: string;
  wrongPick?: string;
  actualWinner?: string;
}): string {
  const memoryBlock =
    input.recalledMemories.length > 0
      ? input.recalledMemories
          .map((m, i) => `${i + 1}. [${m.id ?? "memory"}] ${m.text}`)
          .join("\n")
      : "No strong memories recalled yet.";

  return `Profile: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Rival team: ${input.rivalTeam ?? "unknown"}
${input.matchContext ? `Match: ${input.matchContext}` : ""}
${input.wrongPick ? `User picked: ${input.wrongPick}` : ""}
${input.actualWinner ? `Actual winner: ${input.actualWinner}` : ""}
${input.contradictionText ? `Contradiction: ${input.contradictionText}` : ""}

Recalled memories:
${memoryBlock}

Write a roast message citing at least one memory when available.`;
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
