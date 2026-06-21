import type { DashboardContradiction } from "@/lib/clone/contradiction-hunter";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import type { PredictionHistoryItem } from "@/lib/db/predictions";
import type { CloneAnalyticsBundle } from "@/lib/stats/clone-analytics";
import type {
  BiasAxis,
  CloneMaturity,
  DebateHighlight,
  EvolutionEvent,
  MemoryReceipt,
  PredictionComparison,
} from "@/lib/mock/types";

export type PublicProfileData = {
  slug: string;
  displayName: string;
  handle: string;
  joinedAt: string;
  bio: string;
  maturityLabel: CloneMaturity;
  level: number;
  maxLevel: number;
  levelProgress: number;
  memoriesCount: number;
  predictionsCount: number;
  cloneMatchPercent: number;
  biasRadar: BiasAxis[];
  evolutionTimeline: EvolutionEvent[];
  predictionHistory: PredictionHistoryItem[];
  publicMemories: MemoryReceipt[];
  allMemoryReceipts: MemoryReceipt[];
  cloneReceipts: MemoryReceipt[];
  comparisons: PredictionComparison[];
  topContradiction: DashboardContradiction | null;
  contradictionCount: number;
  memoryTimeMachine: MemoryTimeMachine | null;
  debateHighlights: DebateHighlight[];
  cloneAnalytics: CloneAnalyticsBundle;
};
