"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Target } from "lucide-react";
import { LoadingStatus } from "@/components/brand/hoolclone-loader";
import { HumanVsClonePanel } from "@/components/clone/human-vs-clone-panel";
import { MatchBanner } from "@/components/match/match-banner";
import { PredictionForm } from "@/components/match/prediction-form";
import { CloneCorrectionPanel } from "@/components/match/clone-correction-panel";
import { ClonePredictionPanel } from "@/components/match/clone-prediction-panel";
import { WeakMemoryCloneCard } from "@/components/match/weak-memory-clone-card";
import { CloneMoodBadge } from "@/components/clone/clone-mood-badge";
import { PredictButton } from "@/components/predict/predict-button";
import { buildDashboardFallback } from "@/lib/dashboard/dashboard-fallback";
import { cacheKeys, peekCached } from "@/lib/api/data-cache";
import {
  fetchClonePredictionRaw,
  fetchDashboardRaw,
  fetchMatchPredictionRaw,
  fetchMatchRaw,
  generateClonePrediction,
  submitMatchPrediction,
} from "@/lib/api/client";
import { useCachedData } from "@/lib/hooks/use-cached-data";
import { useIntervalRefresh } from "@/lib/hooks/use-interval-refresh";
import type { EmotionState, Match, Prediction } from "@/lib/mock/types";
import { getMatch as getMockMatch } from "@/lib/mock/matches";
import { isMatchFinished, isMatchLive } from "@/lib/match-data/match-status";
import { useUser } from "@/components/providers/user-provider";

const MATCH_POLL_MS = 60_000;

type PredictMatchPageProps = {
  params: Promise<{ matchId: string }>;
};

