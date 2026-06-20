import { query } from "@/lib/db/client";
import { getAppUrl } from "@/lib/env";
import { getMemoryAdapter } from "@/lib/memory";
import { buildRoastMessage } from "@/lib/telegram/roast";
import { getTelegramBot } from "@/lib/telegram/bot";

type ResolvedMatchRow = {
  match_id: string;
  external_id: string;
  team_a_code: string | null;
  team_b_code: string | null;
  winner: string;
  score_a: number | null;
  score_b: number | null;
};

async function alreadyNotified(
  userId: string,
  matchExternalId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `select id from memories
     where user_id = $1
       and metadata->>'source' = 'telegram_post_loss'
       and metadata->>'matchId' = $2
     limit 1`,
    [userId, matchExternalId],
  );
  return rows.length > 0;
}

export async function processPostLossRoasts(): Promise<{
  processed: number;
  notified: number;
}> {
  const bot = getTelegramBot();
  if (!bot) {
    return { processed: 0, notified: 0 };
  }

  const matches = await query<ResolvedMatchRow>(
    `select m.id as match_id, m.external_id, m.team_a_code, m.team_b_code,
            m.winner, m.score_a, m.score_b
     from matches m
     where m.status = 'final'
       and m.winner is not null
       and m.kickoff_at > now() - interval '4 hours'`,
  );

  const appUrl = getAppUrl();
  let notified = 0;

  for (const match of matches) {
    const subscribers = await query<{
      chat_id: string;
      user_id: string;
      public_slug: string | null;
      favorite_team: string | null;
      predicted_winner: string | null;
    }>(
      `select distinct tc.chat_id, tc.user_id, u.public_slug,
              fp.favorite_team, p.predicted_winner
       from telegram_chats tc
       join users u on u.id = tc.user_id
       join fan_profiles fp on fp.user_id = tc.user_id
       left join predictions p on p.user_id = tc.user_id and p.match_id = $1
       where tc.notifications_enabled = true
         and tc.revoked_at is null`,
      [match.match_id],
    );

    for (const sub of subscribers) {
      if (await alreadyNotified(sub.user_id, match.external_id)) continue;

      const favoriteInMatch =
        sub.favorite_team &&
        (match.team_a_code === sub.favorite_team ||
          match.team_b_code === sub.favorite_team);

      const favoriteLost =
        favoriteInMatch && match.winner !== sub.favorite_team;

      const predictionWrong =
        sub.predicted_winner && sub.predicted_winner !== match.winner;

      if (!favoriteLost && !predictionWrong) continue;

      const matchLabel = `${match.team_a_code ?? "?"} vs ${match.team_b_code ?? "?"} (${match.score_a ?? "?"}-${match.score_b ?? "?"})`;

      const roast = await buildRoastMessage({
        userId: sub.user_id,
        publicSlug: sub.public_slug,
        appUrl,
        matchContext: matchLabel,
        wrongPick: sub.predicted_winner ?? sub.favorite_team ?? undefined,
        actualWinner: match.winner,
      });

      await bot.api.sendMessage(Number(sub.chat_id), roast.message, {
        link_preview_options: { is_disabled: true },
      });

      await getMemoryAdapter().remember(sub.user_id, {
        type: "prediction_history_summary",
        text: `Post-match: ${matchLabel}. Winner ${match.winner}. User was wrong or favorite lost.`,
        metadata: {
          source: "telegram_post_loss",
          matchId: match.external_id,
        },
      });

      await query(
        `update memories
         set public_visible = false
         where id = (
           select id from memories
           where user_id = $1
             and metadata->>'source' = 'telegram_post_loss'
             and metadata->>'matchId' = $2
           order by created_at desc
           limit 1
         )`,
        [sub.user_id, match.external_id],
      );

      notified += 1;
    }
  }

  return { processed: matches.length, notified };
}
