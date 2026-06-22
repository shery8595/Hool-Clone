"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarCollapseToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
  variant?: "light" | "dark";
};

export function SidebarCollapseToggle({
  collapsed,
  onToggle,
  className,
  variant = "light",
}: SidebarCollapseToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
        variant === "light"
          ? "border-hoolclone-gray-900/80 bg-hoolclone-green-50 text-hoolclone-green-900 hover:bg-hoolclone-green-100"
          : "border-white/30 bg-white/10 text-white hover:bg-white/15",
        className,
      )}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" strokeWidth={2.25} />
      ) : (
        <PanelLeftClose className="h-4 w-4" strokeWidth={2.25} />
      )}
    </button>
  );
}
