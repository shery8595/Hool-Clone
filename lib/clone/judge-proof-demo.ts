import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";

export const JUDGE_PROOF_QUESTION =
  "Who wins Portugal vs Colombia — and why?";

export type SameQuestionProofData = {
  question: string;
  day1: {
    label: string;
    answer: string;
    confidence: number;
    reasoning: string;
  };
  day4: {
    label: string;
    answer: string;
    confidence: number;
    reasoning: string;
    citedReceipt: {
      text: string;
      provenanceLabel: string;
      walrusBacked: boolean;
    };
  };
};

export type CorrectionOverrideProofData = {
  matchLabel: string;
  staleTake: {
    prediction: string;
    reasoning: string;
    disputedMemory: string;
    disputedLabel: string;
  };
  userCorrection: string;
  updatedTake: {
    prediction: string;
    reasoning: string;
    citedReceipt: {
      text: string;
      provenanceLabel: string;
      walrusBacked: boolean;
    };
  };
};

export const STATIC_SAME_QUESTION_PROOF: SameQuestionProofData = {
  question: JUDGE_PROOF_QUESTION,
  day1: {
    label: "Day 1 · Stranger clone",
    answer: "Draw 1-1",
    confidence: 28,
    reasoning:
      "I barely know you yet — this is a generic read with no Walrus receipts. Could go either way.",
  },
  day4: {
    label: "Day 4 · Imitator clone",
    answer: "Portugal 2-1",
    confidence: 68,
    reasoning:
      "You corrected me on Portugal — loyalty beats spreadsheets in tight games. I remember your take and ride Portugal here.",
    citedReceipt: {
      text: "User correction: I do trust Portugal in tight games — loyalty matters more than xG.",
      provenanceLabel: "Your correction · 8 days ago",
      walrusBacked: true,
    },
  },
};

export const STATIC_CORRECTION_OVERRIDE_PROOF: CorrectionOverrideProofData = {
  matchLabel: "Portugal vs Colombia",
  staleTake: {
    prediction: "Draw 1-1",
    reasoning:
      "Portugal struggle when Ronaldo is isolated — the xG chart says this stays tight.",
    disputedMemory:
      "I said Portugal would struggle if Ronaldo is isolated — still believe it.",
    disputedLabel: "Stale stats take · 9 days ago",
  },
  userCorrection:
    "I trust Portugal in tight games — loyalty matters more than xG.",
  updatedTake: {
    prediction: "Portugal 2-1",
    reasoning:
      "Your correction overrides the old stats bias. You pick Portugal with heart in group games — I cite that Walrus memory now.",
    citedReceipt: {
      text: "User correction: I do trust Portugal in tight games — loyalty matters more than xG.",
      provenanceLabel: "Your correction · highest rerank weight",
      walrusBacked: true,
    },
  },
};

export function buildSameQuestionProofFromTimeMachine(
  machine: MemoryTimeMachine | null,
): SameQuestionProofData {
  if (!machine) return STATIC_SAME_QUESTION_PROOF;

  const day1 = machine.phases.find((p) => p.id === "day1");
  const day4 = machine.phases.find((p) => p.id === "day4");
  const cited = day4?.receipts.find((r) => r.walrusBacked) ?? day4?.receipts[0];

  if (!day1 || !day4) return STATIC_SAME_QUESTION_PROOF;

  return {
    question: `${JUDGE_PROOF_QUESTION.split("—")[0].trim()} (${machine.matchLabel})?`,
    day1: {
      label: "Day 1 · Stranger clone",
      answer: day1.prediction,
      confidence: day1.confidence,
      reasoning: day1.reasoning,
    },
    day4: {
      label: "Day 4 · Imitator clone",
      answer: day4.prediction,
      confidence: day4.confidence,
      reasoning: day4.reasoning,
      citedReceipt: cited
        ? {
            text: cited.summary,
            provenanceLabel: cited.walrusBacked
              ? "Walrus memory · cited in reasoning"
              : "Memory shaping this take",
            walrusBacked: Boolean(cited.walrusBacked),
          }
        : STATIC_SAME_QUESTION_PROOF.day4.citedReceipt,
    },
  };
}
