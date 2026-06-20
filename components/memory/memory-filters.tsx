"use client";

import { cn } from "@/lib/utils";

export type MemoryFilter =
  | "all"
  | "remembered"
  | "inferred"
  | "stored"
  | "used"
  | "hidden";

const filters: { id: MemoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "remembered", label: "Remembered" },
  { id: "inferred", label: "Inferred" },
  { id: "stored", label: "Stored" },
  { id: "used", label: "Used in prediction" },
  { id: "hidden", label: "Hidden" },
];

type MemoryFiltersProps = {
  active: MemoryFilter;
  onChange: (filter: MemoryFilter) => void;
  variant?: "pills" | "tabs";
};

export function MemoryFilters({
  active,
  onChange,
  variant = "pills",
}: MemoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
            variant === "pills" &&
              (active === id
                ? "border border-hoolclone-green-600/25 bg-gradient-to-b from-hoolclone-green-600 via-primary to-hoolclone-green-800 text-white shadow-[0_4px_14px_var(--btn-neu-shadow-strong),inset_0_1px_0_rgba(255,255,255,0.25)]"
                : "border border-white/90 bg-gradient-to-b from-white to-hoolclone-gray-50 text-muted-foreground shadow-[4px_4px_10px_var(--btn-neu-shadow),-3px_-3px_8px_var(--btn-neu-highlight)] hover:text-hoolclone-green-900"),
            variant === "tabs" &&
              (active === id
                ? "border-b-2 border-hoolclone-green-700 text-hoolclone-green-900"
                : "text-muted-foreground hover:text-foreground"),
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function DebateReceiptFilters({
  active,
  onChange,
}: {
  active: "all" | "remembered" | "inferred";
  onChange: (filter: "all" | "remembered" | "inferred") => void;
}) {
  const debateFilters = [
    { id: "all" as const, label: "All" },
    { id: "remembered" as const, label: "Remembered" },
    { id: "inferred" as const, label: "Inferred" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {debateFilters.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
            active === id
              ? "border border-hoolclone-green-600/25 bg-gradient-to-b from-hoolclone-green-600 via-primary to-hoolclone-green-800 text-white shadow-[0_3px_10px_var(--btn-neu-shadow-strong),inset_0_1px_0_rgba(255,255,255,0.25)]"
              : "border border-white/80 bg-gradient-to-b from-white to-hoolclone-gray-50 text-muted-foreground shadow-[3px_3px_8px_var(--btn-neu-shadow),-2px_-2px_6px_var(--btn-neu-highlight)] hover:text-hoolclone-green-900",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
