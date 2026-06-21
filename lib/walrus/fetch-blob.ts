import { getEnv } from "@/lib/env";

const DEFAULT_AGGREGATOR = "https://aggregator.walrus-mainnet.walrus.space";

export function getWalrusAggregatorUrl(): string {
  return getEnv().WALRUS_AGGREGATOR_URL ?? DEFAULT_AGGREGATOR;
}

export function isValidWalrusBlobId(blobId: string): boolean {
  if (!blobId || isPlaceholderBlobId(blobId)) return false;
  return /^[A-Za-z0-9_-]{20,}$/.test(blobId);
}

export function isPlaceholderBlobId(blobId: string): boolean {
  return blobId.startsWith("demo-blob-") || blobId.startsWith("rival-blob-");
}

export async function fetchWalrusBlobRaw(
  blobId: string,
  options?: { timeoutMs?: number; retries?: number },
): Promise<{ rawText: string; byteLength: number }> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const retries = options?.retries ?? 1;
  const url = `${getWalrusAggregatorUrl()}/v1/blobs/${encodeURIComponent(blobId)}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "*/*" },
      });

      if (!response.ok) {
        if (response.status === 404 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        throw new Error(`Walrus aggregator returned ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const rawText = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      return { rawText, byteLength: buffer.byteLength };
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Walrus blob fetch failed");
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error("Walrus blob fetch failed");
}

export function walrusExplorerLinks(blobId: string): {
  aggregator: string;
  walruscan: string;
} {
  const base = getWalrusAggregatorUrl();
  return {
    aggregator: `${base}/v1/blobs/${encodeURIComponent(blobId)}`,
    walruscan: `https://walruscan.com/mainnet/blob/${encodeURIComponent(blobId)}`,
  };
}