export default function PredictMatchPage({ params }: PredictMatchPageProps) {
  const { matchId } = use(params);
  const { me, refresh: refreshMe } = useUser();

  const initialMatch =
    peekCached<Match>(cacheKeys.match(matchId)) ?? getMockMatch(matchId) ?? undefined;

  const loadMatch = useCallback(() => fetchMatchRaw(matchId), [matchId]);
  const loadPrediction = useCallback(
    () => fetchMatchPredictionRaw(matchId),
    [matchId],
  );
  const dashboardFallback = useMemo(
    () => (me ? buildDashboardFallback(me) : undefined),
    [me],
  );
  const { data: dashboardData } = useCachedData(
    me?.id ? cacheKeys.dashboard(me.id) : null,
    fetchDashboardRaw,
    dashboardFallback,
  );

  const { data: match, hydrating: matchHydrating, refresh: refreshMatch } = useCachedData(
    cacheKeys.match(matchId),
    loadMatch,
    initialMatch,
  );

  useIntervalRefresh(
    refreshMatch,
    MATCH_POLL_MS,
    Boolean(match && (isMatchLive(match) || match.status === "live")),
  );

  const { data: savedPrediction, hydrating: predHydrating } = useCachedData(
    me?.id ? cacheKeys.matchPrediction(me.id, matchId) : null,
    loadPrediction,
    null,
  );

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [trainingQuestion, setTrainingQuestion] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usingMock = matchHydrating && !!getMockMatch(matchId) && match === initialMatch;

  const loadCloneMeta = useCallback(async () => {
    if (!me?.id) return;
    const meta = await fetchClonePredictionRaw(matchId);
    if (!meta) return;
    setTrainingQuestion(meta.trainingQuestion);
  }, [matchId, me?.id, me?.profile.memoriesCount]);

  useEffect(() => {
    if (savedPrediction) {
      setPrediction(savedPrediction);
      setLocked(true);
    }
  }, [savedPrediction]);

  useEffect(() => {
    void loadCloneMeta();
  }, [loadCloneMeta]);

  useEffect(() => {
    const refreshOnFocus = () => {
      void refreshMe();
      void loadCloneMeta();
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [loadCloneMeta, refreshMe]);

  const runClonePrediction = useCallback(async () => {
    setCloneLoading(true);
    setError(null);
    try {
      const result = await generateClonePrediction(matchId);
      setTrainingQuestion(result.trainingQuestion);
      if (result.prediction) {
        setPrediction(result.prediction);
      } else if (result.clone && prediction) {
        setPrediction({
          ...prediction,
          clone: result.clone,
          agreed:
            prediction.winner === result.clone.winner &&
            prediction.homeScore === result.clone.homeScore &&
            prediction.awayScore === result.clone.awayScore,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate clone prediction",
      );
    } finally {
      setCloneLoading(false);
    }
  }, [matchId, prediction]);

  const handleSubmit = async (input: {
    winner: string;
    homeScore: number;
    awayScore: number;
    confidence: number;
    reasoning: string;
    emotion: EmotionState;
  }) => {
    if (!me) {
      setError("Connect your wallet to save predictions.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const saved = await submitMatchPrediction(matchId, input);
      setPrediction(saved);
      setLocked(true);
      await runClonePrediction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prediction");
    } finally {
      setSubmitting(false);
    }
  };

  if (!match || !match.homeTeam || !match.awayTeam) {
    if (matchHydrating) {
      return (
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-hoolclone-green-700" />
            <h1 className="text-2xl font-bold">Predict Match</h1>
          </div>
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-muted-foreground">
            <LoadingStatus label="Loading match details..." />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-6xl space-y-4 rounded-2xl border bg-white p-12 text-center">
        <p className="font-semibold">Match not available for prediction</p>
        <p className="text-sm text-muted-foreground">
          Knockout placeholders unlock once both teams are known.
        </p>
      </div>
    );
  }

  const defaultPrediction = prediction ?? {
    matchId: match.id,
    winner: match.homeTeam.code,
    homeScore: 1,
    awayScore: 0,
    confidence: 65,
    reasoning: "",
    emotion: "hyped" as const,
  };

  const memoriesCount = me?.profile.memoriesCount ?? 0;
  const stillNeedsTraining = memoriesCount < 3;
  const showWeakMemory = locked && Boolean(trainingQuestion) && stillNeedsTraining;
  const showTrainedSuccess =
    locked && Boolean(trainingQuestion) && !stillNeedsTraining;
  const showClonePanel =
    locked && prediction?.clone && !trainingQuestion && !showTrainedSuccess;
  const showCorrection =
    showClonePanel &&
    prediction?.clone &&
    prediction.agreed === false &&
    !usingMock;
  const matchFinished = isMatchFinished(match);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Target className="h-6 w-6 text-hoolclone-green-700" />
        <h1 className="text-2xl font-bold">Predict Match</h1>
        {dashboardData?.cloneAnalytics.cloneMood && (
          <CloneMoodBadge
            mood={dashboardData.cloneAnalytics.cloneMood}
            compact
          />
        )}
        {(matchHydrating || predHydrating) && (
          <span className="text-xs text-muted-foreground">Syncing...</span>
        )}
      </div>

      {usingMock && (
        <p className="text-sm text-amber-700">
          Showing schedule preview — syncing live match data...
        </p>
      )}

      <MatchBanner match={match} />

      {matchFinished && !locked && (
        <p className="rounded-2xl border border-muted bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          This match has ended — predictions are closed. View your saved pick below if you predicted before kickoff.
        </p>
      )}

      {locked && prediction?.clone && (
        <HumanVsClonePanel match={match} prediction={prediction} />
      )}

      {showCorrection && prediction.clone && (
        <CloneCorrectionPanel
          match={match}
          prediction={prediction}
          clone={prediction.clone}
          onCorrected={({ prediction: next, agreed }) => {
            if (next) {
              setPrediction(next);
            } else if (agreed !== undefined) {
              setPrediction((prev) => (prev ? { ...prev, agreed } : prev));
            }
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PredictionForm
          match={match}
          initialWinner={defaultPrediction.winner}
          initialHomeScore={defaultPrediction.homeScore}
          initialAwayScore={defaultPrediction.awayScore}
          initialConfidence={defaultPrediction.confidence}
          initialReasoning={defaultPrediction.reasoning}
          initialEmotion={defaultPrediction.emotion}
          locked={locked || matchFinished}
          submitting={submitting}
          onSubmit={handleSubmit}
        />

        {cloneLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center text-muted-foreground">
            <LoadingStatus label="Your clone is thinking..." className="py-4" />
          </div>
        ) : showClonePanel && prediction.clone ? (
          <ClonePredictionPanel
            match={match}
            clone={prediction.clone}
            maturity={me?.profile.cloneMaturityLabel}
          />
        ) : showTrainedSuccess && trainingQuestion ? (
          <WeakMemoryCloneCard
            trainingQuestion={trainingQuestion}
            variant="trained"
            memoriesCount={memoriesCount}
            regenerating={cloneLoading}
            onRegenerate={() => void runClonePrediction()}
          />
        ) : showWeakMemory && trainingQuestion ? (
          <WeakMemoryCloneCard
            trainingQuestion={trainingQuestion}
            reasoning={prediction?.clone?.reasoning}
          />
        ) : locked ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-white p-8 text-center text-muted-foreground">
            <p>Clone prediction not generated yet.</p>
            {!usingMock && (
              <PredictButton
                type="button"
                variant="ghost"
                onClick={() => void runClonePrediction()}
              >
                Generate clone prediction
              </PredictButton>
            )}
          </div>
        ) : (
          <div className="hidden items-center justify-center rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-muted-foreground lg:flex">
            Lock in your prediction to see your clone&apos;s take.
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
