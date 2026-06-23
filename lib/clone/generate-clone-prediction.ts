import { countMemories, getFanProfile } from "@/lib/db/users";
import { upsertClonePrediction } from "@/lib/db/clone-predictions";
import { listUserPredictions, getUserPredictionForMatch } from "@/lib/db/predictions";
import {
  alignCloneWinnerToPrior,
  nudgeScoresForWinner,
} from "@/lib/clone/align-clone-winner";
import { buildCloneInsight } from "@/lib/clone/clone-insight";
import {
  backfillCloneReceipts,
  buildStoredCloneReceipts,
  sortReceiptsForMatch,
} from "@/lib/clone/clone-memory-receipts";
import { computeCloneMood } from "@/lib/clone/clone-mood";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import { fallbackClonePrediction } from "@/lib/clone/fallback-clone-prediction";
import {
  inferMemoryBackedWinner,
  type MemoryBackedPrior,
} from "@/lib/clone/memory-backed-winner";
import { normalizeCloneWinner } from "@/lib/clone/normalize-clone-winner";
import { recallMemoriesForMatch } from "@/lib/clone/recall-memories";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { countMemoriesBySource, listMemoriesForUser } from "@/lib/memory/postgres-memory";
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
import type { ClonePrediction, DriverChip, Match, Prediction } from "@/lib/mock/types";
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
  onboardingDrivers: DriverChip[];
  memoryPrior: MemoryBackedPrior;
  contradictionSnippet: string | null;
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
    onboardingDrivers: input.onboardingDrivers,
    memoryPrior: input.memoryPrior,
    contradictionSnippet: input.contradictionSnippet,
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

export async function generateClonePrediction(
  userId: string,
  matchExternalId: string,
  options?: { bumpVersion?: boolean; emphasizeCorrections?: boolean },
): Promise<GenerateCloneResult> {
  const match = await getMatchDataAdapter().getMatch(matchExternalId);
  if (!match?.homeTeam || !match.awayTeam) {
    throw new Error("Match not available for clone prediction");
  }

  const [profile, memoriesCount, humanRow, postMatchMemoryCount, history, onboardingDrivers, recentMemories] =
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
      listMemoriesForUser(userId, 30),
    ]);

  const recalledMemories = await recallMemoriesForMatch(userId, match, {
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    preferredStyle: profile?.preferred_style,
    emphasizeCorrections: options?.emphasizeCorrections,
    excludeCurrentMatchPick: true,
  });

  const memoryPrior = inferMemoryBackedWinner(match, recalledMemories, profile);

  const memoryTexts = [
    ...recentMemories.map((m) => m.text),
    ...recalledMemories.map((m) => m.text),
  ];
  const uniqueMemoryTexts = [...new Set(memoryTexts)];

  const contradictionFindings = huntContradictions({
    profile,
    history,
    memoryDrivers: onboardingDrivers,
    memoryTexts: uniqueMemoryTexts,
  });

  const cloneMood = computeCloneMood({
    history,
    memoryDrivers: onboardingDrivers,
    contradictionCount: contradictionFindings.length,
    favoriteTeam: profile?.favorite_team ?? null,
  });

  const contradictionSnippet = contradictionFindings[0]?.text ?? null;

  const output = await runLlmClonePrediction({
    profileSummary: profile?.summary ?? null,
    favoriteTeam: profile?.favorite_team ?? null,
    rivalTeam: profile?.rival_team ?? null,
    preferredStyle: profile?.preferred_style ?? null,
    onboardingDrivers,
    memoryPrior,
    contradictionSnippet,
    match,
    recalledMemories,
    memoriesCount,
    postMatchMemoryCount,
    cloneMoodLabel: cloneMood.label,
    cloneMoodGuidance: cloneMood.toneGuidance,
  });

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;

  const fallbackWinner =
    memoryPrior.winner ??
    fallbackClonePrediction({
      match,
      recalledMemories,
      memoriesCount,
      favoriteTeam: profile?.favorite_team,
      rivalTeam: profile?.rival_team,
    }).predictedWinner;

  let winner = normalizeCloneWinner(
    output.predictedWinner,
    match,
    fallbackWinner,
  );

  const citedMemoryIds = output.memoryReceipts
    .map((receipt) => receipt.memoryId)
    .filter((id): id is string => Boolean(id));

  const alignment = alignCloneWinnerToPrior({
    llmWinner: winner,
    prior: memoryPrior,
    citedMemoryIds,
  });

  let reasoning = output.reasoning;
  if (alignment.adjusted) {
    winner = alignment.winner;
    if (alignment.reasoningNote) {
      reasoning = `${reasoning} ${alignment.reasoningNote}`;
    }
  }

  let homeScore = output.predictedScore.teamA;
  let awayScore = output.predictedScore.teamB;
  if (alignment.adjusted) {
    const nudged = nudgeScoresForWinner(
      winner,
      homeCode,
      awayCode,
      homeScore,
      awayScore,
    );
    homeScore = nudged.homeScore;
    awayScore = nudged.awayScore;
  }

  const weakMemory = memoriesCount < 3;
  const trainingQuestion = weakMemory
    ? (output.trainingQuestion ??
      "Who is your favorite team and why? I need a few real takes before I can clone you properly.")
    : null;

  const recallById = new Map(
    recalledMemories
      .filter((memory) => memory.id)
      .map((memory) => [memory.id!, memory]),
  );

  const builtReceipts = buildStoredCloneReceipts(output.memoryReceipts, recallById, {
    match,
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
  });

  const validReceipts = sortReceiptsForMatch(
    backfillCloneReceipts(builtReceipts, recallById, memoryPrior),
    recallById,
    matchExternalId,
  );

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
    reasoning,
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
