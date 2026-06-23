"use client";

import { Check, Pencil } from "lucide-react";
import type { OnboardingQuestion } from "@/lib/api/client";
import { DRIVER_LABELS } from "@/components/train/driver-labels";
import { cn } from "@/lib/utils";

type TrainingAnswersReviewProps = {
  questions: OnboardingQuestion[];
  onEditQuestion?: (index: number) => void;
  excludeQuestionId?: string;
  className?: string;
};

export function TrainingAnswersReview({
  questions,
  onEditQuestion,
  excludeQuestionId,
  className,
}: TrainingAnswersReviewProps) {
  const answered = questions.filter(
    (q) =>
      q.id !== excludeQuestionId &&
      q.answered &&
      q.previousAnswer?.trim(),
  );

  if (answered.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-hoolclone-green-900">
          Your training answers
        </h3>
        <span className="rounded-full bg-hoolclone-green-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-800">
          {answered.length} saved
        </span>
      </div>

      <ul className="space-y-3">
        {questions.map((q, index) => {
          if (
            q.id === excludeQuestionId ||
            !q.answered ||
            !q.previousAnswer?.trim()
          ) {
            return null;
          }

          return (
            <li
              key={q.id}
              className="rounded-xl border border-hoolclone-green-100 bg-hoolclone-green-50/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hoolclone-green-900 text-xs font-bold text-white">
                      Q{index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-hoolclone-green-800">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                    {q.previousDriver && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border/60">
                        {DRIVER_LABELS[q.previousDriver]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug text-hoolclone-gray-900">
                    {q.question}
                  </p>
                  <blockquote className="border-l-[3px] border-hoolclone-green-600 pl-3 text-sm leading-relaxed text-foreground">
                    &ldquo;{q.previousAnswer}&rdquo;
                  </blockquote>
                </div>
                {onEditQuestion && (
                  <button
                    type="button"
                    onClick={() => onEditQuestion(index)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-hoolclone-green-900 transition hover:bg-hoolclone-green-50"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
