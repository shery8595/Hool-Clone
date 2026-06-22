"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  ArrowRight,
  Database,
  Menu,
  MessageCircle,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { suiWalletFilter } from "@/lib/wallet/config";
import { cn } from "@/lib/utils";

const mobileAppLinks = [
  { href: "/train", label: "Train", icon: Zap },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/debate", label: "Debate", icon: MessageCircle },
] as const;

function LandingLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group rounded-xl transition-opacity hover:opacity-90",
        className,
      )}
    >
      <HoolCloneLogo
        size="sm"
        showWordmark
        wordmarkVariant="light"
        className="[&>div:last-child]:hidden [&>div:last-child]:sm:block"
      />
    </Link>
  );
}

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/92 shadow-[0_8px_30px_-12px_rgba(10,61,46,0.18)] backdrop-blur-lg"
          : "border-b border-transparent bg-hoolclone-page-bg/75 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[3.75rem] lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-hoolclone-green-900 hover:bg-hoolclone-green-100 lg:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(100vw-2rem,20rem)] flex-col p-0"
            >
              <div className="border-b border-hoolclone-green-100 bg-gradient-to-br from-hoolclone-green-50 to-white px-6 py-5">
                <LandingLogo />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Train your hooligan. Watch it roast you.
                </p>
              </div>

              <nav className="flex flex-col gap-1 p-3">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Jump in
                </p>
                {mobileAppLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-hoolclone-gray-900 transition-colors hover:bg-hoolclone-green-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hoolclone-green-100 text-hoolclone-green-800">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-2 border-t border-border/60 p-4">
                <div className="flex items-center justify-center gap-2 rounded-full border border-hoolclone-green-200/80 bg-white px-3 py-2 text-[11px] font-semibold text-hoolclone-green-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <Database className="h-3 w-3" />
                  Walrus Memory · Mainnet
                </div>
                <div className="[&_button]:h-10 [&_button]:w-full [&_button]:rounded-full [&_button]:border [&_button]:border-border [&_button]:bg-white [&_button]:text-sm [&_button]:font-semibold">
                  <ConnectButton
                    connectText="Connect wallet"
                    walletFilter={suiWalletFilter}
                  />
                </div>
                <ButtonLink href="/train" variant="accent" className="w-full gap-2">
                  Launch App
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </SheetContent>
          </Sheet>

          <LandingLogo />

          <div className="hidden min-w-0 border-l border-border/50 pl-3 md:block">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-hoolclone-green-800">
              World Cup 2026
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Predicting you, not football
            </p>
          </div>
        </div>

        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-hoolclone-green-200/70 bg-white/90 px-4 py-1.5 shadow-sm lg:flex"
          aria-hidden={false}
        >
          <Trophy className="h-3.5 w-3.5 text-hoolclone-yellow-500" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-hoolclone-green-800">
            Walrus Memory World Cup
          </span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-hoolclone-green-900">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mainnet live
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-white/80 p-1 shadow-sm sm:gap-1.5">
            <div className="hidden sm:block [&_button]:h-8 [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-3 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-hoolclone-gray-900 [&_button]:shadow-none hover:[&_button]:bg-hoolclone-green-50">
              <ConnectButton
                connectText="Log in"
                walletFilter={suiWalletFilter}
              />
            </div>
            <ButtonLink
              href="/train"
              variant="accent"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-3.5 shadow-none sm:h-9 sm:px-4"
            >
              <span className="hidden sm:inline">Launch App</span>
              <span className="sm:hidden">Launch</span>
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
