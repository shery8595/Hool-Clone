"use client";

import { useEffect, useState } from "react";
import { HOOLCLONE_LOGO_SRC } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";
import { fetchMemoryHealth } from "@/lib/api/client";
import { useUser } from "@/components/providers/user-provider";

type WalrusMemoryBadgeProps = {
  variant?: "sidebar" | "inline" | "compact";
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
  const isCompact = variant === "compact";
  const isLocal = backend === "Local";
  const walrusVerified = !isLocal && configured && healthy;
  const statusLabel = isLocal
    ? "Local dev store"
    : !configured
      ? "Not configured"
      : walrusVerified
        ? "Verified"
        : "Degraded";
  const count = memoriesUsed ?? me?.profile.memoriesCount;

  if (isCompact) {
    const label = isLocal ? "Local" : walrusVerified ? "Walrus: Verified" : "Walrus";
    return (
      <div
        className={cn(
          "hidden items-center gap-2 rounded-full border border-hoolclone-green-200/80 bg-white/80 px-2.5 py-1 shadow-sm md:flex",
          className,
        )}
        title={`${label} · ${statusLabel}${count !== undefined ? ` · ${count} memories` : ""}`}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            isLocal || walrusVerified ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
        <span className="text-[11px] font-semibold text-hoolclone-green-900">
          {label}
        </span>
        {count !== undefined && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            · {count}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        isSidebar
          ? "border-white/15 bg-white/10"
          : "border-hoolclone-green-100 bg-hoolclone-green-100",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOOLCLONE_LOGO_SRC}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full bg-white/10 p-0.5"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[11px] font-semibold leading-tight",
              isSidebar ? "text-white" : "text-hoolclone-green-900",
            )}
          >
            {isLocal ? "Local Memory" : walrusVerified ? "Walrus: Verified" : "Walrus Memory"}
          </p>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                isLocal || walrusVerified
                  ? "bg-emerald-400"
                  : "bg-amber-400",
              )}
            />
            <span
              className={cn(
                "text-[10px] leading-tight",
                isSidebar ? "text-white/80" : "text-hoolclone-green-700",
              )}
            >
              {statusLabel}
            </span>
            {count !== undefined && (
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isSidebar ? "text-white/60" : "text-muted-foreground",
                )}
              >
                · {count} memories · {isLocal ? "Postgres mirror" : "Walrus Mainnet"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
