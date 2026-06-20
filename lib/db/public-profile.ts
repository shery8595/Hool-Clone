import { query } from "@/lib/db/client";
import {
  listClonePredictionsForUser,
  type ClonePredictionEntry,
} from "@/lib/db/clone-predictions";
import {
  listUserPredictions,
  type PredictionHistoryItem,
} from "@/lib/db/predictions";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";
import {
  buildBiasRadar,
  buildEvolutionTimeline,
  buildPredictionComparisonsFromHistory,
  computeCloneAgreementPercent,
  extractMemoryDrivers,
  findLatestDisagreement,
} from "@/lib/stats/user-analytics";
import { computeMaturityProgress } from "@/lib/auth/maturity";
import { storedMemoryToReceipt } from "@/lib/api/memory-mapper";
import {
  huntContradictions,
  pickDashboardContradiction,
} from "@/lib/clone/contradiction-hunter";
import { buildMemoryTimeMachine } from "@/lib/clone/build-memory-time-machine";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { getMatchDataAdapter } from "@/lib/match-data";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import type { StoredMemory } from "@/lib/memory/memory-adapter";
import type { DebateHighlight, MemoryReceipt } from "@/lib/mock/types";
import { findUserById, getFanProfile, type DbUser } from "@/lib/db/users";
import type { PublicProfileData } from "@/lib/db/public-profile-types";

export type { PublicProfileData };

type MemoryRow = {
  id: string;
  memory_type: string;
  text: string;
  metadata: Record<string, unknown>;
  storage_status: string;
  public_visible: boolean;
  question_id: string | null;
  created_at: Date;
};

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfileData | null> {
  const normalized = slug.trim();
  if (!normalized) return null;

  const rows = await query<{ id: string; public_slug: string }>(
    `select u.id, u.public_slug
     from users u
     join fan_profiles fp on fp.user_id = u.id
     where lower(u.public_slug) = lower($1) and fp.public_enabled = true`,
    [normalized],
  );

  const row = rows[0];
  if (!row) return null;

  return buildPublicProfile(row.id, row.public_slug);
}

async function listDebateHighlights(
  userId: string,
  limit = 6,
): Promise<DebateHighlight[]> {
  const rows = await query<MemoryRow>(
    `select * from memories
     where user_id = $1
       and metadata->>'source' = 'debate_highlight'
       and public_visible = true
     order by created_at desc
     limit $2`,
    [userId, limit],
  );

  return rows.map((row) => {
    const metadata = row.metadata ?? {};
    const topics = Array.isArray(metadata.topics)
      ? metadata.topics.filter((topic): topic is string => typeof topic === "string")
      : [];

    return {
      id: row.id,
      summary: row.text,
      exchangeCount:
        typeof metadata.exchangeCount === "number" ? metadata.exchangeCount : 0,
      citedMemoryCount:
        typeof metadata.citedMemoryCount === "number"
          ? metadata.citedMemoryCount
          : 0,
      topics,
      date: row.created_at.toISOString(),
    };
  });
}

async function listPublicMemoryReceipts(
  userId: string,
  limit = 12,
): Promise<MemoryReceipt[]> {
  const rows = await query<MemoryRow>(
    `select * from memories
     where user_id = $1
       and public_visible = true
       and coalesce((metadata->>'disputed')::boolean, false) = false
     order by created_at desc
     limit $2`,
    [userId, limit],
  );

  return rows.map((row, index) =>
    storedMemoryToReceipt(
      {
        id: row.id,
        type: row.memory_type,
        text: row.text,
        metadata: row.metadata ?? {},
        storageStatus: row.storage_status,
        publicVisible: row.public_visible,
        createdAt: row.created_at.toISOString(),
        questionId: row.question_id ?? undefined,
      } satisfies StoredMemory,
      index,
    ),
  );
}

