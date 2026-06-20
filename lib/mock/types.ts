export type CloneMaturity =
  | "Stranger"
  | "Learner"
  | "Imitator"
  | "Contradiction Hunter"
  | "Full HoolClone";

export type MemoryType = "remembered" | "inferred" | "used" | "stored";

export type DriverChip = "stats" | "vibes" | "loyalty" | "chaos";

export type EmotionState = "calm" | "nervous" | "hyped";

export type Team = {
  code: string;
  name: string;
  flag: string;
};

export type DemoUser = {
  name: string;
  handle: string;
  slug: string;
  walletAddress: string;
  maturity: CloneMaturity;
  level: number;
  maxLevel: number;
  levelProgress: number;
  bio: string;
  joinedAt: string;
  quote: string;
  memoriesCount: number;
  cloneMatchPercent: number;
  matchAccuracyPercent: number;
  predictionsCount: number;
};

export type Match = {
  id: string;
  matchNumber: number;
  stage: string;
  group?: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  /** Knockout placeholder when teams are not yet determined */
  matchupLabel?: string;
  kickoffAt: string;
  venue: string;
  city: string;
  featured?: boolean;
};

export type RecallSource = "walrus" | "postgres_fallback";

export type MemoryReceipt = {
  id: string;
  number?: number;
  type: MemoryType;
  text: string;
  date: string;
  matchContext?: string;
  publicVisible: boolean;
  usedInPrediction?: boolean;
  hidden?: boolean;
  quote?: string;
  storageStatus?: "stored" | "pending" | "failed";
  walrusBlobId?: string;
  walrusNamespace?: string;
  walrusJobId?: string;
  recallSource?: RecallSource;
};

export type DebateHighlight = {
  id: string;
  summary: string;
  exchangeCount: number;
  citedMemoryCount: number;
  topics: string[];
  date: string;
};

export type ClonePrediction = {
  winner: string;
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasoning: string;
  insight?: string;
  receipts: MemoryReceipt[];
};

export type Prediction = {
  matchId: string;
  winner: string;
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasoning: string;
  emotion: EmotionState;
  clone?: ClonePrediction;
  agreed?: boolean;
};

export type TrainingQuestion = {
  id: string;
  question: string;
  placeholder: string;
  maxLength: number;
  defaultAnswer?: string;
  defaultDriver?: DriverChip;
  storedSummary?: string;
};

export type DebateMessage = {
  id: string;
  role: "user" | "clone";
  text: string;
  timestamp: string;
  /** Exact memory receipts the clone cited in this reply */
  citedReceipts?: MemoryReceipt[];
};

export type BiasAxis = {
  label: string;
  you: number;
  clone: number;
};

export type EvolutionEvent = {
  day: number;
  title: CloneMaturity;
  description: string;
  icon: "user" | "brain" | "target";
};

export type PredictionComparison = {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  userPrediction: string;
  clonePrediction: string;
  agreed: boolean;
};
