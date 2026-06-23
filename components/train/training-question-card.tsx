"use client";

import { Textarea } from "@/components/ui/textarea";
import { DriverChipGroup } from "./driver-chip-group";
import { DRIVER_LABELS } from "./driver-labels";
import type { DriverChip, TrainingQuestion } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type TrainingQuestionCardProps = {
  question: TrainingQuestion;
  questionNumber: number;
  answer: string;
  driver: DriverChip;
  onAnswerChange: (value: string) => void;
  onDriverChange: (driver: DriverChip) => void;
  disabled?: boolean;
  saved?: boolean;
};

export function TrainingQuestionCard({
  question,
  questionNumber,
  answer,
  driver,
  onAnswerChange,
  onDriverChange,
  disabled,
  saved,
}: TrainingQuestionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div
        className="pointer-events-none absolute right-4 top-4 text-[120px] opacity-[0.03]"
        aria-hidden
      >
        ⚽
      </div>

      <div className="relative space-y-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hoolclone-green-900 text-sm font-bold text-white">
            Q{questionNumber}
          </span>
          <h2
            className="font-serif text-xl font-normal leading-snug sm:text-2xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            {question.question}
          </h2>
        </div>

        <div>
          {saved && answer.trim() && (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-hoolclone-green-200 bg-hoolclone-green-50/80 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-hoolclone-green-800">
                Your saved answer
              </span>
              {driver && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border/50">
                  {DRIVER_LABELS[driver]}
                </span>
              )}
            </div>
          )}
          <Textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            rows={3}
            disabled={disabled}
            aria-label={question.question}
            className={cn("resize-none", saved && answer.trim() && "border-hoolclone-green-200")}
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {answer.length}/{question.maxLength}
          </p>
        </div>

        <DriverChipGroup
          value={driver}
          onChange={onDriverChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
