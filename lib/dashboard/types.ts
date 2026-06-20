import type { DashboardContradiction } from "@/lib/clone/contradiction-hunter";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import type {
  BiasAxis,
  CloneMaturity,
  Match,
  MemoryReceipt,
  Prediction,
} from "@/lib/mock/types";

export type DashboardData = {
  featuredMatch: Match | null;
  latestComparison: { match: Match; prediction: Prediction } | null;
  recentMemories: MemoryReceipt[];
  stats: {
    memoriesCount: number;
    cloneMatchPercent: number;
    predictionsCount: number;
    maturityLabel: CloneMaturity;
    level: number;
    maxLevel: number;
    levelProgress: number;
    quote: string | null;
  };
  biasRadar: BiasAxis[];
  biasRadarReady: boolean;
  contradiction: DashboardContradiction | null;
  contradictionCount: number;
  memoryTimeMachine: MemoryTimeMachine | null;
};
