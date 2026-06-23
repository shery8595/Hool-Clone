import { cn } from "@/lib/utils";

export const HOOLCLONE_LOGO_SRC = "/hoolclone-logo.png";

type HoolCloneLogoProps = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** Show "AI FAN CLONE" under the title. Default true when `showWordmark` is set. */
  showTagline?: boolean;
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
  showTagline = true,
  wordmarkVariant = "dark",
}: HoolCloneLogoProps) {
  const titleClass = cn(
    "text-lg font-bold leading-none",
    wordmarkVariant === "light"
      ? "text-hoolclone-gray-900"
      : "text-white",
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOOLCLONE_LOGO_SRC}
        alt="HoolClone"
        className={cn(sizeClasses[size], "shrink-0 rounded-lg object-cover")}
      />
      {showWordmark ? (
        showTagline ? (
          <div className="flex flex-col justify-center gap-0.5">
            <p className={titleClass}>HoolClone</p>
            <p
              className={cn(
                "text-[10px] font-semibold leading-none tracking-widest",
                wordmarkVariant === "light"
                  ? "text-muted-foreground"
                  : "text-white/70",
              )}
            >
              AI FAN CLONE
            </p>
          </div>
        ) : (
          <span className={cn(titleClass, "translate-y-px")}>HoolClone</span>
        )
      ) : null}
    </div>
  );
}
