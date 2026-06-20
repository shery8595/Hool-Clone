"use client";

import { useEffect, useState } from "react";
import { HOOLCLONE_LOGO_SRC } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";
import { fetchMemoryHealth } from "@/lib/api/client";
import { useUser } from "@/components/providers/user-provider";

type WalrusMemoryBadgeProps = {
  variant?: "sidebar" | "inline";
  memoriesUsed?: number;
  className?: string;
};

export function WalrusMemoryBadge({
  variant = "sidebar",
  memoriesUsed,
  className,
}: WalrusMemoryBadgeProps) {
  const { me } = useUser();
  const [backend, setBackend] = useState<"Local" | "Walrus">("Local");
  const [healthy, setHealthy] = useState(true);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMemoryHealth()
        .then((health) => {
          setBackend(health.backend);
          setHealthy(health.ok);
          setConfigured(health.configured !== false);
        })
        .catch(() => setHealthy(false));
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const isSidebar = variant === "sidebar";
  const isLocal = backend === "Local";
  const statusLabel = isLocal
    ? "Local dev store"
    : !configured
      ? "Not configured"
      : healthy
        ? "Connected"
        : "Degraded";
  const count = memoriesUsed ?? me?.profile.memoriesCount;

  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        isSidebar
          ? "border-white/15 bg-white/10"
          : "border-hoolclone-green-100 bg-hoolclone-green-100",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOOLCLONE_LOGO_SRC}
          alt=""
          className="h-8 w-8 rounded-full bg-white/10 p-0.5"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-semibold",
              isSidebar ? "text-white" : "text-hoolclone-green-900",
            )}
          >
            {isLocal ? "Local Memory" : "Walrus Memory"}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isLocal || (configured && healthy)
                  ? "bg-emerald-400"
                  : "bg-amber-400",
              )}
            />
            <span
              className={cn(
                "text-xs",
                isSidebar ? "text-white/80" : "text-hoolclone-green-700",
              )}
            >
              {statusLabel}
            </span>
          </div>
          {count !== undefined && (
            <p
              className={cn(
                "mt-1 text-[10px]",
                isSidebar ? "text-white/60" : "text-muted-foreground",
              )}
            >
              {count} memories · {isLocal ? "Postgres mirror" : "Walrus Mainnet"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
