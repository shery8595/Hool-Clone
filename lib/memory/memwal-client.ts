import { MemWal } from "@mysten-incubation/memwal";
import {
  getMemWalAccountId,
  getMemWalDelegateKey,
  getMemWalServerUrl,
  isMemWalConfigured,
} from "@/lib/env";

let client: MemWal | null = null;

export function getMemWalClient(): MemWal {
  if (!isMemWalConfigured()) {
    throw new Error(
      "Walrus Memory is not configured. Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY.",
    );
  }

  if (!client) {
    client = MemWal.create({
      key: getMemWalDelegateKey()!,
      accountId: getMemWalAccountId()!,
      serverUrl: getMemWalServerUrl(),
    });
  }

  return client;
}

export function resetMemWalClient(): void {
  client?.destroy();
  client = null;
}
