"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, Promise<void>>();

function preloadImage(src: string): Promise<void> {
  const existing = cache.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    const finish = () => resolve();
    image.onload = finish;
    image.onerror = finish;
    image.src = src;
    if (image.complete) finish();
  });

  cache.set(src, promise);
  return promise;
}

export function preloadImageAsset(src: string): void {
  void preloadImage(src);
}

export function usePreloadedImage(src: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void preloadImage(src).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ready;
}
