import { cn } from "@/lib/utils";

export const HOOLCLONE_LOGO_SRC = "/hoolclone-logo.png";

type HoolCloneLogoProps = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
};

export function HoolCloneLogo({
  className,
  size = "md",
  showWordmark = false,
}: HoolCloneLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOOLCLONE_LOGO_SRC}
        alt="HoolClone"
        className={cn(sizeClasses[size], "shrink-0 rounded-lg object-cover")}
      />
      {showWordmark ? (
        <div>
          <p className="text-lg font-bold leading-tight">HoolClone</p>
          <p className="text-[10px] font-semibold tracking-widest text-white/70">
            AI FAN CLONE
          </p>
        </div>
      ) : null}
    </div>
  );
}
