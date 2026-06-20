export type MemoryRecord = {
  type: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type MemorySearchResult = {
  text: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export type StoredMemory = {
  id: string;
  type: string;
  text: string;
  metadata: Record<string, unknown>;
  storageStatus: string;
  publicVisible: boolean;
  createdAt: string;
  questionId?: string;
};

export interface MemoryAdapter {
  health(): Promise<{ ok: boolean; message?: string }>;
  remember(
    userId: string,
    memory: MemoryRecord,
  ): Promise<{ id?: string; status: string }>;
  recall(userId: string, query: string): Promise<MemorySearchResult[]>;
  listMemories(userId: string): Promise<StoredMemory[]>;
}
