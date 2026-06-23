import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { CloneClashCta } from "@/components/clone/clone-clash-cta";
import { CloneSameQuestionProof } from "@/components/clone/clone-same-question-proof";
import { CorrectionOverrideProof } from "@/components/clone/correction-override-proof";
import { EvolutionStakesHero } from "@/components/clone/evolution-stakes-hero";
import { evolutionMatchFromTimeMachine } from "@/lib/clone/evolution-match";
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
import { EvolutionPageHeader } from "@/components/evolution/evolution-page-header";
import { EvolutionChatShowcase } from "@/components/evolution/evolution-chat-showcase";
import { EvolutionSection } from "@/components/evolution/evolution-section";
import { SeasonReportCard } from "@/components/profile/season-report-card";
import { DEMO_NAMESPACE } from "@/lib/landing/content";
import { computeMaturityProgress } from "@/lib/auth/maturity";
import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { EvolutionPageData } from "@/lib/evolution/types";
import { ButtonLink } from "@/components/ui/button-link";
import { TextWithTeamFlags } from "@/components/match/team-label-with-flags";
import { cn } from "@/lib/utils";

type EvolutionProofPageProps = {
  data: EvolutionPageData;
  comparePhase?: TimeMachinePhaseId;
  showBackLink?: boolean;
};

function parseComparePhase(
  value: string | undefined,
): TimeMachinePhaseId {
  if (value === "day3" || value === "day4" || value === "day7") return value;
  return "day7";
}

export function EvolutionProofPage({
  data,
  comparePhase: comparePhaseProp,
  showBackLink = true,
}: EvolutionProofPageProps) {
  const comparePhase = comparePhaseProp ?? "day7";
  const {
    slug,
    displayName,
    handle,
    joinedAt,
    maturityLabel,
    cloneAnalytics,
    memoryTimeMachine,
    allMemoryReceipts,
    contradictionCount,
    topContradiction,
    walrusNamespace,
    isPublicView,
  } = data;

  const totalContradictions =
    cloneAnalytics.temporalContradictions.length + contradictionCount;

  const sameQuestionResult = buildSameQuestionProofFromTimeMachine(
    memoryTimeMachine,
    { slug, memories: allMemoryReceipts },
  );

  const correctionResult =
    buildCorrectionOverrideFromProfile(allMemoryReceipts, memoryTimeMachine) ?? {
      data: STATIC_CORRECTION_OVERRIDE_PROOF,
      source: "fallback" as const,
    };

  const citedMemoryIds = collectCitedMemoryIds(
    sameQuestionResult.data,
    correctionResult.data,
  );

  const day7Phase = memoryTimeMachine?.phases.find((phase) => phase.id === "day7");
  const day7Snapshot = day7Phase
    ? {
        confidence: day7Phase.confidence,
        bullets: day7Phase.knowledgeBullets,
        maturityLabel: day7Phase.maturityLabel,
        reflection: day7Phase.reasoning,
      }
    : cloneAnalytics.day4Snapshot;
  const roastRecord = buildRoastRecordFromProfile(allMemoryReceipts);
  const matchInfo = evolutionMatchFromTimeMachine(memoryTimeMachine);
  const namespace =
    walrusNamespace ??
    allMemoryReceipts[0]?.walrusNamespace ??
    (slug === "hoolclone-demo" ? DEMO_NAMESPACE : undefined);

  const maturity = computeMaturityProgress(allMemoryReceipts.length);
  const day1Phase = memoryTimeMachine?.phases.find((p) => p.id === "day1");
  const confidenceDelta =
    day1Phase && day7Phase
      ? day7Phase.confidence - day1Phase.confidence
      : null;
  const walrusBackedCount = allMemoryReceipts.filter(
    (r) => r.storageStatus === "stored" && r.walrusBlobId,
  ).length;

  const backHref = isPublicView ? `/u/${slug}` : "/dashboard";

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      {showBackLink && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-sm font-semibold text-hoolclone-green-800 shadow-sm transition hover:bg-hoolclone-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {isPublicView ? "Back to profile" : "Back to dashboard"}
        </Link>
      )}

      <EvolutionPageHeader
        displayName={displayName}
        handle={handle}
        joinedAt={joinedAt}
        maturityLabel={maturityLabel}
        displayLevel={maturity.displayLevel}
        displayMaxLevel={maturity.displayMaxLevel}
        memoriesCount={allMemoryReceipts.length}
        walrusBackedCount={walrusBackedCount}
        confidenceDelta={confidenceDelta}
        matchLabel={matchInfo.matchLabel ?? null}
        slug={slug}
        isPublicView={isPublicView}
        cloneMood={cloneAnalytics.cloneMood}
      />

      <EvolutionStakesHero
        matchLabel={matchInfo.matchLabel}
        matchId={matchInfo.matchId ?? "m071"}
        cloneAccuracy={cloneAnalytics.accuracyLeaderboard.cloneAccuracy}
        resolvedCount={cloneAnalytics.accuracyLeaderboard.resolvedCount}
      />

      {memoryTimeMachine ? (
        <>
          <CloneBeforeAfterPanel
            data={memoryTimeMachine}
            comparePhase={comparePhase}
          />
          <MemoryTimeMachine data={memoryTimeMachine} />
          <EvolutionChatShowcase
            allMemoryReceipts={allMemoryReceipts}
            memoryTimeMachine={memoryTimeMachine}
          />
        </>
      ) : (
        <>
          <EvolutionEmptyState />
          <EvolutionChatShowcase
            allMemoryReceipts={allMemoryReceipts}
            memoryTimeMachine={null}
          />
        </>
      )}

      <EvolutionSection
        eyebrow="Timeline"
        title="Memory evolution snapshot"
        description="Day 1 vs Day 7 — how Walrus-backed memories reshape the same matchup pick."
        variant="highlight"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <EvolutionDayCard
            label="Day 1 Clone"
            snapshot={cloneAnalytics.day1Snapshot}
          />
          <EvolutionDayCard
            label="Day 7 Clone"
            snapshot={day7Snapshot}
            highlight
          />
        </div>
      </EvolutionSection>

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

      {isPublicView && (
        <CloneClashCta slug={slug} />
      )}

      <EvolutionAnalyticsAccordion>
        <ContradictionScoreCard
          contradictions={cloneAnalytics.temporalContradictions}
          consistencyScore={cloneAnalytics.consistencyScore}
          totalCount={totalContradictions}
          roastLine={topContradiction?.text}
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

