import { HOOLCLONE_LOGO_SRC } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";
import type { CloneMaturity } from "@/lib/mock/types";
import { Target } from "lucide-react";

const maturityIcons: Record<CloneMaturity, string> = {
  Stranger: "👤",
  Learner: "🌱",
  Imitator: "🧠",
  "Contradiction Hunter": "🎯",
  "Full HoolClone": "🏆",
};

type CloneAvatarProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export function CloneAvatar({ size = "md", className }: CloneAvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full bg-hoolclone-green-100 p-1 ring-4 ring-hoolclone-green-700/20",
        sizeClasses[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOOLCLONE_LOGO_SRC}
        alt="Your HoolClone clone"
        className="h-full w-full rounded-full object-cover"
      />
    </div>
  );
}

type MaturityBadgeProps = {
  maturity: CloneMaturity;
  className?: string;
};

export function MaturityBadge({ maturity, className }: MaturityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-hoolclone-green-100 px-3 py-1 text-xs font-semibold text-hoolclone-green-900",
        className,
      )}
    >
      {maturity === "Contradiction Hunter" ? (
        <Target className="h-3.5 w-3.5" />
      ) : (
        <span>{maturityIcons[maturity]}</span>
      )}
      {maturity}
    </span>
  );
}
