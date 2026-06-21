import { countMemories, getFanProfile } from "@/lib/db/users";
import { upsertClonePrediction } from "@/lib/db/clone-predictions";
import { listUserPredictions, getUserPredictionForMatch } from "@/lib/db/predictions";
import { buildCloneInsight } from "@/lib/clone/clone-insight";
import { computeCloneMood } from "@/lib/clone/clone-mood";
import { fallbackClonePrediction } from "@/lib/clone/fallback-clone-prediction";
import { recallMemoriesForMatch } from "@/lib/clone/recall-memories";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { countMemoriesBySource } from "@/lib/memory/postgres-memory";
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
import { formatProvenanceLabel } from "@/lib/clone/memory-provenance";
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
  postMatchMemoryCount?: number;
  cloneMoodLabel?: string;
  cloneMoodGuidance?: string;
}): Promise<ClonePredictionOutput> {
  const llm = getLlmAdapter();
  const userPrompt = buildClonePredictionPrompt({
    profileSummary: input.profileSummary,
    favoriteTeam: input.favoriteTeam,
    rivalTeam: input.rivalTeam,
    preferredStyle: input.preferredStyle,
    match: input.match,
    recalledMemories: input.recalledMemories.map((m) => ({
      id: m.id,
      text: m.text,
      type: m.type,
      score: m.score,
      source: m.source,
    })),
    memoriesCount: input.memoriesCount,
    postMatchMemoryCount: input.postMatchMemoryCount,
    cloneMoodLabel: input.cloneMoodLabel,
    cloneMoodGuidance: input.cloneMoodGuidance,
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

  const [profile, memoriesCount, humanRow, postMatchMemoryCount, history, onboardingDrivers] =
    await Promise.all([
      getFanProfile(userId),
      countMemories(userId),
      getUserPredictionForMatch(userId, matchExternalId),
      Promise.all([
        countMemoriesBySource(userId, "telegram_post_match"),
        countMemoriesBySource(userId, "match_resolution"),
      ]).then(([telegram, resolution]) => telegram + resolution),
      listUserPredictions(userId),
      getOnboardingDrivers(userId),
    ]);

  const cloneMood = computeCloneMood({
    history,
    memoryDrivers: onboardingDrivers,
    contradictionCount: 0,
    favoriteTeam: profile?.favorite_team ?? null,
  });

  const recalledMemories = await recallMemoriesForMatch(userId, match, {
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    emphasizeCorrections: options?.emphasizeCorrections,
    excludeCurrentMatchPick: true,
  });

  const output = await runLlmClonePrediction({
    profileSummary: profile?.summary ?? null,
    favoriteTeam: profile?.favorite_team ?? null,
    rivalTeam: profile?.rival_team ?? null,
    preferredStyle: profile?.preferred_style ?? null,
    match,
    recalledMemories,
    memoriesCount,
    postMatchMemoryCount,
    cloneMoodLabel: cloneMood.label,
    cloneMoodGuidance: cloneMood.toneGuidance,
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
      const recalled = memoryId ? recallById.get(memoryId) : undefined;
      const memorySource = recalled?.source;
      const createdAt = recalled?.createdAt ?? new Date().toISOString();
      const walrusBlobId = recalled?.walrusBlobId;
      return {
        memoryId,
        summary: r.summary,
        memoryType: r.memoryType,
        strength: r.strength,
        date: createdAt,
        recallSource: recalled?.recallSource,
        memorySource,
        provenanceLabel: formatProvenanceLabel(
          memorySource,
          createdAt,
          recalled?.metadataMatchId,
        ),
        walrusBlobId,
        storageStatus: walrusBlobId
          ? ("stored" as const)
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
