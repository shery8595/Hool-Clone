import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireAuthSecret } from "@/lib/env";

export const SESSION_COOKIE = "hoolclone_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = {
  userId: string;
  walletAddress: string;
};

function getSecretKey() {
  return new TextEncoder().encode(requireAuthSecret());
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.userId;
    const walletAddress = payload.walletAddress;
    if (typeof userId !== "string" || typeof walletAddress !== "string") {
      return null;
    }
    return { userId, walletAddress };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
