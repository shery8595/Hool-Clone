"use client";

import { cn } from "@/lib/utils";

export const HOOLCLONE_LOADER_SRC = "/hoolclone-loader.mp4";

const squareSizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
} as const;

const wideSizeClasses = {
  sm: "w-44 sm:w-52",
  md: "w-56 sm:w-64",
  lg: "w-72 sm:w-80",
  xl: "w-80 sm:w-96",
} as const;

type LoaderSize = keyof typeof squareSizeClasses;
type LoaderAspect = "square" | "video";

type HoolCloneLoaderProps = {
  size?: LoaderSize;
  aspect?: LoaderAspect;
  label?: string;
  className?: string;
  videoClassName?: string;
  fullScreen?: boolean;
};

export function LoadingStatus({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-hoolclone-green-700 [animation-delay:300ms]" />
      </div>
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}

export function HoolCloneLoader({
  size = "md",
  aspect = "video",
  label,
  className,
  videoClassName,
  fullScreen = false,
}: HoolCloneLoaderProps) {
  const resolvedSize = fullScreen ? "xl" : size;
  const isWide = aspect === "video";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "min-h-[50vh] w-full",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <video
        src={HOOLCLONE_LOADER_SRC}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        className={cn(
          isWide
            ? cn(
                wideSizeClasses[resolvedSize],
                "aspect-video h-auto max-w-full",
              )
            : squareSizeClasses[resolvedSize],
          "rounded-xl object-contain",
          videoClassName,
        )}
        aria-label={label ?? "Loading"}
      />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}

type LoadingPanelProps = {
  label?: string;
  className?: string;
  size?: LoaderSize;
  aspect?: LoaderAspect;
};

export function LoadingPanel({
  label = "Loading...",
  className,
  size = "lg",
  aspect = "video",
}: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-12 text-center",
        className,
      )}
    >
      <HoolCloneLoader
        size={size}
        aspect={aspect}
        label={label}
        className="mx-auto"
      />
    </div>
  );
}
