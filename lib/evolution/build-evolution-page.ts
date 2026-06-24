import { storedMemoriesToReceipts } from "@/lib/api/memory-mapper";
import {
  huntContradictions,
  pickDashboardContradiction,
} from "@/lib/clone/contradiction-hunter";
import { buildMemoryTimeMachine } from "@/lib/clone/build-memory-time-machine";
import { computeMaturityProgress } from "@/lib/auth/maturity";
import { listClonePredictionsForUser } from "@/lib/db/clone-predictions";
import { listUserPredictions } from "@/lib/db/predictions";
import { countMemories, findUserById, getFanProfile } from "@/lib/db/users";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import { getOnboardingDrivers } from "@/lib/onboarding/service";
import { getMatchDataAdapter } from "@/lib/match-data";
import {
  buildPredictionComparisonsFromHistory,
  extractMemoryDrivers,
  findLatestDisagreement,
} from "@/lib/stats/user-analytics";
import { buildCloneAnalyticsBundle } from "@/lib/stats/clone-analytics";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { resolveFanDisplayName } from "@/lib/auth/display-name";
import type { EvolutionPageData } from "@/lib/evolution/types";

export type { EvolutionPageData };

export async function buildEvolutionPageData(
  userId: string,
  options?: { isPublicView?: boolean },
): Promise<EvolutionPageData | null> {
  const [user, profile, memoriesCount, history, cloneByMatchId, matches, chronologicalMemories, onboardingDrivers] =
    await Promise.all([
      findUserById(userId),
      getFanProfile(userId),
      countMemories(userId),
      listUserPredictions(userId),
      listClonePredictionsForUser(userId),
      getMatchDataAdapter().listMatches(),
      listMemoriesChronologicalForUser(userId, 200),
      getOnboardingDrivers(userId),
    ]);
  if (!user) return null;

  const memoryDrivers = [
    ...extractMemoryDrivers(chronologicalMemories),
    ...onboardingDrivers,
  ];

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
    preferFastSnapshots: true,
  });

  const slug = user.public_slug ?? user.id.slice(0, 8);
  const displayName = resolveFanDisplayName(user.display_name, slug);

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
      preferredMatchId:
        user.public_slug === DEMO_SLUG ? "m071" : undefined,
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
