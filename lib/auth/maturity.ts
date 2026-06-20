import type { CloneMaturity } from "@/lib/mock/types";

export const MATURITY_LABELS: CloneMaturity[] = [
  "Stranger",
  "Learner",
  "Imitator",
  "Contradiction Hunter",
  "Full HoolClone",
];

export function memoryCountToMaturity(memoryCount: number): {
  level: number;
  label: CloneMaturity;
} {
  if (memoryCount < 3) return { level: 0, label: "Stranger" };
  if (memoryCount < 9) return { level: 1, label: "Learner" };
  if (memoryCount < 20) return { level: 2, label: "Imitator" };
  if (memoryCount < 40) return { level: 3, label: "Contradiction Hunter" };
  return { level: 4, label: "Full HoolClone" };
}

export function maturityLevelToLabel(level: number): CloneMaturity {
  return MATURITY_LABELS[Math.min(Math.max(level, 0), 4)] ?? "Stranger";
}

export function computeMaturityProgress(memoriesCount: number): {
  level: number;
  maxLevel: number;
  progress: number;
  label: CloneMaturity;
} {
  const { level, label } = memoryCountToMaturity(memoriesCount);
  const thresholds = [0, 3, 9, 20, 40];
  const maxLevel = 4;
  const currentMin = thresholds[level] ?? 0;
  const nextMin = thresholds[level + 1] ?? thresholds[thresholds.length - 1] + 20;
  const span = nextMin - currentMin;
  const progress =
    level >= maxLevel
      ? 100
      : Math.min(99, Math.round(((memoriesCount - currentMin) / span) * 100));

  return { level, maxLevel, progress, label };
}
