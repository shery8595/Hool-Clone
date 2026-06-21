import {
  Database,
  Heart,
  Lock,
  Play,
  Shield,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { socialProofAvatars, trustBadges } from "@/lib/landing/content";
import { LandingClonePreview } from "./landing-clone-preview";
import { LandingHeroVisual } from "./landing-hero-visual";

const trustIconMap = {
  database: Database,
  shield: Shield,
  lock: Lock,
  heart: Heart,
} as const;

export function LandingHero() {
  return (
    <section className="landing-hero-bg relative overflow-x-clip lg:overflow-visible">
      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-12">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] lg:gap-4 xl:gap-8">
          <div className="space-y-8" data-hero-item>
            <div className="inline-flex items-center gap-2 rounded-full border border-hoolclone-green-100 bg-hoolclone-page-bg px-3 py-1.5 lg:hidden">
              <span className="text-xs font-semibold text-hoolclone-green-900">
                WORLD CUP 2026
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-hoolclone-gray-900 sm:text-5xl lg:text-[3.25rem]">
                Your Football Brain.{" "}
                <span className="text-hoolclone-green-700">Cloned.</span>{" "}
                Debated. Remembered.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                HoolClone is your AI fan clone that learns your takes, remembers
                your patterns, and debates you with receipts. Built for real
                fans. Proven by memory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/train" size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Train Your Clone
              </ButtonLink>
              <ButtonLink
                href="/docs/how-it-works"
                variant="accent"
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                See How It Works
              </ButtonLink>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {socialProofAvatars.map(({ initials, color }) => (
                  <span
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-hoolclone-page-bg text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="font-bold text-hoolclone-gray-900">12K+</span>{" "}
                fans already training their clones
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {trustBadges.map(({ label, icon }) => {
                const Icon = trustIconMap[icon];
                return (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-hoolclone-green-700" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-hoolclone-gray-900">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-3xl lg:mx-0 lg:-mt-12 lg:max-w-none xl:-mt-16"
            data-hero-item
          >
            <LandingHeroVisual className="relative z-0 w-full lg:-translate-x-16 lg:-translate-y-8 xl:-translate-x-24 xl:-translate-y-12" />
            <LandingClonePreview className="relative z-10 mx-auto mt-6 w-[min(100%,18.9rem)] sm:w-[17.85rem] lg:absolute lg:left-[64%] lg:top-6 lg:mt-0 lg:w-[16.5rem] xl:left-[68%] xl:top-8 xl:w-[17.85rem] 2xl:left-[72%] 2xl:top-9 2xl:w-[18.85rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}
