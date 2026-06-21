import { storedMemoriesToReceipts } from "@/lib/api/memory-mapper";
import { memoryCountToMaturity } from "@/lib/auth/maturity";
import { huntContradictions } from "@/lib/clone/contradiction-hunter";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import {
  buildDebateMemoryCatalog,
  formatCatalogForPrompt,
} from "@/lib/debate/build-debate-memory-catalog";
import { filterDebateContradictions } from "@/lib/debate/filter-contradictions";
import { findPredictionRebuttal } from "@/lib/debate/prediction-rebuttal";
import { rankMemoriesForTurn } from "@/lib/debate/score-memory-relevance";
import { filterFreshContradictions } from "@/lib/debate/thread-variation";
import { listClonePredictionsForUser } from "@/lib/db/clone-predictions";
import { listUserPredictions } from "@/lib/db/predictions";
import { getFanProfile } from "@/lib/db/users";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import { extractMemoryDrivers } from "@/lib/stats/user-analytics";
import type { DebateMessage, MemoryReceipt } from "@/lib/mock/types";

function formatPredictionDigest(
  history: Awaited<ReturnType<typeof listUserPredictions>>,
  cloneByMatchId: Awaited<ReturnType<typeof listClonePredictionsForUser>>,
): string {
  if (history.length === 0) return "No saved predictions yet.";

  return history
    .slice(0, 6)
    .map((item) => {
      if (!item.match.homeTeam || !item.match.awayTeam) return null;
      const cloneEntry = cloneByMatchId.get(item.match.id);
      const agreed = cloneEntry
        ? predictionsAgree(item.prediction, cloneEntry.clone)
        : null;
      const winner =
        item.prediction.winner === item.match.homeTeam.code
          ? item.match.homeTeam.name
          : item.match.awayTeam.name;
      const agreement =
        agreed === null ? "" : agreed ? " · clone agreed" : " · clone disagreed";
      return `- ${item.match.homeTeam.name} vs ${item.match.awayTeam.name}: picked ${winner} ${item.prediction.homeScore}-${item.prediction.awayScore}${agreement}`;
    })
    .filter(Boolean)
    .join("\n");
}

function mergeCatalogs(
  recalled: Awaited<ReturnType<typeof buildDebateMemoryCatalog>>,
  allReceipts: MemoryReceipt[],
) {
  const seen = new Set(recalled.map((r) => r.id));
  const merged = [...recalled];
  for (const receipt of allReceipts) {
    if (seen.has(receipt.id)) continue;
    seen.add(receipt.id);
    merged.push(receipt);
  }
  return merged;
}

export async function buildDebateContext(
  userId: string,
  input: {
    userMessage: string;
    recentMessages: DebateMessage[];
  },
) {
  const [profile, history, chronologicalMemories, onboardingDrivers, cloneByMatchId] =
    await Promise.all([
      getFanProfile(userId),
      listUserPredictions(userId),
      listMemoriesChronologicalForUser(userId),
      getOnboardingDrivers(userId),
      listClonePredictionsForUser(userId),
    ]);

  const memoryTexts = chronologicalMemories.map((m) => m.text);
  const memoryDrivers = [
    ...extractMemoryDrivers(chronologicalMemories),
    ...onboardingDrivers,
  ];
  const memoriesCount = chronologicalMemories.length;
  const maturityLabel = memoryCountToMaturity(memoriesCount).label;

  const analysis = analyzeDebateTurn(input.userMessage, input.recentMessages, {
    favoriteTeam: profile?.favorite_team,
    rivalTeam: profile?.rival_team,
    memoryTexts,
  });

  const allContradictions = huntContradictions({
    profile,
    history,
    memoryDrivers,
    memoryTexts,
  });

  const freshContradictions = filterFreshContradictions(
    allContradictions,
    analysis.priorCloneTexts,
  );
  const contradictions = filterDebateContradictions(
    freshContradictions,
    analysis,
    memoryTexts,
  );

  const allReceipts = storedMemoriesToReceipts(chronologicalMemories);
  const rawCatalog = await buildDebateMemoryCatalog(
    userId,
    input.userMessage,
    profile,
    input.recentMessages,
  );
  const mergedCatalog = mergeCatalogs(rawCatalog, allReceipts);
  const rankedCatalog = rankMemoriesForTurn(
    mergedCatalog,
    input.userMessage,
    analysis,
  );
  const promptCatalog = rankedCatalog.slice(0, 10);

  const predictionRebuttal = findPredictionRebuttal(
    input.userMessage,
    history,
    profile,
  );

  const transcript = input.recentMessages
    .filter((m) => m.id !== "opening")
    .slice(-8)
    .map((m) => {
      const cites =
        m.citedReceipts?.length
          ? ` [cited: ${m.citedReceipts.map((r) => `#${r.number ?? "?"}`).join(", ")}]`
          : "";
      return `${m.role === "user" ? "Fan" : "Clone"}: ${m.text}${cites}`;
    })
    .join("\n");

  return {
    profile,
    maturityLabel,
    memoriesCount,
    analysis,
    allContradictions,
    contradictions,
    rankedCatalog,
    promptCatalog,
    catalogBlock: formatCatalogForPrompt(promptCatalog),
    predictionDigest: formatPredictionDigest(history, cloneByMatchId),
    predictionRebuttal,
    transcript,
  };
}
