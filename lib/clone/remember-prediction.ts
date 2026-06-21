import { query, queryOne } from "@/lib/db/client";
import { syncCloneMaturity } from "@/lib/db/users";
import { getMemoryAdapter } from "@/lib/memory";
import { updateMemoryStorage } from "@/lib/memory/postgres-memory";
import type { EmotionState, Match } from "@/lib/mock/types";
import { formatMatchTitle } from "@/lib/mock/matches";

const PREDICTION_SUBMIT_SOURCE = "prediction_submit";

function buildPredictionMemoryText(input: {
  match: Match;
  winner: string;
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasoning?: string;
  emotion?: EmotionState;
}): string {
  const { match, winner, homeScore, awayScore, confidence, reasoning, emotion } =
    input;
  const title = formatMatchTitle(match);
  const reasonLine = reasoning?.trim()
    ? ` Reasoning: ${reasoning.trim()}`
    : "";
  const emotionLine = emotion ? ` Feeling: ${emotion}.` : "";
  return `[prediction] ${title} (${match.stage}): picked ${winner} ${homeScore}-${awayScore} at ${confidence}% confidence.${emotionLine}${reasonLine}`;
}

type PredictionMemoryRow = {
  id: string;
  memory_type: string;
  text: string;
  metadata: Record<string, unknown>;
  storage_status: string;
  created_at: Date;
};

async function findExistingPredictionMemory(
  userId: string,
  matchExternalId: string,
): Promise<PredictionMemoryRow | null> {
  return queryOne<PredictionMemoryRow>(
    `select id, memory_type, text, metadata, storage_status, created_at
     from memories
     where user_id = $1
       and metadata->>'source' = $2
       and metadata->>'matchId' = $3
       and coalesce((metadata->>'superseded')::boolean, false) = false
     order by created_at desc
     limit 1`,
    [userId, PREDICTION_SUBMIT_SOURCE, matchExternalId],
  );
}

export async function getPredictionMemoryForMatch(
  userId: string,
  matchExternalId: string,
): Promise<{
  id: string;
  text: string;
  type: string;
  source: string;
  createdAt: string;
  walrusBlobId?: string;
  storageStatus: string;
} | null> {
  const row = await findExistingPredictionMemory(userId, matchExternalId);
  if (!row) return null;

  const walrusBlobId =
    typeof row.metadata?.walrusBlobId === "string"
      ? row.metadata.walrusBlobId
      : undefined;

  return {
    id: row.id,
    text: row.text,
    type: row.memory_type,
    source: PREDICTION_SUBMIT_SOURCE,
    createdAt: row.created_at.toISOString(),
    walrusBlobId,
    storageStatus: row.storage_status,
  };
}

export async function rememberPredictionSubmission(
  userId: string,
  match: Match,
  input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning?: string;
    emotion?: EmotionState;
  },
): Promise<{ memoryId: string; status: string; updated: boolean }> {
  if (!match.homeTeam || !match.awayTeam) {
    throw new Error("Match teams required for prediction memory");
  }

  const text = buildPredictionMemoryText({ match, ...input });
  const metadata = {
    source: PREDICTION_SUBMIT_SOURCE,
    matchId: match.id,
    stage: match.stage,
    winner: input.winner,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    confidence: input.confidence,
    emotion: input.emotion ?? null,
    homeTeamCode: match.homeTeam.code,
    awayTeamCode: match.awayTeam.code,
    team: input.winner,
  };

  const existing = await findExistingPredictionMemory(userId, match.id);

  if (existing) {
    await query(
      `update memories
       set memory_type = $3,
           text = $4,
           metadata = metadata || $5::jsonb
       where id = $1 and user_id = $2`,
      [
        existing.id,
        userId,
        "prediction_pattern",
        text,
        JSON.stringify(metadata),
      ],
    );

    if (existing.storage_status === "stored") {
      await updateMemoryStorage(existing.id, "stored", {
        ...metadata,
        walrusResync: new Date().toISOString(),
      });
    }

    await syncCloneMaturity(userId);
    return {
      memoryId: existing.id,
      status: existing.storage_status,
      updated: true,
    };
  }

  const memoryAdapter = getMemoryAdapter();
  const remembered = await memoryAdapter.remember(userId, {
    type: "prediction_pattern",
    text,
    metadata,
  });

  if (!remembered.id) {
    throw new Error("Failed to store prediction memory");
  }

  await syncCloneMaturity(userId);
  return {
    memoryId: remembered.id,
    status: remembered.status,
    updated: false,
  };
}
