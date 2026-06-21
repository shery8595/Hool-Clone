import {
  Brain,
  Database,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { landingFeatures } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

const iconMap = {
  brain: Brain,
  database: Database,
  message: MessageCircle,
  trending: TrendingUp,
  trophy: Trophy,
} as const;

const cardAccents = [
  {
    ring: "group-hover:ring-hoolclone-green-200",
    icon: "bg-gradient-to-br from-hoolclone-green-100 to-hoolclone-green-50 text-hoolclone-green-800 group-hover:from-hoolclone-green-800 group-hover:to-hoolclone-green-700 group-hover:text-white",
    bar: "bg-hoolclone-green-600",
  },
  {
    ring: "group-hover:ring-hoolclone-yellow-500/35",
    icon: "bg-gradient-to-br from-amber-50 to-hoolclone-yellow-500/15 text-hoolclone-green-900 group-hover:from-hoolclone-yellow-500/80 group-hover:to-hoolclone-yellow-500 group-hover:text-hoolclone-green-950",
    bar: "bg-hoolclone-yellow-500",
    featured: true,
    goldenNumber: true,
  },
  {
    ring: "group-hover:ring-hoolclone-green-200",
    icon: "bg-gradient-to-br from-hoolclone-green-100 to-hoolclone-green-50 text-hoolclone-green-800 group-hover:from-hoolclone-green-800 group-hover:to-hoolclone-green-700 group-hover:text-white",
    bar: "bg-hoolclone-green-600",
  },
  {
    ring: "group-hover:ring-emerald-200",
    icon: "bg-gradient-to-br from-emerald-100 to-hoolclone-green-50 text-emerald-800 group-hover:from-emerald-700 group-hover:to-hoolclone-green-700 group-hover:text-white",
    bar: "bg-emerald-600",
  },
  {
    ring: "group-hover:ring-amber-200",
    icon: "bg-gradient-to-br from-amber-100 to-hoolclone-yellow-50 text-amber-900 group-hover:from-amber-500 group-hover:to-hoolclone-yellow-500 group-hover:text-hoolclone-green-950",
    bar: "bg-amber-500",
    goldenNumber: true,
  },
] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-y border-border/60 bg-hoolclone-page-bg py-16 lg:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        aria-hidden
        style={{
          backgroundImage: "url(/landing/built-to-know-you-bg.png)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-white/25"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6" data-reveal-section>
        <div className="mx-auto max-w-2xl text-center" data-reveal-item>
          <div className="inline-flex items-center gap-2 rounded-full border border-hoolclone-green-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-hoolclone-yellow-600" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-hoolclone-green-800">
              Clone superpowers
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-hoolclone-gray-900 sm:text-3xl">
            Built to know you —{" "}
            <span className="text-hoolclone-green-700">not guess you</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Five behaviors that turn a generic chatbot into a fan clone with
            memory, receipts, and attitude.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-3">
          {landingFeatures.map(({ title, description, icon }, index) => {
            const Icon = iconMap[icon];
            const accent = cardAccents[index] ?? cardAccents[0];
            const step = String(index + 1).padStart(2, "0");
            const featured = "featured" in accent && accent.featured;
            const goldenNumber = "goldenNumber" in accent && accent.goldenNumber;

            return (
              <article
                key={title}
                data-reveal-item
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-white/90 p-5 shadow-[0_8px_30px_rgba(10,61,46,0.06)] ring-1 ring-transparent backdrop-blur-sm transition-all duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_20px_50px_rgba(10,61,46,0.12)]",
                  accent.ring,
                  featured &&
                    "border-hoolclone-yellow-500/25 bg-gradient-to-b from-hoolclone-yellow-50/80 to-white shadow-[0_12px_40px_rgba(245,197,24,0.15)] xl:-mt-2 xl:mb-2",
                )}
              >
                <p
                  className="text-5xl font-black leading-none tracking-tighter transition-transform duration-300 group-hover:scale-105"
                  aria-hidden
                >
                  <span
                    className={cn(
                      "inline-block text-hoolclone-green-300 transition-all duration-300",
                      goldenNumber
                        ? "group-hover:text-hoolclone-yellow-500/45"
                        : "group-hover:text-hoolclone-green-600",
                    )}
                  >
                    0
                  </span>
                  <span
                    className={cn(
                      "inline-block text-hoolclone-green-500 transition-all duration-300",
                      goldenNumber
                        ? "group-hover:text-hoolclone-yellow-500"
                        : "group-hover:text-hoolclone-green-700",
                    )}
                  >
                    {step.slice(-1)}
                  </span>
                </p>
                <span className="sr-only">Step {step}</span>

                <div
                  className={cn(
                    "relative z-10 mt-3 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md",
                    accent.icon,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="relative z-10 mt-3 text-sm font-black uppercase tracking-wide text-hoolclone-gray-900">
                  {title}
                </h3>
                <p className="relative z-10 mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                  {description}
                </p>

                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-1 w-0 rounded-full transition-all duration-500 ease-out group-hover:w-full",
                    accent.bar,
                  )}
                  aria-hidden
                />

                {featured && (
                  <span className="absolute right-3 top-3 z-20 rounded-full bg-hoolclone-yellow-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-hoolclone-green-950">
                    Core
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
