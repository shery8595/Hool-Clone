import { storedMemoriesToReceipts } from "@/lib/api/memory-mapper";
import {
  huntContradictions,
  pickDashboardContradiction,
} from "@/lib/clone/contradiction-hunter";
import { buildMemoryTimeMachine } from "@/lib/clone/build-memory-time-machine";
import { computeMaturityProgress } from "@/lib/auth/maturity";
import { listClonePredictionsForUser } from "@/lib/db/clone-predictions";
import { listUserPredictions } from "@/lib/db/predictions";
import { findUserById, getFanProfile } from "@/lib/db/users";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { getMatchDataAdapter } from "@/lib/match-data";
import {
  buildPredictionComparisonsFromHistory,
  extractMemoryDrivers,
  findLatestDisagreement,
} from "@/lib/stats/user-analytics";
import { buildCloneAnalyticsBundle } from "@/lib/stats/clone-analytics";
import { query } from "@/lib/db/client";
import type { EvolutionPageData } from "@/lib/evolution/types";

export type { EvolutionPageData };

export async function buildEvolutionPageData(
  userId: string,
  options?: { isPublicView?: boolean },
): Promise<EvolutionPageData | null> {
  const user = await findUserById(userId);
  const profile = await getFanProfile(userId);
  if (!user) return null;

  const [
    memoryRows,
    history,
    cloneByMatchId,
    matches,
    chronologicalMemories,
    onboardingDrivers,
  ] = await Promise.all([
    query<{ count: string }>(
      `select count(*)::text as count from memories where user_id = $1`,
      [userId],
    ),
    listUserPredictions(userId),
    listClonePredictionsForUser(userId),
    getMatchDataAdapter().listMatches(),
    listMemoriesChronologicalForUser(userId),
    getOnboardingDrivers(userId),
  ]);

  const memoryDrivers = [
    ...extractMemoryDrivers(chronologicalMemories),
    ...onboardingDrivers,
  ];

  const memoriesCount = Number(memoryRows[0]?.count ?? 0);
  const maturity = computeMaturityProgress(memoriesCount);
  const comparisons = buildPredictionComparisonsFromHistory(
    history,
    cloneByMatchId,
    12,
  );
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

  const cloneAnalytics = await buildCloneAnalyticsBundle({
    joinedAt: user.created_at,
    memories: chronologicalMemories,
    profile,
    history,
    cloneByMatchId,
    memoryDrivers,
    memoryTexts: chronologicalMemories.map((m) => m.text),
    walrusNamespace: user.memwal_namespace,
  });

  const slug = user.public_slug ?? user.id.slice(0, 8);
  const displayName = user.display_name ?? slug;

  return {
    slug,
    displayName,
    handle: slug,
    joinedAt: user.created_at.toISOString(),
    bio:
      profile?.summary ??
      ([
        profile?.favorite_team ? `Loyal to ${profile.favorite_team}.` : null,
        profile?.rival_team ? `Skeptical of ${profile.rival_team}.` : null,
        profile?.preferred_style
          ? `Predicts with ${profile.preferred_style}.`
          : null,
      ]
        .filter(Boolean)
        .join(" ") || "World Cup fan building a HoolClone clone."),
    maturityLabel: maturity.label,
    level: maturity.level,
    contradictionCount: contradictionFindings.length,
    topContradiction,
    cloneAnalytics,
    memoryTimeMachine: buildMemoryTimeMachine({
      joinedAt: user.created_at,
      memoriesCount,
      profile,
      history,
      cloneByMatchId,
      matches,
      chronologicalMemories,
      memoryDrivers,
    }),
    allMemoryReceipts: storedMemoriesToReceipts(chronologicalMemories),
    walrusNamespace: user.memwal_namespace,
    isPublicView: options?.isPublicView ?? false,
  };
}

export function evolutionDataFromPublicProfile(
  profile: import("@/lib/db/public-profile-types").PublicProfileData,
): EvolutionPageData {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    handle: profile.handle,
    joinedAt: profile.joinedAt,
    bio: profile.bio,
    maturityLabel: profile.maturityLabel,
    level: profile.level,
    contradictionCount: profile.contradictionCount,
    topContradiction: profile.topContradiction,
    cloneAnalytics: profile.cloneAnalytics,
    memoryTimeMachine: profile.memoryTimeMachine,
    allMemoryReceipts: profile.allMemoryReceipts,
    walrusNamespace: profile.allMemoryReceipts[0]?.walrusNamespace,
    isPublicView: true,
  };
}
