"use client";

import { useEffect } from "react";
import { prefetchAppData } from "@/lib/api/prefetch";
import { useUser } from "@/components/providers/user-provider";

export function PrefetchOnAuth() {
  const { me } = useUser();

  useEffect(() => {
    if (!me?.id) return;

    let cancelled = false;
    const run = () => {
      if (!cancelled) prefetchAppData(me.id);
    };

    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(run);
      return () => {
        cancelled = true;
        cancelIdleCallback(idleId);
      };
    }

    const timer = window.setTimeout(run, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [me?.id]);

  return null;
}
