import { getSession } from "@/lib/auth/session";
import { buildMeResponse, type MeResponse } from "@/lib/db/users";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new AuthError();
  }
  return session.userId;
}

export async function requireUser(): Promise<MeResponse> {
  const userId = await requireUserId();
  const me = await buildMeResponse(userId);
  if (!me) {
    throw new AuthError("User not found");
  }
  return me;
}

export async function getOptionalUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}
