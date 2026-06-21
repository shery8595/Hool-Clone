import type { CloneMaturity, Match, MemoryReceipt } from "@/lib/mock/types";

export type ClashParticipantMeta = {
  userId: string;
  slug: string;
  displayName: string;
  handle: string;
  maturityLabel: CloneMaturity;
  namespace: string;
  favoriteTeam: string | null;
  rivalTeam: string | null;
  memoriesCount: number;
};

export type ClashParticipant = {
  slug: string;
  displayName: string;
  handle: string;
  maturityLabel: CloneMaturity;
  namespace: string;
  receipts: MemoryReceipt[];
};

export type ClashTurn = {
  speaker: "A" | "B";
  text: string;
  citedReceipts: MemoryReceipt[];
};

export type ClashDebateResult = {
  match: Match;
  participantA: ClashParticipant;
  participantB: ClashParticipant;
  turns: ClashTurn[];
};

export type WalrusBlobProof = {
  blobId: string;
  rawText: string;
  byteLength: number;
  fetchedAt: string;
  parsed: { type: string; text: string; tags: Record<string, string> };
  appMetadata: {
    memoryId: string;
    namespace?: string;
    jobId?: string;
    createdAt: string;
    storageStatus: string;
    text: string;
  } | null;
  lineage: import("@/lib/mock/types").MemoryLineageStep[];
  explorerLinks: {
    aggregator: string;
    walruscan: string;
  };
  isPlaceholder: boolean;
};
