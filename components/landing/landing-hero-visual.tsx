import { cn } from "@/lib/utils";

export const LANDING_HERO_VISUAL_SRC =
  "/landing/landing_page_component_1_update.png";

type LandingHeroVisualProps = {
  className?: string;
  priority?: boolean;
};

export function LandingHeroVisual({
  className,
  priority = true,
}: LandingHeroVisualProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING_HERO_VISUAL_SRC}
        alt="HoolClone walrus mascot saying I remember your glory takes and your cringe ones. Let's go."
        className="h-auto w-full object-contain object-center"
        draggable={false}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
