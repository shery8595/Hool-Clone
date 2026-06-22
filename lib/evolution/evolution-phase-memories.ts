import type { TimeMachinePhaseId } from "@/lib/clone/memory-time-machine-types";
import type { MemoryReceipt } from "@/lib/mock/types";

/** day7 uses the full Walrus library; other caps mirror the time machine. */
export const EVOLUTION_PHASE_MEMORY_CAPS: Record<
  TimeMachinePhaseId,
  number | "all"
> = {
  day1: 0,
  day3: 3,
  day4: 10,
  day7: "all",
};

export const EVOLUTION_PHASE_OPTIONS: Array<{
  id: TimeMachinePhaseId;
  label: string;
}> = [
  { id: "day1", label: "Day 1" },
  { id: "day3", label: "Day 3" },
  { id: "day4", label: "Day 4" },
  { id: "day7", label: "Day 7 (all memories)" },
];

export const EVOLUTION_COMPARE_PRESETS: Array<{
  id: string;
  label: string;
  left: TimeMachinePhaseId;
  right: TimeMachinePhaseId;
}> = [
  { id: "1v7", label: "Day 1 vs Day 7", left: "day1", right: "day7" },
  { id: "1v4", label: "Day 1 vs Day 4", left: "day1", right: "day4" },
  { id: "3v7", label: "Day 3 vs Day 7", left: "day3", right: "day7" },
  { id: "4v7", label: "Day 4 vs Day 7", left: "day4", right: "day7" },
];

export function sortMemoriesChronological(
  receipts: MemoryReceipt[],
): MemoryReceipt[] {
  return [...receipts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function memoriesForEvolutionPhase(
  phaseId: TimeMachinePhaseId,
  receipts: MemoryReceipt[],
): MemoryReceipt[] {
  const sorted = sortMemoriesChronological(receipts);
  const cap = EVOLUTION_PHASE_MEMORY_CAPS[phaseId];
  if (cap === "all") return sorted;
  return sorted.slice(0, cap);
}

export function evolutionPhaseLabel(
  phaseId: TimeMachinePhaseId,
  memoryTimeMachine: import("@/lib/clone/memory-time-machine-types").MemoryTimeMachine | null,
): string {
  const snapshot = memoryTimeMachine?.phases.find((phase) => phase.id === phaseId);
  if (snapshot) return `${snapshot.dayLabel} · ${snapshot.title}`;
  const fallback: Record<TimeMachinePhaseId, string> = {
    day1: "Day 1 · Stranger clone",
    day3: "Day 3 · Learner clone",
    day4: "Day 4 · Imitator clone",
    day7: "Day 7 · Full memory clone",
  };
  return fallback[phaseId];
}
