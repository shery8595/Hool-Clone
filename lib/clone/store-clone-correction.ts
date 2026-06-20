import { query } from "@/lib/db/client";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import { syncCloneMaturity } from "@/lib/db/users";
import { generateClonePrediction } from "@/lib/clone/generate-clone-prediction";
import { isUuid } from "@/lib/utils";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import { getMatchDataAdapter } from "@/lib/match-data";
import { getMemoryAdapter } from "@/lib/memory";
import type { ClonePrediction, Prediction } from "@/lib/mock/types";

export type StoreCloneCorrectionInput = {
  correctionText: string;
  wrongMemoryId?: string;
  regenerate?: boolean;
};

export type StoreCloneCorrectionResult = {
  memoryId: string;
  storageStatus: string;
  clone?: ClonePrediction;
  prediction?: Prediction;
  agreed?: boolean;
  regenerated: boolean;
};

export async function storeCloneCorrection(
  userId: string,
  matchExternalId: string,
  input: StoreCloneCorrectionInput,
): Promise<StoreCloneCorrectionResult> {
  const correctionText = input.correctionText.trim();
  if (correctionText.length < 8) {
    throw new Error("Correction must be at least 8 characters.");
  }

  const match = await getMatchDataAdapter().getMatch(matchExternalId);
  if (!match?.homeTeam || !match.awayTeam) {
    throw new Error("Match not available");
  }

  const human = await getUserPredictionForMatch(userId, matchExternalId);
  if (!human) {
    throw new Error("Submit your prediction before correcting the clone");
  }

  let cloneResult = await getClonePredictionForMatch(userId, matchExternalId);
  if (!cloneResult) {
    await generateClonePrediction(userId, matchExternalId);
    cloneResult = await getClonePredictionForMatch(userId, matchExternalId);
  }
  if (!cloneResult) {
    throw new Error("Generate a clone prediction before storing a correction");
  }

  const { clone } = cloneResult;
  const memoryText = [
    `Correction: ${correctionText}`,
    `Match: ${match.homeTeam.name} vs ${match.awayTeam.name}.`,
    `My pick: ${human.winner} ${human.homeScore}-${human.awayScore}.`,
    `Clone picked: ${clone.winner} ${clone.homeScore}-${clone.awayScore}.`,
    "Trust my pick over the clone's bias for similar situations.",
  ].join(" ");

  const memoryAdapter = getMemoryAdapter();
  const remembered = await memoryAdapter.remember(userId, {
    type: "correction",
    text: memoryText,
    metadata: {
      source: "clone_correction",
      matchId: matchExternalId,
      humanWinner: human.winner,
      humanScore: `${human.homeScore}-${human.awayScore}`,
      cloneWinner: clone.winner,
      cloneScore: `${clone.homeScore}-${clone.awayScore}`,
      wrongMemoryId: input.wrongMemoryId,
      userCorrection: correctionText,
    },
  });

  if (!remembered.id) {
    throw new Error("Failed to store correction memory");
  }

  if (isUuid(input.wrongMemoryId)) {
    await query(
      `update memories
       set public_visible = false,
           metadata = metadata || $3::jsonb
       where id = $1 and user_id = $2`,
      [
        input.wrongMemoryId,
        userId,
        JSON.stringify({
          disputed: true,
          disputedAt: new Date().toISOString(),
          disputedReason: correctionText.slice(0, 200),
        }),
      ],
    );
  }

  await syncCloneMaturity(userId);

  const shouldRegenerate = input.regenerate !== false;
  if (!shouldRegenerate) {
    return {
      memoryId: remembered.id,
      storageStatus: remembered.status,
      regenerated: false,
    };
  }

  const generated = await generateClonePrediction(userId, matchExternalId, {
    bumpVersion: true,
    emphasizeCorrections: true,
  });
  const updatedHuman = await getUserPredictionForMatch(userId, matchExternalId);
  const updatedClone = generated.clone;
  const agreed = updatedHuman
    ? predictionsAgree(updatedHuman, updatedClone)
    : undefined;

  return {
    memoryId: remembered.id,
    storageStatus: remembered.status,
    clone: updatedClone,
    prediction: updatedHuman ?? undefined,
    agreed,
    regenerated: true,
  };
}
