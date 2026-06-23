import type { CloneMaturity } from "@/lib/mock/types";

export const MATURITY_LABELS: CloneMaturity[] = [
  "Stranger",
  "Learner",
  "Imitator",
  "Contradiction Hunter",
  "Full HoolClone",
];

/** Memory counts required to reach each maturity tier (index = level). */
export const MATURITY_THRESHOLDS = [0, 3, 9, 20, 40] as const;

export const MAX_MATURITY_LEVEL = MATURITY_THRESHOLDS.length - 1;

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
  return MATURITY_LABELS[Math.min(Math.max(level, 0), MAX_MATURITY_LEVEL)] ?? "Stranger";
}

export type MaturityProgress = {
  /** Zero-based tier index (0 = Stranger … 4 = Full HoolClone). */
  level: number;
  maxLevel: number;
  /** Progress through the current tier toward the next one (0–99). */
  tierProgress: number;
  /** Progress across the full maturity journey (0–100), aligned with display level. */
  overallProgress: number;
  label: CloneMaturity;
  /** One-based level for UI copy (1–5). */
  displayLevel: number;
  displayMaxLevel: number;
  nextLabel: CloneMaturity | null;
  memoriesToNext: number;
  nextThreshold: number | null;
};

export function computeMaturityProgress(memoriesCount: number): MaturityProgress {
  const { level, label } = memoryCountToMaturity(memoriesCount);
  const maxLevel = MAX_MATURITY_LEVEL;
  const currentMin = MATURITY_THRESHOLDS[level] ?? 0;
  const nextMin = MATURITY_THRESHOLDS[level + 1] ?? null;
  const span =
    nextMin != null ? nextMin - currentMin : MATURITY_THRESHOLDS[maxLevel] - currentMin;

  const tierProgress =
    level >= maxLevel
      ? 100
      : Math.min(99, Math.round(((memoriesCount - currentMin) / span) * 100));

  const overallProgress =
    level >= maxLevel
      ? 100
      : Math.min(
          99,
          Math.round(((level + tierProgress / 100) / maxLevel) * 100),
        );

  return {
    level,
    maxLevel,
    tierProgress,
    overallProgress,
    label,
    displayLevel: level + 1,
    displayMaxLevel: MATURITY_THRESHOLDS.length,
    nextLabel: level >= maxLevel ? null : maturityLevelToLabel(level + 1),
    memoriesToNext:
      nextMin != null ? Math.max(0, nextMin - memoriesCount) : 0,
    nextThreshold: nextMin,
  };
}