function collectCloneReceipts(
  cloneByMatchId: Map<string, ClonePredictionEntry>,
): MemoryReceipt[] {
  const receipts: MemoryReceipt[] = [];
  let index = 0;

  for (const entry of cloneByMatchId.values()) {
    for (const receipt of entry.clone.receipts ?? []) {
      receipts.push({
        ...receipt,
        number: ++index,
        publicVisible: true,
        usedInPrediction: true,
        type: "used",
      });
    }
  }

  return receipts.slice(0, 12);
}

function attachClonesToHistory(
  history: PredictionHistoryItem[],
  cloneByMatchId: Map<string, ClonePredictionEntry>,
): PredictionHistoryItem[] {
  return history.map((item) => {
    const cloneEntry = cloneByMatchId.get(item.match.id);
    if (!cloneEntry) return item;

    return {
      ...item,
      prediction: {
        ...item.prediction,
        clone: cloneEntry.clone,
        agreed: predictionsAgree(item.prediction, cloneEntry.clone),
      },
    };
  });
}

export async function buildPublicProfile(
  userId: string,
  slug: string,
): Promise<PublicProfileData | null> {
  const user: DbUser | null = await findUserById(userId);
  const profile = await getFanProfile(userId);
  if (!user || !profile?.public_enabled) return null;

  const [memoryRows, history, cloneByMatchId, publicMemories, debateHighlights, matches, chronologicalMemories, onboardingDrivers] =
    await Promise.all([
      query<{ count: string }>(
        `select count(*)::text as count from memories where user_id = $1`,
        [userId],
      ),
      listUserPredictions(userId),
      listClonePredictionsForUser(userId),
      listPublicMemoryReceipts(userId),
      listDebateHighlights(userId),
      getMatchDataAdapter().listMatches(),
      listMemoriesChronologicalForUser(userId),
      getOnboardingDrivers(userId),
    ]);

  const memoryDrivers = [
    ...extractMemoryDrivers(chronologicalMemories),
    ...onboardingDrivers,
  ];

  const memoriesCount = Number(memoryRows[0]?.count ?? 0);
  const comparisons = buildPredictionComparisonsFromHistory(
    history,
    cloneByMatchId,
    12,
  );
  const cloneMatchPercent = computeCloneAgreementPercent(comparisons);
  const maturity = computeMaturityProgress(memoriesCount);
  const displayName = user.display_name ?? slug;
  const cloneReceipts = collectCloneReceipts(cloneByMatchId);
  const predictionHistory = attachClonesToHistory(history, cloneByMatchId);
  const cloneDisagreement = findLatestDisagreement(comparisons, cloneByMatchId);
  const contradictionFindings = huntContradictions({
    profile,
    history,
    memoryDrivers,
    memoryTexts: chronologicalMemories.map((m) => m.text),
  });
  const topContradiction = pickDashboardContradiction(
    contradictionFindings,
    cloneDisagreement,
  );

  return {
    slug,
    displayName,
    handle: slug,
    joinedAt: user.created_at.toISOString(),
    bio:
      profile.summary ??
      ([
        profile.favorite_team ? `Loyal to ${profile.favorite_team}.` : null,
        profile.rival_team ? `Skeptical of ${profile.rival_team}.` : null,
        profile.preferred_style
          ? `Predicts with ${profile.preferred_style}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ") || "World Cup fan building a HoolClone clone."),
    maturityLabel: maturity.label,
    level: maturity.level,
    maxLevel: maturity.maxLevel,
    levelProgress: maturity.progress,
    memoriesCount,
    predictionsCount: history.length,
    cloneMatchPercent,
    biasRadar: buildBiasRadar({
      profile,
      memoriesCount,
      history,
      cloneByMatchId,
      memoryDrivers,
    }),
    evolutionTimeline: buildEvolutionTimeline({
      joinedAt: user.created_at,
      memoriesCount,
    }),
    predictionHistory,
    publicMemories,
    cloneReceipts,
    comparisons,
    topContradiction,
    contradictionCount: contradictionFindings.length,
    memoryTimeMachine: buildMemoryTimeMachine({
      memoriesCount,
      profile,
      history,
      cloneByMatchId,
      matches,
      chronologicalMemories,
      memoryDrivers,
    }),
    debateHighlights,
  };
}
