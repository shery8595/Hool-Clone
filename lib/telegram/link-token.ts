import { SignJWT, jwtVerify } from "jose";
import { requireAuthSecret } from "@/lib/env";

export const TELEGRAM_LINK_PURPOSE = "hoolclone-telegram-link";
const LINK_MAX_AGE_SECONDS = 60 * 15;

function getSecretKey() {
  return new TextEncoder().encode(requireAuthSecret());
}

export async function createTelegramLinkToken(userId: string): Promise<{
  token: string;
  expiresIn: number;
}> {
  const token = await new SignJWT({
    userId,
    purpose: TELEGRAM_LINK_PURPOSE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LINK_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  return { token, expiresIn: LINK_MAX_AGE_SECONDS };
}

export async function verifyTelegramLinkToken(
  token: string,
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (payload.purpose !== TELEGRAM_LINK_PURPOSE) {
    throw new Error("Invalid link token purpose");
  }
  if (typeof payload.userId !== "string" || !payload.userId) {
    throw new Error("Invalid link token payload");
  }
  return { userId: payload.userId };
}

export function buildTelegramDeepLink(
  botUsername: string,
  token: string,
): string {
  const username = botUsername.replace(/^@/, "");
  return `https://t.me/${username}?start=link_${token}`;
}
