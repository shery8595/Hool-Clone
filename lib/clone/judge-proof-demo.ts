import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import { formatProvenanceLabel } from "@/lib/clone/memory-provenance";
import type { MemoryReceipt } from "@/lib/mock/types";
import { isPlaceholderBlobId } from "@/lib/walrus/fetch-blob";

export const JUDGE_PROOF_QUESTION =
  "Who wins Portugal vs Colombia — and why?";

export type CitedReceiptProof = {
  text: string;
  provenanceLabel: string;
  walrusBacked: boolean;
  walrusBlobId?: string;
  memoryId?: string;
};

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
    citedReceipt: CitedReceiptProof;
  };
};

export type CorrectionOverrideProofData = {
  matchLabel: string;
  staleTake: {
    prediction: string;
    reasoning: string;
    disputedMemory: string;
    disputedLabel: string;
    walrusBlobId?: string;
  };
  userCorrection: string;
  correctionBlobId?: string;
  updatedTake: {
    prediction: string;
    reasoning: string;
    citedReceipt: CitedReceiptProof;
  };
};

export type ProofBuildResult<T> = {
  data: T;
  source: "live" | "fallback";
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

function receiptIsWalrusBacked(receipt: MemoryReceipt): boolean {
  return Boolean(
    receipt.walrusBlobId &&
      !isPlaceholderBlobId(receipt.walrusBlobId) &&
      receipt.storageStatus === "stored",
  );
}

function findCorrectionMemory(memories: MemoryReceipt[]): MemoryReceipt | null {
  const corrections = memories.filter(
    (m) =>
      m.text.toLowerCase().includes("user correction") ||
      m.text.toLowerCase().startsWith("user correction"),
  );
  return (
    corrections.find((m) => receiptIsWalrusBacked(m)) ??
    corrections[0] ??
    null
  );
}

function findStaleMemory(
  memories: MemoryReceipt[],
  correction: MemoryReceipt,
): MemoryReceipt | null {
  const correctionDate = new Date(correction.date).getTime();
  const portugalMemories = memories.filter(
    (m) =>
      m.text.toLowerCase().includes("portugal") &&
      m.id !== correction.id &&
      new Date(m.date).getTime() < correctionDate,
  );
  return (
    portugalMemories.find((m) => m.text.toLowerCase().includes("struggle")) ??
    portugalMemories[portugalMemories.length - 1] ??
    null
  );
}

export function buildSameQuestionProofFromTimeMachine(
  machine: MemoryTimeMachine | null,
  options?: { slug?: string; memories?: MemoryReceipt[] },
): ProofBuildResult<SameQuestionProofData> {
  const slug = options?.slug;
  const memories = options?.memories ?? [];

  if (!machine) {
    if (slug === "hoolclone-demo") {
      return { data: STATIC_SAME_QUESTION_PROOF, source: "fallback" };
    }
    return { data: STATIC_SAME_QUESTION_PROOF, source: "fallback" };
  }

  const day1 = machine.phases.find((p) => p.id === "day1");
  const day4 = machine.phases.find((p) => p.id === "day4");
  const citedFromPhase =
    day4?.receipts.find((r) => r.walrusBacked) ?? day4?.receipts[0];

  if (!day1 || !day4) {
    return { data: STATIC_SAME_QUESTION_PROOF, source: "fallback" };
  }

  const correctionMemory = findCorrectionMemory(memories);
  const citedBlobId =
    correctionMemory?.walrusBlobId ??
    memories.find((m) => m.text === citedFromPhase?.summary)?.walrusBlobId;

  const citedText = correctionMemory?.text ?? citedFromPhase?.summary ?? "";
  const citedWalrusBacked = correctionMemory
    ? receiptIsWalrusBacked(correctionMemory)
    : Boolean(citedFromPhase?.walrusBacked);

  const source =
    citedWalrusBacked && !isPlaceholderBlobId(citedBlobId ?? "")
      ? "live"
      : "fallback";

  return {
    source,
    data: {
      question: machine.matchLabel
        ? `Who wins ${machine.matchLabel} — and why?`
        : JUDGE_PROOF_QUESTION,
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
        citedReceipt: citedText
          ? {
              text: citedText,
              provenanceLabel: correctionMemory
                ? formatProvenanceLabel("correction", correctionMemory.date) ??
                  "Your correction · Walrus memory"
                : citedFromPhase?.walrusBacked
                  ? "Walrus memory · cited in reasoning"
                  : "Memory shaping this take",
              walrusBacked: citedWalrusBacked,
              walrusBlobId: citedBlobId,
              memoryId: correctionMemory?.id,
            }
          : STATIC_SAME_QUESTION_PROOF.day4.citedReceipt,
      },
    },
  };
}

