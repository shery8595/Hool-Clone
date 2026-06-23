import { getEnv, isMemWalConfigured } from "@/lib/env";
import { LocalMemoryAdapter } from "@/lib/memory/local-memory-adapter";
import type { MemoryAdapter } from "@/lib/memory/memory-adapter";
import { WalrusMemoryAdapter } from "@/lib/memory/walrus-memory-adapter";

let adapter: MemoryAdapter | null = null;

export function getMemoryAdapter(): MemoryAdapter {
  if (adapter) return adapter;

  const backend = getEnv().MEMORY_BACKEND;
  if (backend === "walrus") {
    if (!isMemWalConfigured()) {
      throw new Error(
        "MEMORY_BACKEND=walrus but MemWal is not configured. Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY, or use MEMORY_BACKEND=local.",
      );
    }
    adapter = new WalrusMemoryAdapter();
    return adapter;
  }

  adapter = new LocalMemoryAdapter();
  return adapter;
}

export function getMemoryBackendLabel(): "Local" | "Walrus" {
  return getEnv().MEMORY_BACKEND === "walrus" ? "Walrus" : "Local";
}

export async function retryFailedMemory(
  userId: string,
  memoryId: string,
): Promise<{
  status: string;
  walrusBlobId?: string;
  walrusJobId?: string;
  walrusNamespace?: string;
  error?: string;
}> {
  const current = getMemoryAdapter();
  if (!(current instanceof WalrusMemoryAdapter)) {
    throw new Error("Memory retry is only available with the Walrus backend.");
  }
  return current.retryFailedMemory(userId, memoryId);
}
