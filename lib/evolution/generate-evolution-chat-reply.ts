import { storedMemoriesToReceipts } from "@/lib/api/memory-mapper";
import { analyzeDebateTurn } from "@/lib/debate/analyze-debate-turn";
import { isRepeatingReply } from "@/lib/debate/thread-variation";
import type { GenerateDebateReplyResult } from "@/lib/debate/types";
import { alignEvolutionCitations } from "@/lib/evolution/align-evolution-citations";
import { buildEvolutionPhaseReply } from "@/lib/evolution/build-evolution-chat";
import {
  buildEvolutionChatSystemPrompt,
  buildEvolutionChatTranscript,
  buildEvolutionChatUserPrompt,
} from "@/lib/evolution/evolution-chat-prompts";
import {
  evolutionPhaseLabel,
  memoriesForEvolutionPhase,
} from "@/lib/evolution/evolution-phase-memories";
import { getLlmAdapter } from "@/lib/llm/gemini-adapter";
import { SchemaType } from "@google/generative-ai";
import { listMemoriesChronologicalForUser } from "@/lib/memory/postgres-memory";
import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { DebateMessage } from "@/lib/mock/types";

const evolutionReplySchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    citedMemoryIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["reply"],
};

export type EvolutionPhaseReplyResult = GenerateDebateReplyResult & {
  memoryCount: number;
  maturityLabel: string;
  phaseLabel: string;
};

export async function generateEvolutionPhaseReply(
  userId: string,
  input: {
    phaseId: TimeMachinePhaseId;
    userMessage: string;
    recentMessages: DebateMessage[];
  },
): Promise<EvolutionPhaseReplyResult> {
  const chronologicalMemories = await listMemoriesChronologicalForUser(
    userId,
    200,
  );
  const allReceipts = storedMemoriesToReceipts(chronologicalMemories);
  const phaseMemories = memoriesForEvolutionPhase(input.phaseId, allReceipts);
  const phaseLabel = evolutionPhaseLabel(input.phaseId, null);

  const offline = buildEvolutionPhaseReply({
    phaseId: input.phaseId,
    userMessage: input.userMessage,
    recentMessages: input.recentMessages,
    allMemoryReceipts: allReceipts,
    memoryTimeMachine: null,
  });

  if (phaseMemories.length === 0) {
    return {
      text: offline.reply,
      citedReceipts: offline.citedReceipts,
      memoryCount: offline.memoryCount,
      maturityLabel: offline.maturityLabel,
      phaseLabel,
    };
  }

  const transcript = buildEvolutionChatTranscript(input.recentMessages);
  const analysis = analyzeDebateTurn(input.userMessage, input.recentMessages, {
    memoryTexts: phaseMemories.map((memory) => memory.text),
  });

  const llm = getLlmAdapter();
  if (llm) {
    try {
      const result = await llm.generateJson<{
        reply: string;
        citedMemoryIds?: string[];
      }>({
        system: buildEvolutionChatSystemPrompt(offline.maturityLabel),
        user: buildEvolutionChatUserPrompt({
          phaseLabel,
          maturityLabel: offline.maturityLabel,
          phaseMemories,
          transcript,
          userMessage: input.userMessage,
          bannedLines: analysis.priorCloneTexts,
        }),
        schemaName: "EvolutionDebateReply",
        schema: evolutionReplySchema,
      });

      if (result.reply?.trim()) {
        const text = result.reply.trim();
        if (isRepeatingReply(text, analysis.priorCloneTexts)) {
          return {
            text: offline.reply,
            citedReceipts: offline.citedReceipts,
            memoryCount: offline.memoryCount,
            maturityLabel: offline.maturityLabel,
            phaseLabel,
          };
        }
        return {
          text,
          citedReceipts: alignEvolutionCitations(
            text,
            result.citedMemoryIds,
            phaseMemories,
            input.userMessage,
            input.recentMessages,
          ),
          memoryCount: phaseMemories.length,
          maturityLabel: offline.maturityLabel,
          phaseLabel,
        };
      }
    } catch {
      // rule-based fallback below
    }
  }

  return {
    text: offline.reply,
    citedReceipts: offline.citedReceipts,
    memoryCount: offline.memoryCount,
    maturityLabel: offline.maturityLabel,
    phaseLabel,
  };
}
