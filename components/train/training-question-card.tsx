"use client";

import { Textarea } from "@/components/ui/textarea";
import { DriverChipGroup } from "./driver-chip-group";
import type { DriverChip, TrainingQuestion } from "@/lib/mock/types";

type TrainingQuestionCardProps = {
  question: TrainingQuestion;
  questionNumber: number;
  answer: string;
  driver: DriverChip;
  onAnswerChange: (value: string) => void;
  onDriverChange: (driver: DriverChip) => void;
  disabled?: boolean;
};

export function TrainingQuestionCard({
  question,
  questionNumber,
  answer,
  driver,
  onAnswerChange,
  onDriverChange,
  disabled,
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
          <Textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            rows={3}
            disabled={disabled}
            aria-label={question.question}
            className="resize-none"
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
