"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scrollable docs column: wheel over this panel scrolls only here, not the main page.
 */
export function DocsScrollPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;

    const onWheel = (event: WheelEvent) => {
      if (!panel.contains(event.target as Node)) return;

      const { scrollTop, scrollHeight, clientHeight } = panel;
      const canScroll = scrollHeight > clientHeight + 1;

      if (!canScroll) {
        event.preventDefault();
        return;
      }

      const scrollingDown = event.deltaY > 0;
      const scrollingUp = event.deltaY < 0;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
        event.stopPropagation();
      } else {
        event.preventDefault();
      }
    };

    panel.addEventListener("wheel", onWheel, { passive: false });
    return () => panel.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div ref={ref} className={cn("docs-panel-scroll", className)}>
      {children}
    </div>
  );
}
