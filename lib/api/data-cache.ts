type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function peekCached<T>(key: string): T | undefined {
  return store.get(key)?.data as T | undefined;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, fetchedAt: Date.now() });
}

export function invalidateCache(keyOrPrefix: string): void {
  for (const key of store.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      store.delete(key);
    }
  }
  for (const key of inflight.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      inflight.delete(key);
    }
  }
}

export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 60_000,
): Promise<T> {
  const existing = store.get(key);
  if (existing && Date.now() - existing.fetchedAt < ttlMs) {
    return existing.data as T;
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** Revalidate in background; returns stale data immediately when available. */
export async function revalidateCached<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const stale = peekCached<T>(key);
  const promise = fetchCached(key, fetcher, 0);
  return stale !== undefined ? promise.then(() => peekCached<T>(key) ?? promise) : promise;
}

export const cacheKeys = {
  dashboard: (userId: string) => `dashboard:${userId}`,
  memories: (userId: string) => `memories:${userId}`,
  matches: () => "matches",
  predictionHistory: (userId: string) => `history:${userId}`,
  match: (matchId: string) => `match:${matchId}`,
  matchPrediction: (userId: string, matchId: string) =>
    `match-pred:${userId}:${matchId}`,
};
