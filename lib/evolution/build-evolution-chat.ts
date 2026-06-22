import { memoryCountToMaturity } from "@/lib/auth/maturity";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import {
  evolutionPhaseLabel,
  memoriesForEvolutionPhase,
} from "@/lib/evolution/evolution-phase-memories";
import { rankEvolutionMemoriesForTurn } from "@/lib/evolution/rank-evolution-memories";
import { synthesizeEvolutionReply } from "@/lib/evolution/synthesize-evolution-reply";
import type { CloneMaturity, DebateMessage, MemoryReceipt } from "@/lib/mock/types";
import { isPlaceholderBlobId } from "@/lib/walrus/fetch-blob";

export type EvolutionPhaseReply = {
  reply: string;
  citedReceipts: MemoryReceipt[];
  memoryCount: number;
  maturityLabel: CloneMaturity;
  phaseLabel: string;
  walrusBackedCount: number;
};

function receiptIsWalrusBacked(receipt: MemoryReceipt): boolean {
  return Boolean(
    receipt.walrusBlobId &&
      !isPlaceholderBlobId(receipt.walrusBlobId) &&
      receipt.storageStatus === "stored",
  );
}

function maturityForPhase(
  phaseId: TimeMachinePhaseId,
  phaseMemories: MemoryReceipt[],
  totalLibrarySize: number,
  snapshotMaturity?: string,
): CloneMaturity {
  if (snapshotMaturity && phaseMemories.length > 0) {
    return snapshotMaturity as CloneMaturity;
  }
  if (phaseId === "day1") return "Stranger";
  if (phaseId === "day7") {
    return memoryCountToMaturity(totalLibrarySize).label;
  }
  return memoryCountToMaturity(phaseMemories.length).label;
}

function buildStrangerEvolutionReply(
  userMessage: string,
  phaseReasoning?: string,
): string {
  if (phaseReasoning?.trim()) return phaseReasoning.trim();
  return `I don't know you yet — no Walrus memories are stored for this day. I can't answer "${userMessage.trim()}" with receipts. Train me with who you support and why.`;
}

function buildRankedFallbackReply(
  ranked: MemoryReceipt[],
  userMessage: string,
  recentMessages: DebateMessage[],
): { reply: string; citedReceipts: MemoryReceipt[] } {
  const primary = ranked[0];
  if (!primary) {
    return {
      reply: "I don't have a stored memory that answers that yet.",
      citedReceipts: [],
    };
  }

  const secondary = ranked[1];
  const citedReceipts = secondary ? [primary, secondary] : [primary];

  return {
    reply: synthesizeEvolutionReply({
      userMessage,
      recentMessages,
      citedReceipts,
    }),
    citedReceipts,
  };
}

export function buildEvolutionPhaseReply(input: {
  phaseId: TimeMachinePhaseId;
  userMessage: string;
  recentMessages: DebateMessage[];
  allMemoryReceipts: MemoryReceipt[];
  memoryTimeMachine: MemoryTimeMachine | null;
}): EvolutionPhaseReply {
  const memories = memoriesForEvolutionPhase(
    input.phaseId,
    input.allMemoryReceipts,
  );
  const phase = input.memoryTimeMachine?.phases.find(
    (entry) => entry.id === input.phaseId,
  );
  const maturityLabel = maturityForPhase(
    input.phaseId,
    memories,
    input.allMemoryReceipts.length,
    phase?.maturityLabel,
  );
  const phaseLabel = evolutionPhaseLabel(input.phaseId, input.memoryTimeMachine);

  if (memories.length === 0) {
    return {
      reply: buildStrangerEvolutionReply(input.userMessage, phase?.reasoning),
      citedReceipts: [],
      memoryCount: 0,
      maturityLabel: "Stranger",
      phaseLabel,
      walrusBackedCount: 0,
    };
  }

  const analysis = analyzeDebateTurn(input.userMessage, input.recentMessages, {
    memoryTexts: memories.map((memory) => memory.text),
  });
  const rankedCatalog = rankEvolutionMemoriesForTurn(
    memories,
    input.userMessage,
    analysis,
    input.recentMessages,
  );
  const fallback = buildRankedFallbackReply(
    rankedCatalog,
    input.userMessage,
    input.recentMessages,
  );

  return {
    reply: fallback.reply,
    citedReceipts: fallback.citedReceipts,
    memoryCount: memories.length,
    maturityLabel,
    phaseLabel,
    walrusBackedCount: fallback.citedReceipts.filter(receiptIsWalrusBacked)
      .length,
  };
}
