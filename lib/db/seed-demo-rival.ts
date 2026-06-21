import { query, queryOne } from "@/lib/db/client";
import { getMatchDbId } from "@/lib/db/predictions";
import {
  getDemoNamespace,
  RIVAL_MEMORIES,
  RIVAL_SLUG,
  RIVAL_WALLET,
} from "@/lib/db/demo-memories";

type SeedRivalResult = {
  userId: string;
  slug: string;
  memoriesInserted: number;
};

export async function seedDemoRivalUser(): Promise<SeedRivalResult> {
  let user = await queryOne<{ id: string; public_slug: string | null }>(
    `select id, public_slug from users where public_slug = $1`,
    [RIVAL_SLUG],
  );

  const namespace = getDemoNamespace(RIVAL_SLUG);

  if (!user) {
    user = await queryOne<{ id: string; public_slug: string | null }>(
      `insert into users (wallet_address, display_name, public_slug, memwal_namespace)
       values ($1, $2, $3, $4)
       returning id, public_slug`,
      [RIVAL_WALLET, "Rival Fan", RIVAL_SLUG, namespace],
    );
  }

  if (!user) {
    throw new Error("Failed to create rival demo user");
  }

  await query(
    `update users
     set display_name = $2,
         public_slug = $3,
         memwal_namespace = $4,
         updated_at = now()
     where id = $1`,
    [user.id, "Rival Fan", RIVAL_SLUG, namespace],
  );

  await query(
    `insert into fan_profiles (
       user_id, favorite_team, rival_team, preferred_style,
       summary, public_enabled, onboarding_complete, clone_maturity
     ) values ($1, $2, $3, $4, $5, true, true, 3)
     on conflict (user_id) do update set
       favorite_team = excluded.favorite_team,
       rival_team = excluded.rival_team,
       preferred_style = excluded.preferred_style,
       summary = excluded.summary,
       public_enabled = true,
       onboarding_complete = true,
       clone_maturity = excluded.clone_maturity,
       updated_at = now()`,
    [
      user.id,
      "Colombia",
      "Portugal",
      "chaos",
      "Colombia-first chaos picker. Fades Portugal in the Americas. Built to clash with loyalty fans.",
    ],
  );

  await query(`delete from memories where user_id = $1`, [user.id]);

  let memoriesInserted = 0;
  for (const memory of RIVAL_MEMORIES) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - memory.daysAgo);

    await query(
      `insert into memories (
         user_id, memory_type, text, metadata, storage_status,
         public_visible, created_at
       ) values ($1, $2, $3, $4, 'stored', $5, $6)`,
      [
        user.id,
        memory.type,
        memory.text,
        JSON.stringify({
          ...memory.metadata,
          walrusNamespace: namespace,
          walrusBlobId: `rival-blob-${memoriesInserted + 1}`,
          walrusJobId: `rival-job-${memoriesInserted + 1}`,
        }),
        memory.publicVisible ?? true,
        createdAt.toISOString(),
      ],
    );
    memoriesInserted += 1;
  }

  const featuredMatchId = await getMatchDbId("m071");
  if (featuredMatchId) {
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
        user.id,
        featuredMatchId,
        "COL",
        2,
        1,
        74,
        "Colombia press and pace — Portugal look slow in Miami heat.",
        "hyped",
      ],
    );

    await query(
      `insert into clone_predictions (
         user_id, match_id, predicted_winner,
         predicted_score_a, predicted_score_b,
         confidence, reasoning, insight, memory_receipts
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (user_id, match_id) do update set
         predicted_winner = excluded.predicted_winner,
         predicted_score_a = excluded.predicted_score_a,
         predicted_score_b = excluded.predicted_score_b,
         confidence = excluded.confidence,
         reasoning = excluded.reasoning,
         insight = excluded.insight,
         memory_receipts = excluded.memory_receipts,
         updated_at = now()`,
      [
        user.id,
        featuredMatchId,
        "COL",
        2,
        1,
        78,
        "Your Colombia loyalty and chaos receipts scream upset over Portugal.",
        "Rival clone backs Colombia because you never trust European favorites in group games.",
        JSON.stringify([
          {
            summary: RIVAL_MEMORIES[0]!.text,
            memoryType: "remembered",
            strength: "high",
            recallSource: "walrus",
          },
        ]),
      ],
    );
  }

  return {
    userId: user.id,
    slug: RIVAL_SLUG,
    memoriesInserted,
  };
}
