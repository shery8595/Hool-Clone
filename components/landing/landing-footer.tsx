import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Heart,
  Lock,
  Shield,
  Trophy,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { footerTrustItems } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

const footerIconMap = {
  globe: Globe,
  lock: Lock,
  shield: Shield,
  heart: Heart,
} as const;

export function LandingFooter() {
  return (
    <footer
      id="about"
      className="relative overflow-hidden border-t border-white/10 bg-gradient-to-r from-[#0a3d2e] via-hoolclone-green-900 to-hoolclone-green-800 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 pitch-pattern opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-95"
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-2 ring-hoolclone-yellow-500/35 ring-offset-2 ring-offset-hoolclone-green-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/landing/showcase/fan-mariacopa.png"
                alt=""
                className="h-[130%] w-[130%] max-w-none object-contain object-bottom"
              />
            </span>
            <div>
              <p className="text-base font-black tracking-tight">HoolClone</p>
              <p className="text-xs font-medium text-white/65">
                Built on Walrus Memory
              </p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-3 lg:gap-x-10">
            {footerTrustItems.map(({ label, icon }) => {
              const Icon = footerIconMap[icon];
              return (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 sm:h-auto sm:w-auto sm:bg-transparent">
                    <Icon className="h-4 w-4 text-hoolclone-yellow-500" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-white/90 sm:text-sm">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <ButtonLink
              href="/train"
              variant="accent"
              size="lg"
              className={cn(
                "w-full justify-center gap-2 shadow-[0_8px_28px_rgba(245,197,24,0.45)] sm:w-auto",
                "hover:shadow-[0_10px_32px_rgba(245,197,24,0.55)]",
              )}
            >
              Start Training Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
            </ButtonLink>
            <div className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm sm:justify-start">
              <Trophy className="h-5 w-5 text-hoolclone-yellow-500" />
              <span className="text-sm font-black tracking-wide">2026</span>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-white/10 pt-6 text-center text-[11px] font-medium text-white/45 lg:text-left">
          © {new Date().getFullYear()} HoolClone — AI fan clones with Walrus-backed
          memory.
        </p>
      </div>
    </footer>
  );
}
