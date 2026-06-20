"use client";

import {
  BarChart3,
  Smile,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriverChip } from "@/lib/mock/types";

const drivers: {
  id: DriverChip;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "vibes", label: "Vibes", icon: Smile },
  { id: "loyalty", label: "Loyalty", icon: Shield },
  { id: "chaos", label: "Chaos", icon: Zap },
];

type DriverChipGroupProps = {
  value: DriverChip;
  onChange: (driver: DriverChip) => void;
  disabled?: boolean;
};

export function DriverChipGroup({
  value,
  onChange,
  disabled,
}: DriverChipGroupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold">What&apos;s driving this take?</p>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-wrap gap-2">
        {drivers.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
              value === id
                ? "bg-hoolclone-yellow-500 text-hoolclone-gray-900"
                : "border border-border bg-white hover:bg-hoolclone-gray-50",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
