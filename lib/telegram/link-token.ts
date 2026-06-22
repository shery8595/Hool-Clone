import { randomBytes } from "node:crypto";
import { query, queryOne } from "@/lib/db/client";

/** Telegram deep-link `start` payload max length (includes `link_` prefix). */
export const TELEGRAM_START_PARAM_MAX = 64;
const LINK_PREFIX = "link_";
const LINK_MAX_AGE_SECONDS = 60 * 15;
const TOKEN_BYTES = 16;

export async function createTelegramLinkToken(userId: string): Promise<{
  token: string;
  expiresIn: number;
}> {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const startParam = `${LINK_PREFIX}${token}`;
  if (startParam.length > TELEGRAM_START_PARAM_MAX) {
    throw new Error("Telegram link token exceeds start parameter limit");
  }

  const expiresAt = new Date(Date.now() + LINK_MAX_AGE_SECONDS * 1000);
  await query(
    `insert into telegram_link_tokens (user_id, token, expires_at)
     values ($1, $2, $3)`,
    [userId, token, expiresAt],
  );

  return { token, expiresIn: LINK_MAX_AGE_SECONDS };
}

export async function verifyTelegramLinkToken(
  token: string,
): Promise<{ userId: string }> {
  const row = await queryOne<{ user_id: string }>(
    `update telegram_link_tokens
     set used_at = now()
     where token = $1
       and used_at is null
       and expires_at > now()
     returning user_id`,
    [token],
  );

  if (!row) {
    throw new Error("Link expired or invalid. Request a new link from the web app.");
  }

  return { userId: row.user_id };
}

export function buildTelegramDeepLink(
  botUsername: string,
  token: string,
): string {
  const username = botUsername.replace(/^@/, "");
  return `https://t.me/${username}?start=${LINK_PREFIX}${token}`;
}