export function buildCorrectionOverrideFromProfile(
  memories: MemoryReceipt[],
  machine: MemoryTimeMachine | null,
): ProofBuildResult<CorrectionOverrideProofData> | null {
  const correction = findCorrectionMemory(memories);
  if (!correction) return null;

  const stale = findStaleMemory(memories, correction);
  const day4 = machine?.phases.find((p) => p.id === "day4");
  const matchLabel = machine?.matchLabel ?? "Portugal vs Colombia";

  const userCorrection = correction.text
    .replace(/^User correction:\s*/i, "")
    .trim();

  const staleLabel = stale
    ? formatProvenanceLabel(
        stale.memorySource ?? "prediction",
        stale.date,
      ) ?? "Stale take"
    : STATIC_CORRECTION_OVERRIDE_PROOF.staleTake.disputedLabel;

  const live =
    receiptIsWalrusBacked(correction) &&
    (!stale || receiptIsWalrusBacked(stale) || Boolean(stale?.walrusBlobId));

  return {
    source: live ? "live" : "fallback",
    data: {
      matchLabel,
      staleTake: {
        prediction: day4?.prediction ?? "Draw 1-1",
        reasoning:
          day4?.reasoning ??
          "Portugal struggle when Ronaldo is isolated — the xG chart says this stays tight.",
        disputedMemory: stale?.text ?? STATIC_CORRECTION_OVERRIDE_PROOF.staleTake.disputedMemory,
        disputedLabel: staleLabel,
        walrusBlobId: stale?.walrusBlobId,
      },
      userCorrection,
      correctionBlobId: correction.walrusBlobId,
      updatedTake: {
        prediction: day4?.prediction ?? "Portugal 2-1",
        reasoning:
          "Your correction overrides the old stats bias. The clone now cites this Walrus memory at highest rerank weight.",
        citedReceipt: {
          text: correction.text,
          provenanceLabel:
            formatProvenanceLabel("correction", correction.date) ??
            "Your correction · highest rerank weight",
          walrusBacked: receiptIsWalrusBacked(correction),
          walrusBlobId: correction.walrusBlobId,
          memoryId: correction.id,
        },
      },
    },
  };
}

export type RoastRecordData = {
  matchLabel: string;
  body: string;
  sentAt: string;
  citedMemories: Array<{
    id: string;
    text: string;
    type: string;
    source?: string;
    walrusBlobId?: string;
    recallSource: "walrus";
  }>;
};

export function buildRoastRecordFromProfile(
  memories: MemoryReceipt[],
): RoastRecordData | null {
  const roastMemory =
    memories.find((m) =>
      m.text.toLowerCase().includes("colombia are physical"),
    ) ??
    memories.find((m) =>
      m.text.toLowerCase().includes("portugal would struggle"),
    );

  const predictionMemory = memories.find((m) =>
    m.text.toLowerCase().includes("predicted portugal"),
  );

  if (!roastMemory && !predictionMemory) return null;

  const primary = roastMemory ?? predictionMemory!;
  const secondary = predictionMemory && roastMemory ? predictionMemory : null;

  return {
    matchLabel: "POR vs COL (1-2)",
    body: `You picked Portugal to win — Colombia beat them 1-2. Your Walrus memory warned you about fading South American pace.

Receipt: "${primary.text}"`,
    sentAt: primary.date,
    citedMemories: [
      {
        id: primary.id,
        text: primary.text,
        type: primary.type,
        source: "onboarding",
        walrusBlobId: primary.walrusBlobId,
        recallSource: "walrus",
      },
      ...(secondary
        ? [
            {
              id: secondary.id,
              text: secondary.text,
              type: secondary.type,
              source: "prediction",
              walrusBlobId: secondary.walrusBlobId,
              recallSource: "walrus" as const,
            },
          ]
        : []),
    ],
  };
}

export function collectCitedMemoryIds(
  sameQuestion: SameQuestionProofData,
  correction: CorrectionOverrideProofData,
): Set<string> {
  const ids = new Set<string>();
  if (sameQuestion.day4.citedReceipt.memoryId) {
    ids.add(sameQuestion.day4.citedReceipt.memoryId);
  }
  if (correction.updatedTake.citedReceipt.memoryId) {
    ids.add(correction.updatedTake.citedReceipt.memoryId);
  }
  return ids;
}
