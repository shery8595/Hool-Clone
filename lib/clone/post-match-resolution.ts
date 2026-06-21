import { query, queryOne } from "@/lib/db/client";
import { getClonePredictionForMatch } from "@/lib/db/clone-predictions";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import { getMemoryAdapter } from "@/lib/memory";

const MATCH_RESOLUTION_SOURCE = "match_resolution";

type ResolvedMatchRow = {
  match_id: string;
  external_id: string;
  team_a_code: string | null;
  team_b_code: string | null;
  winner: string;
  score_a: number | null;
  score_b: number | null;
};

type PredictorRow = {
  user_id: string;
  predicted_winner: string | null;
  predicted_score_a: number | null;
  predicted_score_b: number | null;
};

export function buildPostMatchResolutionMemoryText(input: {
  matchLabel: string;
  predictedWinner: string | null;
  predictedScore: string | null;
  actualWinner: string;
  actualScore: string;
  humanCorrect: boolean;
  cloneAgreed: boolean | null;
}): string {
  const pick = input.predictedWinner ?? "no pick";
  const scoreLine = input.predictedScore ? ` (${input.predictedScore})` : "";
  const cloneLine =
    input.cloneAgreed == null
      ? "Clone prediction unavailable."
      : input.cloneAgreed
        ? "Clone agreed with the user's pick."
        : "Clone disagreed with the user's pick.";
  const outcome = input.humanCorrect ? "correct" : "incorrect";
  return `[post_match] ${input.matchLabel}: predicted ${pick}${scoreLine}, actual winner ${input.actualWinner} (${input.actualScore}). User was ${outcome}. ${cloneLine}`;
}

async function alreadyResolvedMemory(
  userId: string,
  matchExternalId: string,
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `select id from memories
     where user_id = $1
       and metadata->>'matchId' = $2
       and metadata->>'source' = any($3::text[])
     limit 1`,
    [
      userId,
      matchExternalId,
      [
        MATCH_RESOLUTION_SOURCE,
        "telegram_post_match",
        "telegram_post_loss",
      ],
    ],
  );
  return Boolean(row?.id);
}

export async function processPostMatchResolutionMemories(): Promise<{
  processed: number;
  memoriesWritten: number;
}> {
  const matches = await query<ResolvedMatchRow>(
    `select m.id as match_id, m.external_id, m.team_a_code, m.team_b_code,
            m.winner, m.score_a, m.score_b
     from matches m
     where m.status = 'final'
       and m.winner is not null
       and m.kickoff_at > now() - interval '7 days'`,
  );

  const memoryAdapter = getMemoryAdapter();
  let memoriesWritten = 0;

  for (const match of matches) {
    const predictors = await query<PredictorRow>(
      `select p.user_id, p.predicted_winner, p.predicted_score_a, p.predicted_score_b
       from predictions p
       where p.match_id = $1`,
      [match.match_id],
    );

    const matchLabel = `${match.team_a_code ?? "?"} vs ${match.team_b_code ?? "?"} (${match.score_a ?? "?"}-${match.score_b ?? "?"})`;
    const actualScore = `${match.score_a ?? "?"}-${match.score_b ?? "?"}`;

    for (const predictor of predictors) {
      if (await alreadyResolvedMemory(predictor.user_id, match.external_id)) {
        continue;
      }

      const humanCorrect = predictor.predicted_winner === match.winner;
      const predictedScore =
        predictor.predicted_score_a != null && predictor.predicted_score_b != null
          ? `${predictor.predicted_score_a}-${predictor.predicted_score_b}`
          : null;

      const cloneResult = await getClonePredictionForMatch(
        predictor.user_id,
        match.external_id,
      );

      let cloneAgreed: boolean | null = null;
      if (cloneResult && predictor.predicted_winner) {
        cloneAgreed = predictionsAgree(
          {
            winner: predictor.predicted_winner,
            homeScore: predictor.predicted_score_a ?? 0,
            awayScore: predictor.predicted_score_b ?? 0,
          },
          cloneResult.clone,
        );
      }

      await memoryAdapter.remember(predictor.user_id, {
        type: "prediction_history_summary",
        text: buildPostMatchResolutionMemoryText({
          matchLabel,
          predictedWinner: predictor.predicted_winner,
          predictedScore,
          actualWinner: match.winner,
          actualScore,
          humanCorrect,
          cloneAgreed,
        }),
        metadata: {
          source: MATCH_RESOLUTION_SOURCE,
          outcome: humanCorrect ? "win" : "loss",
          matchId: match.external_id,
          predictedWinner: predictor.predicted_winner ?? undefined,
          actualWinner: match.winner,
          humanCorrect,
          cloneAgreed,
        },
      });

      memoriesWritten += 1;
    }
  }

  return { processed: matches.length, memoriesWritten };
}
