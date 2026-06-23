"use client";

import { useEffect } from "react";
import { SIDEBAR_BG_SRC } from "@/lib/assets/sidebar-bg";
import { preloadImageAsset } from "@/lib/hooks/use-preloaded-image";

/** Warm the sidebar background cache as soon as the app shell mounts. */
export function PreloadSidebarBg() {
  useEffect(() => {
    preloadImageAsset(SIDEBAR_BG_SRC);
  }, []);

  return null;
}
