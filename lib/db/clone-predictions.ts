import { query, queryOne } from "@/lib/db/client";
import { getMatchDbId } from "@/lib/db/predictions";
import { isUuid } from "@/lib/utils";
import type { CloneMemoryReceipt } from "@/lib/llm/schemas/clone-prediction";
import type {
  ClonePrediction,
  MemoryReceipt,
  Prediction,
  RecallSource,
} from "@/lib/mock/types";

export type StoredCloneReceipt = CloneMemoryReceipt & {
  date?: string;
  recallSource?: RecallSource;
  memorySource?: string;
  provenanceLabel?: string;
  metadataMatchId?: string;
  walrusBlobId?: string;
  storageStatus?: "stored" | "pending" | "failed";
};

type DbCloneRow = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner: string;
  predicted_score_a: number;
  predicted_score_b: number;
  confidence: number;
  reasoning: string;
  insight: string | null;
  memory_receipts: StoredCloneReceipt[];
  raw_llm_output: unknown;
  training_question: string | null;
  created_at: Date;
  updated_at: Date;
  external_id: string;
};

function receiptsToUi(receipts: StoredCloneReceipt[]): MemoryReceipt[] {
  return receipts.map((r, index) => ({
    id: isUuid(r.memoryId) ? r.memoryId : `receipt-${index}`,
    number: index + 1,
    type: "used",
    text: r.summary,
    date: r.date ?? new Date().toISOString(),
    metadataMatchId: r.metadataMatchId,
    publicVisible: true,
    usedInPrediction: true,
    recallSource: r.recallSource,
    memorySource: r.memorySource,
    provenanceLabel: r.provenanceLabel,
    walrusBlobId: r.walrusBlobId,
    storageStatus: r.storageStatus,
  }));
}

export function dbCloneToPrediction(row: DbCloneRow): ClonePrediction {
  const clone: ClonePrediction = {
    winner: row.predicted_winner,
    homeScore: row.predicted_score_a,
    awayScore: row.predicted_score_b,
    confidence: row.confidence,
    reasoning: row.reasoning,
    receipts: receiptsToUi(row.memory_receipts ?? []),
  };

  if (row.insight) clone.insight = row.insight;
  return clone;
}

export type ClonePredictionEntry = {
  clone: ClonePrediction;
  trainingQuestion: string | null;
  insight: string | null;
  reasoning: string;
};

function rowToEntry(row: DbCloneRow): ClonePredictionEntry {
  return {
    clone: dbCloneToPrediction(row),
    trainingQuestion: row.training_question,
    insight: row.insight,
    reasoning: row.reasoning,
  };
}

export async function listClonePredictionsForUser(
  userId: string,
): Promise<Map<string, ClonePredictionEntry>> {
  const rows = await query<DbCloneRow>(
    `select cp.*, m.external_id
     from clone_predictions cp
     join matches m on m.id = cp.match_id
     where cp.user_id = $1`,
    [userId],
  );

  const map = new Map<string, ClonePredictionEntry>();
  for (const row of rows) {
    map.set(row.external_id, rowToEntry(row));
  }
  return map;
}

export async function getClonePredictionForMatch(
  userId: string,
  matchExternalId: string,
): Promise<{
  clone: ClonePrediction;
  trainingQuestion: string | null;
} | null> {
  const row = await queryOne<DbCloneRow>(
    `select
       cp.*, m.external_id
     from clone_predictions cp
     join matches m on m.id = cp.match_id
     where cp.user_id = $1 and m.external_id = $2`,
    [userId, matchExternalId],
  );

  if (!row) return null;

  const entry = rowToEntry(row);
  return {
    clone: entry.clone,
    trainingQuestion: entry.trainingQuestion,
  };
}

export async function upsertClonePrediction(
  userId: string,
  matchExternalId: string,
  input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning: string;
    insight?: string | null;
    memoryReceipts: StoredCloneReceipt[];
    rawLlmOutput?: unknown;
    trainingQuestion?: string | null;
    bumpVersion?: boolean;
  },
): Promise<ClonePrediction> {
  const matchId = await getMatchDbId(matchExternalId);
  if (!matchId) throw new Error("Match not found");

  const receipts = input.memoryReceipts.map((r) => ({
    ...r,
    date: r.date ?? new Date().toISOString(),
  }));

  await query(
    `insert into clone_predictions (
       user_id, match_id, predicted_winner,
       predicted_score_a, predicted_score_b,
       confidence, reasoning, insight,
       memory_receipts, raw_llm_output, training_question
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (user_id, match_id) do update set
       predicted_winner = excluded.predicted_winner,
       predicted_score_a = excluded.predicted_score_a,
       predicted_score_b = excluded.predicted_score_b,
       confidence = excluded.confidence,
       reasoning = excluded.reasoning,
       insight = excluded.insight,
       memory_receipts = excluded.memory_receipts,
       raw_llm_output = excluded.raw_llm_output,
       training_question = excluded.training_question,
       clone_version = clone_predictions.clone_version + $12,
       updated_at = now()`,
    [
      userId,
      matchId,
      input.winner,
      input.homeScore,
      input.awayScore,
      input.confidence,
      input.reasoning,
      input.insight ?? null,
      JSON.stringify(receipts),
      input.rawLlmOutput ? JSON.stringify(input.rawLlmOutput) : null,
      input.trainingQuestion ?? null,
      input.bumpVersion ? 1 : 0,
    ],
  );

  const saved = await getClonePredictionForMatch(userId, matchExternalId);
  if (!saved) throw new Error("Failed to save clone prediction");
  return saved.clone;
}
