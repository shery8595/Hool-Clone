import {
  getMemWalAccountId,
  getMemWalDelegateKey,
  getMemWalServerUrl,
  isMemWalConfigured,
} from "@/lib/env";

type MemWalClient = Awaited<ReturnType<typeof createMemWalClient>>;

let client: MemWalClient | null = null;
let clientPromise: Promise<MemWalClient> | null = null;

async function createMemWalClient() {
  const { MemWal } = await import("@mysten-incubation/memwal");
  return MemWal.create({
    key: getMemWalDelegateKey()!,
    accountId: getMemWalAccountId()!,
    serverUrl: getMemWalServerUrl(),
  });
}

export async function getMemWalClient(): Promise<MemWalClient> {
  if (!isMemWalConfigured()) {
    throw new Error(
      "Walrus Memory is not configured. Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY.",
    );
  }

  if (client) return client;

  if (!clientPromise) {
    clientPromise = createMemWalClient().then((instance) => {
      client = instance;
      return instance;
    });
  }

  return clientPromise;
}

export function resetMemWalClient(): void {
  client?.destroy();
  client = null;
  clientPromise = null;
}
