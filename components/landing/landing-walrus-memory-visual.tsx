import { cn } from "@/lib/utils";

export const LANDING_WALRUS_MEMORY_VISUAL_SRC =
  "/landing/memory-is-product-component.png";

type LandingWalrusMemoryVisualProps = {
  className?: string;
};

export function LandingWalrusMemoryVisual({
  className,
}: LandingWalrusMemoryVisualProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[34rem]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING_WALRUS_MEMORY_VISUAL_SRC}
        alt="HoolClone walrus mascot projecting verified Walrus memory receipts"
        className="h-auto w-full object-contain object-center drop-shadow-[0_24px_48px_rgba(10,61,46,0.12)]"
        draggable={false}
      />
    </div>
  );
}
