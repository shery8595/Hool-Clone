import { cn } from "@/lib/utils";

export const HOOLCLONE_LOGO_SRC = "/hoolclone-logo.png";

type HoolCloneLogoProps = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** Use `light` on pale backgrounds (e.g. landing header). */
  wordmarkVariant?: "light" | "dark";
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
  wordmarkVariant = "dark",
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
          <p
            className={cn(
              "text-lg font-bold leading-tight",
              wordmarkVariant === "light" && "text-hoolclone-gray-900",
            )}
          >
            HoolClone
          </p>
          <p
            className={cn(
              "text-[10px] font-semibold tracking-widest",
              wordmarkVariant === "light"
                ? "text-muted-foreground"
                : "text-white/70",
            )}
          >
            AI FAN CLONE
          </p>
        </div>
      ) : null}
    </div>
  );
}
