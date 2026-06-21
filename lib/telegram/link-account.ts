import { query, queryOne } from "@/lib/db/client";

export type TelegramChatRow = {
  id: string;
  user_id: string;
  chat_id: string;
  notifications_enabled: boolean;
  pending_wallet: string | null;
  pending_challenge_token: string | null;
  revoked_at: Date | null;
};

export type LinkedTelegramUser = {
  userId: string;
  chatId: string;
  notificationsEnabled: boolean;
  publicSlug: string | null;
  displayName: string | null;
  walletAddress: string | null;
};

function rowToLinkedUser(
  row: TelegramChatRow & {
    public_slug: string | null;
    display_name: string | null;
    wallet_address: string | null;
  },
): LinkedTelegramUser {
  return {
    userId: row.user_id,
    chatId: row.chat_id,
    notificationsEnabled: row.notifications_enabled,
    publicSlug: row.public_slug,
    displayName: row.display_name,
    walletAddress: row.wallet_address,
  };
}

export async function findUserByChatId(
  chatId: number | string,
): Promise<LinkedTelegramUser | null> {
  const row = await queryOne<
    TelegramChatRow & {
      public_slug: string | null;
      display_name: string | null;
      wallet_address: string | null;
    }
  >(
    `select tc.*, u.public_slug, u.display_name, u.wallet_address
     from telegram_chats tc
     join users u on u.id = tc.user_id
     where tc.chat_id = $1::bigint
       and tc.revoked_at is null`,
    [String(chatId)],
  );

  return row ? rowToLinkedUser(row) : null;
}

export async function findChatByUserId(userId: string): Promise<{
  chatId: string;
  notificationsEnabled: boolean;
} | null> {
  const row = await queryOne<{
    chat_id: string;
    notifications_enabled: boolean;
  }>(
    `select chat_id, notifications_enabled
     from telegram_chats
     where user_id = $1 and revoked_at is null
     order by created_at desc
     limit 1`,
    [userId],
  );

  if (!row) return null;
  return {
    chatId: row.chat_id,
    notificationsEnabled: row.notifications_enabled,
  };
}

export async function linkChatToUser(
  userId: string,
  chatId: number | string,
  options?: { enableNotifications?: boolean },
): Promise<void> {
  const enableNotifications = options?.enableNotifications ?? false;
  await query(
    `insert into telegram_chats (
       user_id, chat_id, notifications_enabled,
       pending_wallet, pending_challenge_token, revoked_at
     ) values ($1, $2::bigint, $3, null, null, null)
     on conflict (user_id, chat_id) do update set
       revoked_at = null,
       pending_wallet = null,
       pending_challenge_token = null,
       notifications_enabled = excluded.notifications_enabled`,
    [userId, String(chatId), enableNotifications],
  );
}

export async function setPendingLink(
  chatId: number | string,
  walletAddress: string,
  challengeToken: string,
): Promise<void> {
  await query(
    `update telegram_chats
     set pending_wallet = $2,
         pending_challenge_token = $3
     where chat_id = $1::bigint and revoked_at is null`,
    [String(chatId), walletAddress, challengeToken],
  );
}

export async function getPendingLink(chatId: number | string): Promise<{
  userId: string;
  walletAddress: string;
  challengeToken: string;
} | null> {
  const row = await queryOne<{
    user_id: string;
    pending_wallet: string | null;
    pending_challenge_token: string | null;
  }>(
    `select user_id, pending_wallet, pending_challenge_token
     from telegram_chats
     where chat_id = $1::bigint and revoked_at is null`,
    [String(chatId)],
  );

  if (!row?.pending_wallet || !row.pending_challenge_token) return null;

  return {
    userId: row.user_id,
    walletAddress: row.pending_wallet,
    challengeToken: row.pending_challenge_token,
  };
}

export async function clearPendingLink(chatId: number | string): Promise<void> {
  await query(
    `update telegram_chats
     set pending_wallet = null, pending_challenge_token = null
     where chat_id = $1::bigint`,
    [String(chatId)],
  );
}

export async function setNotificationsEnabled(
  chatId: number | string,
  enabled: boolean,
): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update telegram_chats
     set notifications_enabled = $2
     where chat_id = $1::bigint and revoked_at is null
     returning id`,
    [String(chatId), enabled],
  );
  return rows.length > 0;
}

export async function revokeChatLink(chatId: number | string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update telegram_chats
     set revoked_at = now(), notifications_enabled = false
     where chat_id = $1::bigint and revoked_at is null
     returning id`,
    [String(chatId)],
  );
  return rows.length > 0;
}
