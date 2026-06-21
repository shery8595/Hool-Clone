import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { CloneClashCta } from "@/components/clone/clone-clash-cta";
import { CloneSameQuestionProof } from "@/components/clone/clone-same-question-proof";
import { CorrectionOverrideProof } from "@/components/clone/correction-override-proof";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import {
  EvolutionStakesHero,
  evolutionMatchFromTimeMachine,
} from "@/components/clone/evolution-stakes-hero";
import { EvolutionAnalyticsAccordion } from "@/components/clone/evolution-analytics-accordion";
import { MemoryProvenancePanel } from "@/components/clone/memory-provenance-panel";
import { RoastRecordSection } from "@/components/clone/roast-record-section";
import {
  buildCorrectionOverrideFromProfile,
  buildRoastRecordFromProfile,
  buildSameQuestionProofFromTimeMachine,
  collectCitedMemoryIds,
  STATIC_CORRECTION_OVERRIDE_PROOF,
} from "@/lib/clone/judge-proof-demo";
import { CloneBeforeAfterPanel } from "@/components/clone/clone-before-after-panel";
import { ContradictionScoreCard } from "@/components/clone/contradiction-score-card";
import { MemoryTimeMachine } from "@/components/clone/memory-time-machine";
import { CloneDriftChart } from "@/components/charts/clone-drift-chart";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SeasonReportCard } from "@/components/profile/season-report-card";
import { getPublicProfileBySlug } from "@/lib/db/public-profile";
import { DEMO_NAMESPACE } from "@/lib/landing/content";
import type { CloneMaturity } from "@/lib/mock/types";

export const dynamic = "force-dynamic";

type EvolutionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: EvolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return { title: "Evolution not found · HoolClone" };
  return {
    title: `${profile.displayName}'s Clone Evolution · HoolClone`,
    description:
      "Day 1 vs Day 4 clone evolution — memory receipts, contradictions, and drift.",
  };
}

export default async function EvolutionPage({ params }: EvolutionPageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  const { cloneAnalytics, memoryTimeMachine, allMemoryReceipts } = profile;
  const totalContradictions =
    cloneAnalytics.temporalContradictions.length +
    profile.contradictionCount;

  const clashOpponent =
    slug === "hoolclone-demo"
      ? "hoolclone-rival"
      : slug === "hoolclone-rival"
        ? "hoolclone-demo"
        : "hoolclone-demo";

  const sameQuestionResult = buildSameQuestionProofFromTimeMachine(
    memoryTimeMachine,
    { slug, memories: allMemoryReceipts },
  );

  const correctionResult =
    buildCorrectionOverrideFromProfile(
      allMemoryReceipts,
      memoryTimeMachine,
    ) ?? {
      data: STATIC_CORRECTION_OVERRIDE_PROOF,
      source: "fallback" as const,
    };

  const citedMemoryIds = collectCitedMemoryIds(
    sameQuestionResult.data,
    correctionResult.data,
  );

  const roastRecord = buildRoastRecordFromProfile(allMemoryReceipts);
  const matchInfo = evolutionMatchFromTimeMachine(memoryTimeMachine);
  const namespace =
    allMemoryReceipts[0]?.walrusNamespace ??
    (slug === "hoolclone-demo" ? DEMO_NAMESPACE : undefined);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href={`/u/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-hoolclone-green-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <ProfileHeader
        displayName={profile.displayName}
        handle={profile.handle}
        bio={profile.bio}
        joinedAt={profile.joinedAt}
        maturityLabel={profile.maturityLabel as CloneMaturity}
        level={profile.level}
        slug={profile.slug}
        activeTab="evolution"
        clashOpponent={clashOpponent}
      />

      <EvolutionStakesHero
        matchLabel={matchInfo.matchLabel}
        matchId={matchInfo.matchId ?? "m071"}
        cloneAccuracy={cloneAnalytics.accuracyLeaderboard.cloneAccuracy}
        resolvedCount={cloneAnalytics.accuracyLeaderboard.resolvedCount}
      />

      <section className="rounded-2xl border bg-gradient-to-br from-hoolclone-green-50 to-white p-6">
        <h2 className="text-lg font-bold">Memory Evolution Timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Day 1 vs Day 4 clone — Portugal loyalty fan with Walrus-backed
          memories across onboarding, debate, correction, and prediction.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <EvolutionDayCard
            label="Day 1 Clone"
            snapshot={cloneAnalytics.day1Snapshot}
          />
          <EvolutionDayCard
            label="Day 4 Clone"
            snapshot={cloneAnalytics.day4Snapshot}
            highlight
          />
        </div>
      </section>

      <MemoryProvenancePanel
        memories={allMemoryReceipts}
        namespace={namespace}
        citedMemoryIds={citedMemoryIds}
      />

      <CloneSameQuestionProof
        data={sameQuestionResult.data}
        dataSource={sameQuestionResult.source}
      />

      <CorrectionOverrideProof
        data={correctionResult.data}
        dataSource={correctionResult.source}
      />

      {roastRecord && <RoastRecordSection data={roastRecord} />}

      <CloneClashCta slug={slug} opponentSlug={clashOpponent} />

      {cloneAnalytics.cloneMood && (
        <CloneMoodBadge mood={cloneAnalytics.cloneMood} />
      )}

      <EvolutionAnalyticsAccordion>
        {memoryTimeMachine && (
          <>
            <CloneBeforeAfterPanel
              data={memoryTimeMachine}
              comparePhase="day4"
            />
            <MemoryTimeMachine data={memoryTimeMachine} />
          </>
        )}

        <ContradictionScoreCard
          contradictions={cloneAnalytics.temporalContradictions}
          consistencyScore={cloneAnalytics.consistencyScore}
          totalCount={totalContradictions}
          roastLine={profile.topContradiction?.text}
        />

        <CloneDriftChart data={cloneAnalytics.driftSeries} />

        <div className="grid gap-6 lg:grid-cols-2">
          <AccuracyLeaderboardCard data={cloneAnalytics.accuracyLeaderboard} />
          <div className="flex items-center justify-center">
            <SeasonReportCard report={cloneAnalytics.seasonReport} />
          </div>
        </div>
      </EvolutionAnalyticsAccordion>
    </div>
  );
}

function EvolutionDayCard({
  label,
  snapshot,
  highlight = false,
}: {
  label: string;
  snapshot: {
    confidence: number;
    bullets: string[];
    maturityLabel: string;
    reflection?: string;
  };
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-hoolclone-yellow-300 bg-hoolclone-yellow-50/50 p-5"
          : "rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-5"
      }
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-hoolclone-green-900">
        Confidence: {snapshot.confidence}%
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{snapshot.maturityLabel}</p>
      {snapshot.reflection && (
        <p className="mt-3 text-sm italic leading-relaxed text-foreground/80">
          &ldquo;{snapshot.reflection}&rdquo;
        </p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {snapshot.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-muted-foreground">
            <span className="text-hoolclone-green-700">−</span>
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
