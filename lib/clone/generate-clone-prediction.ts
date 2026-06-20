import { countMemories, getFanProfile } from "@/lib/db/users";
import { upsertClonePrediction } from "@/lib/db/clone-predictions";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import { buildCloneInsight } from "@/lib/clone/clone-insight";
import { fallbackClonePrediction } from "@/lib/clone/fallback-clone-prediction";
import { recallMemoriesForMatch } from "@/lib/clone/recall-memories";
import {
  clonePredictionSchema,
  type ClonePredictionOutput,
} from "@/lib/llm/schemas/clone-prediction";
import {
  clonePredictionResponseSchema as geminiSchema,
  getLlmAdapter,
} from "@/lib/llm/gemini-adapter";
import {
  buildClonePredictionPrompt,
  CLONE_PREDICTION_SYSTEM,
} from "@/lib/prompts/clone-prediction";
import { getMatchDataAdapter } from "@/lib/match-data";
import { isUuid } from "@/lib/utils";
import type { ClonePrediction, Match, Prediction } from "@/lib/mock/types";
import type { RecalledMemory } from "@/lib/clone/recall-memories";

export type GenerateCloneResult = {
  clone: ClonePrediction;
  trainingQuestion: string | null;
  weakMemory: boolean;
};

async function runLlmClonePrediction(input: {
  profileSummary: string | null;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  preferredStyle: string | null;
  match: Match;
  recalledMemories: RecalledMemory[];
  memoriesCount: number;
}): Promise<ClonePredictionOutput> {
  const llm = getLlmAdapter();
  const userPrompt = buildClonePredictionPrompt({
    profileSummary: input.profileSummary,
    favoriteTeam: input.favoriteTeam,
    rivalTeam: input.rivalTeam,
    preferredStyle: input.preferredStyle,
    match: input.match,
    recalledMemories: input.recalledMemories,
    memoriesCount: input.memoriesCount,
  });

  const runFallback = () =>
    fallbackClonePrediction({
      match: input.match,
      recalledMemories: input.recalledMemories,
      memoriesCount: input.memoriesCount,
      favoriteTeam: input.favoriteTeam,
      rivalTeam: input.rivalTeam,
    });

  if (!llm) {
    return runFallback();
  }

  try {
    const raw = await llm.generateJson<unknown>({
      system: CLONE_PREDICTION_SYSTEM,
      user: userPrompt,
      schemaName: "ClonePrediction",
      schema: geminiSchema,
    });
    return clonePredictionSchema.parse(raw);
  } catch {
    return runFallback();
  }
}

function normalizeWinner(
  output: ClonePredictionOutput,
  homeCode: string,
  awayCode: string,
): string {
  const winner = output.predictedWinner.toUpperCase();
  if (winner === homeCode || winner === awayCode) return winner;

  const homeName = output.predictedWinner.toLowerCase();
  if (homeCode.toLowerCase().includes(homeName) || homeName.includes("home")) {
    return homeCode;
  }
  return awayCode;
}

export async function generateClonePrediction(
  userId: string,
  matchExternalId: string,
  options?: { bumpVersion?: boolean; emphasizeCorrections?: boolean },
): Promise<GenerateCloneResult> {
  const match = await getMatchDataAdapter().getMatch(matchExternalId);
  if (!match?.homeTeam || !match.awayTeam) {
    throw new Error("Match not available for clone prediction");
  }

  const [profile, memoriesCount, humanRow] = await Promise.all([
    getFanProfile(userId),
    countMemories(userId),
    getUserPredictionForMatch(userId, matchExternalId),
  ]);

  const recalledMemories = await recallMemoriesForMatch(userId, match, {
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    emphasizeCorrections: options?.emphasizeCorrections,
  });

  const output = await runLlmClonePrediction({
    profileSummary: profile?.summary ?? null,
    favoriteTeam: profile?.favorite_team ?? null,
    rivalTeam: profile?.rival_team ?? null,
    preferredStyle: profile?.preferred_style ?? null,
    match,
    recalledMemories,
    memoriesCount,
  });

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;
  const winner = normalizeWinner(output, homeCode, awayCode);
  const weakMemory = memoriesCount < 3;
  const trainingQuestion =
    output.trainingQuestion ??
    (weakMemory
      ? "Who is your favorite team and why? I need a few real takes before I can clone you properly."
      : null);

  const recallById = new Map(
    recalledMemories
      .filter((memory) => memory.id)
      .map((memory) => [memory.id!, memory]),
  );

  const validReceipts = output.memoryReceipts
    .filter((r) => r.summary.trim().length > 0)
    .map((r) => {
      const memoryId = isUuid(r.memoryId) ? r.memoryId : undefined;
      return {
        memoryId,
        summary: r.summary,
        memoryType: r.memoryType,
        strength: r.strength,
        date: new Date().toISOString(),
        recallSource: memoryId
          ? recallById.get(memoryId)?.recallSource
          : undefined,
      };
    });

  const homeScore = output.predictedScore.teamA;
  const awayScore = output.predictedScore.teamB;
  const insight =
    output.insight ??
    buildCloneInsight({
      human: humanRow,
      cloneWinner: winner,
      cloneHomeScore: homeScore,
      cloneAwayScore: awayScore,
      match,
      rivalTeam: profile?.rival_team,
    });

  const clone = await upsertClonePrediction(userId, matchExternalId, {
    winner,
    homeScore,
    awayScore,
    confidence: output.confidence,
    reasoning: output.reasoning,
    insight: insight ?? undefined,
    memoryReceipts: validReceipts,
    rawLlmOutput: output,
    trainingQuestion,
    bumpVersion: options?.bumpVersion,
  });

  return {
    clone,
    trainingQuestion,
    weakMemory,
  };
}
