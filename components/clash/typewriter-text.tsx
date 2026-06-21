"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TypewriterTextProps = {
  text: string;
  className?: string;
  speedMs?: number;
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  className,
  speedMs = 18,
  onComplete,
}: TypewriterTextProps) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    if (!text) return;

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisible(index);
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, onComplete]);

  return (
    <span className={cn(className)}>
      {text.slice(0, visible)}
      {visible < text.length && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
      )}
    </span>
  );
}
