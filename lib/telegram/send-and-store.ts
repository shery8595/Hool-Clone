import { query } from "@/lib/db/client";
import { getTelegramBot } from "@/lib/telegram/bot";
import type { CitationSource } from "@/lib/telegram/citation-enforcement";
import type { CitedMemoryPayload } from "@/lib/telegram/citation-enforcement";
import type { MessageRecallBackend } from "@/lib/telegram/message-recall-backend";
import type { RecalledMemorySnapshot } from "@/lib/telegram/recalled-memory-snapshot";

export type TelegramMessageType =
  | "live_goal"
  | "post_match_roast"
  | "post_match_congrats"
  | "on_demand_roast";

export async function sendAndStoreTelegramMessage(input: {
  userId: string;
  chatId: string;
  matchId?: string;
  messageType: TelegramMessageType;
  body: string;
  metadata?: Record<string, unknown>;
  citedMemoryIds?: string[];
  citedMemories?: CitedMemoryPayload[];
  recalledMemorySnapshots?: RecalledMemorySnapshot[];
  recallSource?: MessageRecallBackend;
  citationSource?: CitationSource;
  citationWarnings?: string[];
  droppedInvalidIds?: string[];
}): Promise<{ telegramMessageId?: number; storedId?: string }> {
  const bot = getTelegramBot();
  if (!bot) {
    throw new Error("Telegram bot is not configured");
  }

  const sent = await bot.api.sendMessage(Number(input.chatId), input.body, {
    link_preview_options: { is_disabled: true },
  });

  const metadata = {
    ...(input.metadata ?? {}),
    citedMemoryIds: input.citedMemoryIds ?? [],
    citedMemories: input.citedMemories ?? [],
    recalledMemories: input.recalledMemorySnapshots ?? [],
    recallSource: input.recallSource ?? "none",
    citationSource: input.citationSource,
    citationWarnings: input.citationWarnings ?? [],
    droppedInvalidIds: input.droppedInvalidIds ?? [],
  };

  const rows = await query<{ id: string }>(
    `insert into telegram_messages
       (user_id, chat_id, match_id, message_type, body, metadata, telegram_message_id)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7)
     returning id`,
    [
      input.userId,
      input.chatId,
      input.matchId ?? null,
      input.messageType,
      input.body,
      JSON.stringify(metadata),
      sent.message_id,
    ],
  );

  return {
    telegramMessageId: sent.message_id,
    storedId: rows[0]?.id,
  };
}

export async function hasTelegramMessageForEvent(
  userId: string,
  messageType: TelegramMessageType,
  eventId: string,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `select id from telegram_messages
     where user_id = $1
       and message_type = $2
       and metadata->>'eventId' = $3
     limit 1`,
    [userId, messageType, eventId],
  );
  return rows.length > 0;
}

export type TelegramHistoryRow = {
  id: string;
  match_id: string | null;
  message_type: TelegramMessageType;
  body: string;
  metadata: Record<string, unknown>;
  sent_at: Date;
  external_id: string | null;
  team_a_code: string | null;
  team_b_code: string | null;
  score_a: number | null;
  score_b: number | null;
};

export async function listTelegramMessagesForUser(
  userId: string,
  limit = 50,
): Promise<TelegramHistoryRow[]> {
  return query<TelegramHistoryRow>(
    `select tm.id, tm.match_id, tm.message_type, tm.body, tm.metadata, tm.sent_at,
            m.external_id, m.team_a_code, m.team_b_code, m.score_a, m.score_b
     from telegram_messages tm
     left join matches m on m.id = tm.match_id
     where tm.user_id = $1
     order by tm.sent_at desc
     limit $2`,
    [userId, limit],
  );
}
