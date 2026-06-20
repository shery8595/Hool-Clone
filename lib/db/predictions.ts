import { query, queryOne } from "@/lib/db/client";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import { dbMatchToMatch, type DbMatchRow } from "@/lib/match-data/mapper";
import type {
  ClonePrediction,
  EmotionState,
  Match,
  Prediction,
} from "@/lib/mock/types";

function attachClone(
  prediction: Prediction,
  clone: ClonePrediction,
): Prediction {
  return {
    ...prediction,
    clone,
    agreed: predictionsAgree(prediction, clone),
  };
}

type DbPredictionRow = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner: string;
  predicted_score_a: number;
  predicted_score_b: number;
  confidence: number;
  reasoning: string | null;
  emotional_state: string | null;
  created_at: Date;
  updated_at: Date;
};

type JoinedRow = DbPredictionRow & Omit<DbMatchRow, "id"> & { match_row_id: string };

function joinedRowToMatchRow(row: JoinedRow): DbMatchRow {
  return {
    id: row.match_row_id,
    external_id: row.external_id,
    match_number: row.match_number,
    tournament_stage: row.tournament_stage,
    group_code: row.group_code,
    team_a_code: row.team_a_code,
    team_b_code: row.team_b_code,
    matchup_label: row.matchup_label,
    venue: row.venue,
    city: row.city,
    kickoff_at: row.kickoff_at,
    status: row.status,
    featured: row.featured,
  };
}

export type PredictionHistoryItem = {
  prediction: Prediction;
  match: Match;
  savedAt: string;
};

function rowToHistoryItem(row: JoinedRow): PredictionHistoryItem {
  const match = dbMatchToMatch(joinedRowToMatchRow(row));

  return {
    match,
    savedAt: row.updated_at.toISOString(),
    prediction: {
      matchId: row.external_id,
      winner: row.predicted_winner,
      homeScore: row.predicted_score_a,
      awayScore: row.predicted_score_b,
      confidence: row.confidence,
      reasoning: row.reasoning ?? "",
      emotion: (row.emotional_state as EmotionState) ?? "calm",
    },
  };
}

const PREDICTION_SELECT = `
  select
    p.id, p.user_id, p.match_id,
    p.predicted_winner, p.predicted_score_a, p.predicted_score_b,
    p.confidence, p.reasoning, p.emotional_state,
    p.created_at, p.updated_at,
    m.external_id, m.match_number, m.tournament_stage,
    m.group_code, m.team_a_code, m.team_b_code, m.matchup_label,
    m.venue, m.city, m.kickoff_at, m.status, m.featured,
    m.id as match_row_id
  from predictions p
  join matches m on m.id = p.match_id
`;

async function fetchPredictionRow(
  userId: string,
  matchExternalId: string,
): Promise<JoinedRow | null> {
  return queryOne<JoinedRow>(
    `${PREDICTION_SELECT}
     where p.user_id = $1 and m.external_id = $2`,
    [userId, matchExternalId],
  );
}

export async function getMatchDbId(externalId: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `select id from matches where external_id = $1`,
    [externalId],
  );
  return row?.id ?? null;
}

export async function upsertPrediction(
  userId: string,
  matchExternalId: string,
  input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning?: string;
    emotion?: EmotionState;
  },
): Promise<Prediction> {
  const matchId = await getMatchDbId(matchExternalId);
  if (!matchId) {
    throw new Error("Match not found");
  }

  await query(
    `insert into predictions (
       user_id, match_id, predicted_winner,
       predicted_score_a, predicted_score_b,
       confidence, reasoning, emotional_state
     ) values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (user_id, match_id) do update set
       predicted_winner = excluded.predicted_winner,
       predicted_score_a = excluded.predicted_score_a,
       predicted_score_b = excluded.predicted_score_b,
       confidence = excluded.confidence,
       reasoning = excluded.reasoning,
       emotional_state = excluded.emotional_state,
       updated_at = now()`,
    [
      userId,
      matchId,
      input.winner,
      input.homeScore,
      input.awayScore,
      input.confidence,
      input.reasoning ?? null,
      input.emotion ?? null,
    ],
  );

  const row = await fetchPredictionRow(userId, matchExternalId);
  if (!row) throw new Error("Failed to save prediction");

  return rowToHistoryItem(row).prediction;
}

export async function getUserPredictionForMatch(
  userId: string,
  matchExternalId: string,
): Promise<Prediction | null> {
  const row = await fetchPredictionRow(userId, matchExternalId);
  if (!row) return null;

  const prediction = rowToHistoryItem(row).prediction;
  const cloneResult = await getClonePredictionForMatch(userId, matchExternalId);
  if (!cloneResult) return prediction;

  return attachClone(prediction, cloneResult.clone);
}

export async function listUserPredictions(
  userId: string,
): Promise<PredictionHistoryItem[]> {
  const rows = await query<JoinedRow>(
    `${PREDICTION_SELECT}
     where p.user_id = $1
     order by p.updated_at desc`,
    [userId],
  );

  return rows.map(rowToHistoryItem);
}