export { parseComparePhase };

function EvolutionEmptyState() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-dashed border-hoolclone-green-200 bg-gradient-to-br from-hoolclone-green-50/50 via-white to-hoolclone-yellow-50/30 p-8 text-center">
      <Brain className="mx-auto h-10 w-10 text-hoolclone-green-700" />
      <h2 className="mt-4 text-lg font-semibold text-hoolclone-green-950">
        Evolution unlocks after training
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Store at least three Walrus memories so the clone can show a Day 1 vs
        Day 7 before/after on the same matchup.
      </p>
      <ButtonLink href="/train" className="mt-5" size="sm">
        Train your clone
      </ButtonLink>
    </section>
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
      className={cn(
        "rounded-xl border p-5 transition-shadow",
        highlight
          ? "border-hoolclone-yellow-300/80 bg-gradient-to-br from-hoolclone-yellow-50/60 to-white shadow-sm"
          : "border-dashed border-muted-foreground/25 bg-muted/15",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-hoolclone-green-900">
        {snapshot.confidence}%
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        Confidence · {snapshot.maturityLabel}
      </p>
      {snapshot.reflection && (
        <p className="mt-3 border-l-2 border-hoolclone-green-600/40 pl-3 text-sm italic leading-relaxed text-foreground/80">
          &ldquo;
          <TextWithTeamFlags text={snapshot.reflection} size="sm" />
          &rdquo;
        </p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {snapshot.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2 text-muted-foreground">
            <span className="font-bold text-hoolclone-green-700">·</span>
            <TextWithTeamFlags text={bullet} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
