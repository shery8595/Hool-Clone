"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingPanel } from "@/components/brand/hoolclone-loader";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import { MascotSpeechBubble } from "@/components/train/mascot-speech-bubble";
import { TrainingProgress } from "@/components/train/training-progress";
import { StoredMemoryBanner } from "@/components/train/stored-memory-banner";
import { TelegramConnectCard } from "@/components/telegram/telegram-connect-card";
import { TrainingQuestionCard } from "@/components/train/training-question-card";
import {
  completeOnboarding,
  fetchOnboardingQuestions,
  submitOnboardingAnswer,
  type OnboardingQuestion,
} from "@/lib/api/client";
import {
  emptyCloneMessage,
  onboardingQuestions as staticQuestions,
  trainingTip,
} from "@/lib/onboarding/questions";
import type { CloneMaturity, DriverChip } from "@/lib/mock/types";
import { useUser } from "@/components/providers/user-provider";

function toInitialQuestions(): OnboardingQuestion[] {
  return staticQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    placeholder: q.placeholder,
    maxLength: q.maxLength,
    answered: false,
  }));
}

export default function TrainPage() {
  const account = useCurrentAccount();
  const { me, loading: userLoading, refresh } = useUser();
  const canTrain = !!me || !!account?.address;
  const [questions, setQuestions] = useState<OnboardingQuestion[]>(toInitialQuestions);
  const [step, setStep] = useState(0);
  const [hydrating, setHydrating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedSummary, setStoredSummary] = useState<string | null>(null);
  const [maturity, setMaturity] = useState<CloneMaturity>("Stranger");
  const [completed, setCompleted] = useState(false);

  const question = questions[step];
  const [answer, setAnswer] = useState("");
  const [driver, setDriver] = useState<DriverChip>("vibes");

  const applyQuestionData = useCallback((data: Awaited<ReturnType<typeof fetchOnboardingQuestions>>) => {
    setQuestions(data.questions);
    setMaturity(data.maturityLabel);

    const firstUnanswered = data.questions.findIndex((q) => !q.answered);
    const startStep = firstUnanswered === -1 ? 0 : firstUnanswered;
    setStep(startStep);

    const current = data.questions[startStep];
    if (current) {
      setAnswer(current.previousAnswer ?? "");
      setDriver(current.previousDriver ?? "vibes");
    }

    if (data.answeredCount >= data.questions.length) {
      setCompleted(true);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!me?.id) {
      setHydrating(false);
      return;
    }

    let cancelled = false;
    setHydrating(true);
    setError(null);

    void fetchOnboardingQuestions()
      .then((data) => {
        if (!cancelled) applyQuestionData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load training");
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [me?.id, userLoading, applyQuestionData]);

  const handleNext = async () => {
    if (!question || !answer.trim() || !me?.id) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await submitOnboardingAnswer({
        questionId: question.id,
        answer: answer.trim(),
        driver,
      });

      setStoredSummary(result.storedSummary);
      setMaturity(result.maturityLabel);
      await refresh();

      if (step < questions.length - 1) {
        const nextStep = step + 1;
        const nextQ = questions[nextStep];
        setStep(nextStep);
        setAnswer(nextQ.previousAnswer ?? "");
        setDriver(nextQ.previousDriver ?? "vibes");
      } else {
        await completeOnboarding();
        setCompleted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (step < questions.length - 1) {
      const nextStep = step + 1;
      const nextQ = questions[nextStep];
      setStep(nextStep);
      setAnswer(nextQ.previousAnswer ?? "");
      setDriver(nextQ.previousDriver ?? "vibes");
      setStoredSummary(null);
    }
  };

  if (userLoading && !canTrain) {
    return (
      <LoadingPanel
        className="mx-auto max-w-4xl"
        label="Waking up your clone..."
      />
    );
  }

  if (!canTrain) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border bg-white p-12 text-center">
        <p className="text-muted-foreground">
          Connect your wallet to start training your clone.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <CloneAvatar size="xl" />
        <MascotSpeechBubble
          message={
            completed
              ? "Training complete. I have enough takes to start learning your chaos."
              : emptyCloneMessage
          }
        />
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <TrainingProgress
            current={completed ? questions.length : step + 1}
            total={questions.length}
            maturity={maturity}
          />

          {hydrating && (
            <p className="text-center text-xs text-muted-foreground">
              Syncing your saved answers...
            </p>
          )}

          {storedSummary && <StoredMemoryBanner summary={storedSummary} />}

          {completed ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-hoolclone-green-100/60 p-6 text-center">
                <p className="font-semibold text-hoolclone-green-900">
                  All {questions.length} questions answered
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your clone maturity is now {maturity}. Head to Memory to review
                  receipts or Predict to test your clone.
                </p>
              </div>
              <TelegramConnectCard />
            </div>
          ) : question ? (
            <>
              <TrainingQuestionCard
                question={question}
                questionNumber={step + 1}
                answer={answer}
                driver={driver}
                onAnswerChange={setAnswer}
                onDriverChange={setDriver}
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={handleSkip} disabled={submitting || hydrating}>
                  Skip
                </Button>
                <Button
                  onClick={() => void handleNext()}
                  disabled={submitting || hydrating || !answer.trim() || !me?.id}
                >
                  {submitting
                    ? "Storing memory..."
                    : step === questions.length - 1
                      ? "Finish training"
                      : "Next Question"}
                </Button>
              </div>
            </>
          ) : null}

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            ✨ {trainingTip}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
