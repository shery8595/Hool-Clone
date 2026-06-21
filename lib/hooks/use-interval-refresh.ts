"use client";

import { useEffect } from "react";

/** Refetch cached data on an interval (e.g. live match scores without Vercel cron). */
export function useIntervalRefresh(
  refresh: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      void refresh();
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs, enabled]);
}
