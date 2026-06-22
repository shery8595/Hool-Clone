import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContradictionHunterCard } from "@/components/clone/contradiction-hunter-card";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { EvolutionTeaserCard } from "@/components/evolution/evolution-teaser-card";
import { DebateHighlightsCard } from "@/components/profile/debate-highlights-card";
import { ProfileHeader } from "@/components/profile/profile-header";
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

  const clashOpponent =
    slug === "hoolclone-demo"
      ? "hoolclone-rival"
      : slug === "hoolclone-rival"
        ? "hoolclone-demo"
        : "hoolclone-demo";

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ProfileHeader
        displayName={profile.displayName}
        handle={profile.handle}
        bio={profile.bio}
        joinedAt={profile.joinedAt}
        maturityLabel={profile.maturityLabel as CloneMaturity}
        level={profile.level}
        slug={profile.slug}
        clashOpponent={clashOpponent}
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

      <ContradictionHunterCard
        contradiction={profile.topContradiction}
        predictionsCount={profile.predictionsCount}
      />

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

      {profile.memoryTimeMachine && (
        <EvolutionTeaserCard
          memoryTimeMachine={profile.memoryTimeMachine}
          memoriesCount={profile.memoriesCount}
          href={`/u/${slug}/evolution`}
        />
      )}

      {profile.debateHighlights.length > 0 && (
        <DebateHighlightsCard highlights={profile.debateHighlights} />
      )}

      <PublicPredictionHistory
        items={profile.predictionHistory}
        fanName={profile.displayName}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <BiasRadarChart
          data={profile.biasRadar}
          title="Bias Radar"
          description="Computed from real predictions, Walrus memories, and clone picks."
          showStats={false}
        />
        <EvolutionTimeline events={profile.evolutionTimeline} />
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Memory receipts</h2>
          <p className="text-sm text-muted-foreground">
            Public memories and clone evidence used in predictions.
          </p>
        </div>
        {allReceipts.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
            No public memory receipts yet. Memories marked public in the Memory
            page will appear here.
          </p>
        ) : (
          <PublicReceiptGrid receipts={allReceipts} />
        )}
      </section>

      {profile.comparisons.length > 0 ? (
        <PredictionComparisonTable comparisons={profile.comparisons} />
      ) : (
        <p className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
          No prediction comparisons yet.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AccuracyLeaderboardCard
          data={profile.cloneAnalytics.accuracyLeaderboard}
        />
        <div className="flex items-center justify-center">
          <SeasonReportCard report={profile.cloneAnalytics.seasonReport} />
        </div>
      </div>

      <footer className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HOOLCLONE_LOGO_SRC} alt="" className="h-5 w-5 rounded object-cover" />
        Powered by Walrus Memory · Private memory. Public insights.
      </footer>
    </div>
  );
}
