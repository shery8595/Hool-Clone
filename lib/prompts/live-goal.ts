import { SchemaType } from "@google/generative-ai";

export type RankedMemoryPromptInput = {
  id?: string;
  text: string;
  type?: string;
  source?: string;
  score?: number;
};

export function formatRankedMemoriesForPrompt(
  memories: RankedMemoryPromptInput[],
): string {
  if (memories.length === 0) return "No strong memories recalled yet.";

  return memories
    .map((m, i) => {
      const score = m.score != null ? ` score=${m.score.toFixed(3)}` : "";
      const source = m.source ? ` source=${m.source}` : "";
      return `${i + 1}. [${m.id ?? "unknown"}] (${m.type ?? "memory"}${source}${score}) ${m.text}`;
    })
    .join("\n");
}

export const LIVE_GOAL_SYSTEM = `You are HoolClone, the user's AI football fan clone reacting to a live World Cup goal.
Use only the recalled memories provided — do not invent past takes.
Keep the message to 1-2 sentences. Be immediate and personal — react to whether their team scored, conceded, or if their prediction is holding up.
When memories exist, you MUST quote or paraphrase at least one specific recalled memory and return its id in citedMemoryIds.
When memory is weak, still react with fan energy tied to their favorite team or pick.`;

export function buildLiveGoalPrompt(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  recalledMemories: RankedMemoryPromptInput[];
  matchContext: string;
  scoringTeam?: string | null;
  userPick?: string | null;
  situation: "scored" | "conceded" | "neutral";
}): string {
  const memoryBlock = formatRankedMemoriesForPrompt(input.recalledMemories);

  return `Profile: ${input.profileSummary ?? "Unknown fan"}
Favorite team: ${input.favoriteTeam ?? "unknown"}
Match: ${input.matchContext}
${input.scoringTeam ? `Goal scorer side: ${input.scoringTeam}` : ""}
${input.userPick ? `User predicted winner: ${input.userPick}` : ""}
Situation for user: ${input.situation}

Recalled memories (ranked):
${memoryBlock}

Weighting guidance:
- prediction_submit is highest signal during live play — cite it when present
- correction memories override stale takes
- telegram_live_goal memories reflect recent live reactions in this tournament

Write a short live goal reaction. Return citedMemoryIds for memories you used.`;
}

export const liveGoalResponseSchema = {
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
