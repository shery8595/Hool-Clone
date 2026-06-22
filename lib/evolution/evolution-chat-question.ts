import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import { JUDGE_PROOF_QUESTION } from "@/lib/clone/judge-proof-demo";

export function defaultEvolutionChatQuestion(
  memoryTimeMachine: MemoryTimeMachine | null,
): string {
  if (memoryTimeMachine?.matchLabel) {
    return `Who wins ${memoryTimeMachine.matchLabel} — and why?`;
  }
  return JUDGE_PROOF_QUESTION;
}
