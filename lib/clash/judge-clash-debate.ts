import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import type {
  ClashDebateResult,
  ClashParticipantMeta,
  ClashVerdict,
} from "@/lib/clash/types";
import {
  buildClashJudgeUserPrompt,
  CLASH_JUDGE_SYSTEM,
} from "@/lib/prompts/clash-judge";
import type { Match } from "@/lib/mock/types";
import { SchemaType } from "@google/generative-ai";

const clashJudgeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    winner: { type: SchemaType.STRING },
    scoreA: { type: SchemaType.NUMBER },
    scoreB: { type: SchemaType.NUMBER },
    summary: { type: SchemaType.STRING },
  },
  required: ["winner", "scoreA", "scoreB", "summary"],
};

function buildFallbackVerdict(
  debate: ClashDebateResult,
  participantA: ClashParticipantMeta,
  participantB: ClashParticipantMeta,
): ClashVerdict {
  const citationsA = debate.turns
    .filter((turn) => turn.speaker === "A")
    .reduce((sum, turn) => sum + turn.citedReceipts.length, 0);
  const citationsB = debate.turns
    .filter((turn) => turn.speaker === "B")
    .reduce((sum, turn) => sum + turn.citedReceipts.length, 0);

  const scoreA = Math.min(100, 55 + citationsA * 8);
  const scoreB = Math.min(100, 55 + citationsB * 8);
  const diff = Math.abs(scoreA - scoreB);

  let winner: ClashVerdict["winner"] = "draw";
  if (diff > 3) {
    winner = scoreA > scoreB ? "A" : "B";
  }

  const winnerSlug =
    winner === "A"
      ? participantA.slug
      : winner === "B"
        ? participantB.slug
        : null;

  return {
    winner,
    winnerSlug,
    scoreA,
    scoreB,
    summary:
      winner === "draw"
        ? "Too close to call — both clones brought receipts and bias."
        : `${winner === "A" ? participantA.displayName : participantB.displayName}'s clone edged the bout on memory-backed argument.`,
  };
}

export async function judgeClashDebate(input: {
  match: Match;
  participantA: ClashParticipantMeta;
  participantB: ClashParticipantMeta;
  debate: ClashDebateResult;
}): Promise<ClashVerdict> {
  const llm = getLlmAdapter();

  if (llm) {
    try {
      const result = await llm.generateJson<{
        winner: string;
        scoreA: number;
        scoreB: number;
        summary: string;
      }>({
        system: CLASH_JUDGE_SYSTEM,
        user: buildClashJudgeUserPrompt(input),
        schemaName: "clash_judge",
        schema: clashJudgeSchema,
      });

      const rawWinner = result.winner?.toUpperCase();
      let winner: ClashVerdict["winner"] = "draw";
      if (rawWinner === "A") winner = "A";
      else if (rawWinner === "B") winner = "B";
      else if (Math.abs(result.scoreA - result.scoreB) > 3) {
        winner = result.scoreA > result.scoreB ? "A" : "B";
      }

      const winnerSlug =
        winner === "A"
          ? input.participantA.slug
          : winner === "B"
            ? input.participantB.slug
            : null;

      return {
        winner,
        winnerSlug,
        scoreA: Math.round(result.scoreA),
        scoreB: Math.round(result.scoreB),
        summary: result.summary?.trim() || "Arena bout complete.",
      };
    } catch {
      return buildFallbackVerdict(
        input.debate,
        input.participantA,
        input.participantB,
      );
    }
  }

  return buildFallbackVerdict(
    input.debate,
    input.participantA,
    input.participantB,
  );
}
