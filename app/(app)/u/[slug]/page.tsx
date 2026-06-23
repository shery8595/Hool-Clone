import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContradictionHunterCard } from "@/components/clone/contradiction-hunter-card";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { EvolutionTeaserCard } from "@/components/evolution/evolution-teaser-card";
import { DebateHighlightsCard } from "@/components/profile/debate-highlights-card";
import { ProfileAnalyticsAccordion } from "@/components/profile/profile-analytics-accordion";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileSection } from "@/components/profile/profile-section";
import { StatCardRow } from "@/components/profile/stat-card-row";
import { PublicPredictionHistory } from "@/components/profile/public-prediction-history";
import { BiasRadarChart } from "@/components/charts/bias-radar-chart";
import { EvolutionTimeline } from "@/components/profile/evolution-timeline";
import { SeasonReportCard } from "@/components/profile/season-report-card";
import { CloneDriftChart } from "@/components/charts/clone-drift-chart";
import { PredictionComparisonTable } from "@/components/profile/prediction-comparison-table";
import { PublicReceiptGrid } from "@/components/memory/public-receipt-grid";
import { HOOLCLONE_LOGO_SRC } from "@/components/brand/hoolclone-logo";
import { getPublicProfileBySlug } from "@/lib/db/public-profile";
import type { CloneMaturity } from "@/lib/mock/types";

export const dynamic = "force-dynamic";

type PublicProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) {
    return { title: "Profile not found · HoolClone" };
  }
  return {
    title: `${profile.displayName}'s HoolClone · @${profile.handle}`,
    description: profile.bio,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const hasBehavioralContradiction = profile.contradictionCount > 0;
  const hasCloneDisagreement = profile.comparisons.some(
    (c) => c.clonePrediction !== "—" && !c.agreed,
  );

  const seenReceiptIds = new Set<string>();
  const allReceipts = [...profile.publicMemories, ...profile.cloneReceipts]
    .filter((receipt) => {
      if (seenReceiptIds.has(receipt.id)) return false;
      seenReceiptIds.add(receipt.id);
      return true;
    })
    .slice(0, 12);

  const walrusBackedCount = profile.allMemoryReceipts.filter(
    (r) => r.storageStatus === "stored" && r.walrusBlobId,
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <ProfileHeader
        displayName={profile.displayName}
        handle={profile.handle}
        bio={profile.bio}
        joinedAt={profile.joinedAt}
        maturityLabel={profile.maturityLabel as CloneMaturity}
        displayLevel={profile.level}
        displayMaxLevel={profile.maxLevel}
        memoriesCount={profile.memoriesCount}
        predictionsCount={profile.predictionsCount}
        cloneMatchPercent={profile.cloneMatchPercent}
        walrusBackedCount={walrusBackedCount}
        slug={profile.slug}
        cloneMood={profile.cloneAnalytics.cloneMood}
      />

      <StatCardRow
        cloneMatchPercent={profile.cloneMatchPercent}
        memoriesCount={profile.memoriesCount}
        predictionsCount={profile.predictionsCount}
        hasDisagreement={hasBehavioralContradiction || hasCloneDisagreement}
        contradictionCount={profile.contradictionCount}
        maturityLabel={profile.maturityLabel}
        levelProgress={profile.levelProgress}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ContradictionHunterCard
          contradiction={profile.topContradiction}
          predictionsCount={profile.predictionsCount}
          className="h-full"
        />

        {profile.memoryTimeMachine ? (
          <EvolutionTeaserCard
            memoryTimeMachine={profile.memoryTimeMachine}
            memoriesCount={profile.memoriesCount}
            href={`/u/${slug}/evolution`}
          />
        ) : (
          <ProfileSection
            eyebrow="Evolution"
            title="Day 1 vs Day 7"
            description="Evolution proof unlocks after three Walrus memories are stored."
            variant="subtle"
          >
            <p className="text-sm text-muted-foreground">
              This clone hasn&apos;t reached the evolution threshold yet. Check
              back once training memories are on Walrus.
            </p>
          </ProfileSection>
        )}
      </div>

      {profile.debateHighlights.length > 0 && (
        <DebateHighlightsCard highlights={profile.debateHighlights} />
      )}

      <PublicPredictionHistory
        items={profile.predictionHistory}
        fanName={profile.displayName}
      />

      <ProfileSection
        eyebrow="Receipts"
        title="Memory receipts"
        description="Public memories and clone evidence used in predictions."
      >
        {allReceipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hoolclone-green-200 bg-hoolclone-green-50/30 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No public memory receipts yet. Memories marked public on the
              Memory page will appear here.
            </p>
          </div>
        ) : (
          <PublicReceiptGrid receipts={allReceipts} />
        )}
      </ProfileSection>

      {profile.comparisons.length > 0 ? (
        <ProfileSection
          eyebrow="Head to head"
          title="Fan vs clone picks"
          description="Recent matchups where fan and clone locked different scores."
        >
          <PredictionComparisonTable comparisons={profile.comparisons} bare />
        </ProfileSection>
      ) : null}

      <ProfileAnalyticsAccordion>
        <ContradictionScoreCard
          contradictions={profile.cloneAnalytics.temporalContradictions}
          consistencyScore={profile.cloneAnalytics.consistencyScore}
          totalCount={
            profile.cloneAnalytics.temporalContradictions.length +
            profile.contradictionCount
          }
          roastLine={profile.topContradiction?.text}
        />

        <CloneDriftChart data={profile.cloneAnalytics.driftSeries} />

        <div className="grid gap-6 lg:grid-cols-2">
          <BiasRadarChart
            data={profile.biasRadar}
            title="Bias radar"
            description="Computed from predictions, Walrus memories, and clone picks."
            showStats={false}
          />
          <EvolutionTimeline events={profile.evolutionTimeline} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AccuracyLeaderboardCard
            data={profile.cloneAnalytics.accuracyLeaderboard}
          />
          <div className="flex items-center justify-center">
            <SeasonReportCard report={profile.cloneAnalytics.seasonReport} />
          </div>
        </div>
      </ProfileAnalyticsAccordion>

      <footer className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 bg-muted/20 py-6 text-center text-sm text-muted-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOOLCLONE_LOGO_SRC}
          alt=""
          className="h-6 w-6 rounded object-cover"
        />
        <p>Powered by Walrus Memory</p>
        <p className="text-xs">Private memory · Public insights</p>
      </footer>
    </div>
  );
}
