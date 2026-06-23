"use client";

import { useCallback, useState } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { decryptMemories } from "@/lib/api/client";

export function useMemoryUnlock() {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [unlocking, setUnlocking] = useState(false);

  const unlockMemories = useCallback(
    async (memoryIds: string[]): Promise<Record<string, string>> => {
      if (!account?.address) {
        throw new Error("Connect your wallet to unlock encrypted memories.");
      }

      setUnlocking(true);
      try {
        return await decryptMemories(
          memoryIds,
          async (message) => {
            const result = await signPersonalMessage({
              message: new TextEncoder().encode(message),
            });
            return result.signature;
          },
          account.address,
        );
      } finally {
        setUnlocking(false);
      }
    },
    [account?.address, signPersonalMessage],
  );

  return {
    unlockMemories,
    unlocking,
    canUnlock: Boolean(account?.address),
  };
}
