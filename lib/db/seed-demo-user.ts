import { query, queryOne } from "@/lib/db/client";
import { getMatchDbId } from "@/lib/db/predictions";
import {
  DEMO_MEMORIES,
  DEMO_SLUG,
  DEMO_WALLET,
  getDemoNamespace,
} from "@/lib/db/demo-memories";

type SeedDemoResult = {
  userId: string;
  slug: string;
  memoriesInserted: number;
  predictionsInserted: number;
};

export async function seedDemoUser(): Promise<SeedDemoResult> {
  let user = await queryOne<{ id: string; public_slug: string | null }>(
    `select id, public_slug from users where public_slug = $1`,
    [DEMO_SLUG],
  );

  const namespace = getDemoNamespace(DEMO_SLUG);

  if (!user) {
    user = await queryOne<{ id: string; public_slug: string | null }>(
      `insert into users (wallet_address, display_name, public_slug, memwal_namespace)
       values ($1, $2, $3, $4)
       returning id, public_slug`,
      [DEMO_WALLET, "Demo Fan", DEMO_SLUG, namespace],
    );
  }

  if (!user) {
    throw new Error("Failed to create demo user");
  }

  await query(
    `update users
     set display_name = $2,
         public_slug = $3,
         memwal_namespace = $4,
         updated_at = now()
     where id = $1`,
    [user.id, "Demo Fan", DEMO_SLUG, namespace],
  );

  await query(
    `insert into fan_profiles (
       user_id, favorite_team, rival_team, preferred_style,
       summary, public_enabled, onboarding_complete, clone_maturity
     ) values ($1, $2, $3, $4, $5, true, true, 4)
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
      "Portugal",
      "Brazil",
      "vibes",
      "Picks with vibes, argues with stats. Loyal to Portugal. Chaos-prone in knockouts.",
    ],
  );

  await query(`delete from memories where user_id = $1`, [user.id]);

  let memoriesInserted = 0;
  for (const memory of DEMO_MEMORIES) {
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
          walrusBlobId: `demo-blob-${memoriesInserted + 1}`,
          walrusJobId: `demo-job-${memoriesInserted + 1}`,
        }),
        memory.publicVisible ?? true,
        createdAt.toISOString(),
      ],
    );
    memoriesInserted += 1;
  }

  const featuredMatchId = await getMatchDbId("m071");
  let predictionsInserted = 0;

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
        "POR",
        2,
        1,
        72,
        "Portugal with heart — Colombia are dangerous but I ride my team.",
        "hyped",
      ],
    );
    predictionsInserted += 1;

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
        "POR",
        2,
        1,
        68,
        "You bleed Portugal and distrust Brazil narratives — loyalty wins this group game.",
        "Your clone picks Portugal because you corrected it to trust loyalty over xG.",
        JSON.stringify([
          {
            summary:
              "Portugal is my team — I will back them even when the xG chart says no.",
            memoryType: "remembered",
            strength: "high",
            recallSource: "walrus",
          },
          {
            summary:
              "User correction: I do trust Portugal in tight games — loyalty matters more than xG.",
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
    slug: DEMO_SLUG,
    memoriesInserted,
    predictionsInserted,
  };
}
