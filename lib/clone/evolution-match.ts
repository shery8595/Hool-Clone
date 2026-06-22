import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";

export function evolutionMatchFromTimeMachine(
  machine: MemoryTimeMachine | null,
): { matchLabel?: string; matchId?: string } {
  if (!machine?.matchLabel) return {};
  return {
    matchLabel: machine.matchLabel,
    matchId: machine.matchId,
  };
}
