import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";
import { AccuracyLeaderboardCard } from "@/components/clone/accuracy-leaderboard";
import { CloneClashCta } from "@/components/clone/clone-clash-cta";
import { CloneSameQuestionProof } from "@/components/clone/clone-same-question-proof";
import { CorrectionOverrideProof } from "@/components/clone/correction-override-proof";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
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
import { SeasonReportCard } from "@/components/profile/season-report-card";
import { DEMO_NAMESPACE } from "@/lib/landing/content";
import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { EvolutionPageData } from "@/lib/evolution/types";
import { ButtonLink } from "@/components/ui/button-link";

type EvolutionProofPageProps = {
  data: EvolutionPageData;
  comparePhase?: TimeMachinePhaseId;
  showBackLink?: boolean;
};

function resolveClashOpponent(slug: string): string {
  if (slug === "hoolclone-demo") return "hoolclone-rival";
  if (slug === "hoolclone-rival") return "hoolclone-demo";
  return "hoolclone-demo";
}

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
    level,
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
  const clashOpponent = resolveClashOpponent(slug);

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

  const backHref = isPublicView ? `/u/${slug}` : "/dashboard";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {showBackLink && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-hoolclone-green-800 hover:underline"
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
        level={level}
        slug={slug}
        isPublicView={isPublicView}
        clashOpponent={clashOpponent}
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

      <section className="rounded-2xl border bg-gradient-to-br from-hoolclone-green-50 to-white p-6">
        <h2 className="text-lg font-bold">Memory Evolution Timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Day 1 vs Day 7 clone — how Walrus-backed memories across onboarding,
          debate, correction, and prediction reshape the same matchup pick.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

      {isPublicView && (
        <CloneClashCta slug={slug} opponentSlug={clashOpponent} />
      )}

      {cloneAnalytics.cloneMood && (
        <CloneMoodBadge mood={cloneAnalytics.cloneMood} />
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
    <section className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
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
