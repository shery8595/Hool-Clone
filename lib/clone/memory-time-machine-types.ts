export type TimeMachinePhaseId = "day1" | "day3" | "day4" | "day7";

export type TimeMachineReceipt = {
  summary: string;
  strength?: "low" | "medium" | "high";
  walrusBacked?: boolean;
  memoryId?: string;
  walrusBlobId?: string;
  provenanceLabel?: string;
};

export type TimeMachineSnapshot = {
  id: TimeMachinePhaseId;
  dayLabel: string;
  title: string;
  subtitle: string;
  memoryCount: number;
  maturityLabel: string;
  prediction: string;
  reasoning: string;
  confidence: number;
  receipts: TimeMachineReceipt[];
  traits: string[];
  knowledgeBullets: string[];
};

export type MemoryTimeMachine = {
  matchId: string;
  matchLabel: string;
  phases: TimeMachineSnapshot[];
  actualMemoriesCount: number;
  defaultPhase: TimeMachinePhaseId;
};
