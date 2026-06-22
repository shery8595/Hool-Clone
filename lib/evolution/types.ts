import type { DashboardContradiction } from "@/lib/clone/contradiction-hunter";
import type { MemoryTimeMachine } from "@/lib/clone/memory-time-machine-types";
import type { CloneAnalyticsBundle } from "@/lib/stats/clone-analytics";
import type { CloneMaturity, MemoryReceipt } from "@/lib/mock/types";

export type EvolutionPageData = {
  slug: string;
  displayName: string;
  handle: string;
  joinedAt: string;
  bio: string;
  maturityLabel: CloneMaturity;
  level: number;
  contradictionCount: number;
  topContradiction: DashboardContradiction | null;
  cloneAnalytics: CloneAnalyticsBundle;
  memoryTimeMachine: MemoryTimeMachine | null;
  allMemoryReceipts: MemoryReceipt[];
  walrusNamespace?: string;
  isPublicView: boolean;
};
