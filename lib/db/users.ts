import { resolveFanDisplayName } from "@/lib/auth/display-name";
import { query, queryOne } from "@/lib/db/client";
import { ACTIVE_MEMORY_SQL } from "@/lib/memory/memory-filters";
import { memoryCountToMaturity } from "@/lib/auth/maturity";
import type { CloneMaturity } from "@/lib/mock/types";

export type DbUser = {
  id: string;
  wallet_address: string | null;
  display_name: string | null;
  public_slug: string | null;
  memwal_namespace: string;
  created_at: Date;
  updated_at: Date;
};

export type DbFanProfile = {
  user_id: string;
  favorite_team: string | null;
  rival_team: string | null;
  preferred_style: string | null;
  tone: string;
  clone_maturity: number;
  public_enabled: boolean;
  summary: string | null;
  onboarding_complete: boolean;
  updated_at: Date;
};

export type MeResponse = {
  id: string;
  walletAddress: string | null;
  displayName: string | null;
  publicSlug: string | null;
  memwalNamespace: string;
  profile: {
    favoriteTeam: string | null;
    rivalTeam: string | null;
    preferredStyle: string | null;
    tone: string;
    cloneMaturity: number;
    cloneMaturityLabel: CloneMaturity;
    publicEnabled: boolean;
    summary: string | null;
    onboardingComplete: boolean;
    memoriesCount: number;
  };
};

function slugifyBase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
}

function randomSuffix(length = 4): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export async function generateUniqueSlug(base: string): Promise<string> {
  const normalized = slugifyBase(base) || "fan";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate =
      attempt === 0 ? normalized : `${normalized}-${randomSuffix()}`;
    const existing = await queryOne<{ id: string }>(
      "select id from users where public_slug = $1",
      [candidate],
    );
    if (!existing) return candidate;
  }
  return `${normalized}-${randomSuffix(6)}`;
}

export async function findUserByWallet(
  walletAddress: string,
): Promise<DbUser | null> {
  return queryOne<DbUser>(
    "select * from users where lower(wallet_address) = lower($1)",
    [walletAddress],
  );
}

export async function findUserById(userId: string): Promise<DbUser | null> {
  return queryOne<DbUser>("select * from users where id = $1", [userId]);
}

export async function getFanProfile(
  userId: string,
): Promise<DbFanProfile | null> {
  return queryOne<DbFanProfile>(
    "select * from fan_profiles where user_id = $1",
    [userId],
  );
}

export async function countMemories(userId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from memories
     where user_id = $1
       and ${ACTIVE_MEMORY_SQL}`,
    [userId],
  );
  return Number(row?.count ?? 0);
}

export async function findOrCreateUserByWallet(
  walletAddress: string,
): Promise<DbUser> {
  const existing = await findUserByWallet(walletAddress);
  if (existing) return existing;

  const user = await queryOne<DbUser>(
    `insert into users (wallet_address, memwal_namespace)
     values ($1, 'pending')
     returning *`,
    [walletAddress],
  );

  if (!user) {
    throw new Error("Failed to create user");
  }

  const namespace = `hoolclone:user:${user.id}`;
  const updated = await queryOne<DbUser>(
    `update users
     set memwal_namespace = $2, updated_at = now()
     where id = $1
     returning *`,
    [user.id, namespace],
  );

  await query(
    `insert into fan_profiles (user_id) values ($1)
     on conflict (user_id) do nothing`,
    [user.id],
  );

  return updated ?? user;
}

export async function buildMeResponse(userId: string): Promise<MeResponse | null> {
  const [user, profile, memoriesCount] = await Promise.all([
    findUserById(userId),
    getFanProfile(userId),
    countMemories(userId),
  ]);
  if (!user) return null;

  const maturity = memoryCountToMaturity(memoriesCount);

  return {
    id: user.id,
    walletAddress: user.wallet_address,
    displayName: user.display_name,
    publicSlug: user.public_slug,
    memwalNamespace: user.memwal_namespace,
    profile: {
      favoriteTeam: profile?.favorite_team ?? null,
      rivalTeam: profile?.rival_team ?? null,
      preferredStyle: profile?.preferred_style ?? null,
      tone: profile?.tone ?? "playful",
      cloneMaturity: maturity.level,
      cloneMaturityLabel: maturity.label,
      publicEnabled: profile?.public_enabled ?? false,
      summary: profile?.summary ?? null,
      onboardingComplete: profile?.onboarding_complete ?? false,
      memoriesCount,
    },
  };
}

export async function updateFanProfile(
  userId: string,
  updates: {
    favoriteTeam?: string | null;
    rivalTeam?: string | null;
    preferredStyle?: string | null;
    displayName?: string | null;
    summary?: string | null;
  },
): Promise<void> {
  if (updates.displayName !== undefined) {
    const trimmed = updates.displayName?.trim() ?? null;
    await query(
      `update users set display_name = $2, updated_at = now() where id = $1`,
      [userId, trimmed],
    );
  }

  await query(
    `update fan_profiles set
       favorite_team = coalesce($2, favorite_team),
       rival_team = coalesce($3, rival_team),
       preferred_style = coalesce($4, preferred_style),
       summary = coalesce($5, summary),
       updated_at = now()
     where user_id = $1`,
    [
      userId,
      updates.favoriteTeam ?? null,
      updates.rivalTeam ?? null,
      updates.preferredStyle ?? null,
      updates.summary ?? null,
    ],
  );
}

export async function enablePublicProfile(
  userId: string,
  displayName?: string | null,
): Promise<{ slug: string }> {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  let slug = user.public_slug;
  if (!slug) {
    const base = displayName || user.display_name || user.wallet_address || "fan";
    slug = await generateUniqueSlug(base);
    await query(
      `update users set public_slug = $2, updated_at = now() where id = $1`,
      [userId, slug],
    );
  }

  await query(
    `update fan_profiles set public_enabled = true, updated_at = now() where user_id = $1`,
    [userId],
  );

  return { slug };
}

export async function syncCloneMaturity(userId: string): Promise<number> {
  const memoriesCount = await countMemories(userId);
  const { level } = memoryCountToMaturity(memoriesCount);
  await query(
    `update fan_profiles set clone_maturity = $2, updated_at = now() where user_id = $1`,
    [userId, level],
  );
  return level;
}
