"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { peekCached, revalidateCached } from "@/lib/api/data-cache";

export function useCachedData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  initial?: T,
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | undefined>(() => {
    if (key) {
      const cached = peekCached<T>(key);
      if (cached !== undefined) return cached;
    }
    return initial;
  });
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!key) return;
    setHydrating(true);
    setError(null);
    try {
      const next = await revalidateCached(key, () => fetcherRef.current());
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setHydrating(false);
    }
  }, [key]);

  useEffect(() => {
    if (!key) return;

    const cached = peekCached<T>(key);
    if (cached !== undefined) {
      setData(cached);
    }

    let cancelled = false;
    setHydrating(true);
    setError(null);

    void revalidateCached(key, () => fetcherRef.current())
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { data, hydrating, error, refresh };
}
