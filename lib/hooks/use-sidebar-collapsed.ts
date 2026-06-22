"use client";

import { useCallback, useEffect, useState } from "react";

export function useSidebarCollapsed(storageKey: string) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "true") {
      setCollapsed(true);
    }
    setHydrated(true);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [storageKey]);

  return { collapsed: hydrated ? collapsed : false, toggle, hydrated };
}
