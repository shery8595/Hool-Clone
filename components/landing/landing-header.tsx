"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  ArrowRight,
  Database,
  ExternalLink,
  Menu,
  Play,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { landingNavItems } from "@/lib/landing/content";
import { suiWalletFilter } from "@/lib/wallet/config";
import { cn } from "@/lib/utils";

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

function WalrusChip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-hoolclone-green-200/80 bg-white/80 px-2.5 py-1 shadow-sm",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
      <Database className="h-3 w-3 text-hoolclone-green-700" />
      <span className="text-[11px] font-semibold text-hoolclone-green-900">
        Walrus Memory
      </span>
    </div>
  );
}

function WcBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-hoolclone-green-200/60 bg-gradient-to-r from-hoolclone-green-50 to-white px-3 py-1 shadow-sm",
        className,
      )}
    >
      <Trophy className="h-3.5 w-3.5 text-hoolclone-yellow-500" />
      <span className="text-[11px] font-bold uppercase tracking-wide text-hoolclone-green-800">
        World Cup 2026
      </span>
    </div>
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
        "sticky top-0 z-50 border-b bg-hoolclone-page-bg/85 backdrop-blur-md transition-shadow duration-300",
        scrolled
          ? "border-border/70 shadow-[0_1px_0_0_rgba(10,61,46,0.06),0_8px_32px_-8px_rgba(10,61,46,0.12)]"
          : "border-transparent shadow-none",
      )}
    >
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center gap-3 px-4 lg:px-6">
        {/* Left: menu + logo */}
        <div className="flex shrink-0 items-center gap-2">
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
              <nav className="flex flex-col gap-0.5 p-3">
                {landingNavItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-hoolclone-gray-900 transition-colors hover:bg-hoolclone-green-100"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/u/hoolclone-demo"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-hoolclone-green-800 transition-colors hover:bg-hoolclone-green-100"
                >
                  <Play className="h-3.5 w-3.5" />
                  Live demo
                </Link>
              </nav>
              <div className="mt-auto space-y-2 border-t border-border/60 p-4">
                <WalrusChip className="w-full justify-center" />
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
        </div>

        {/* Center: badges + nav */}
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex">
          <WcBadge className="hidden xl:flex" />
          <nav className="flex items-center gap-0.5">
            {landingNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-hoolclone-gray-900/90 transition-colors hover:bg-hoolclone-green-100 hover:text-hoolclone-green-900"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile center badge */}
        <div className="flex min-w-0 flex-1 justify-center lg:hidden">
          <WcBadge />
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          <WalrusChip className="hidden md:flex" />

          <ButtonLink
            href="/u/hoolclone-demo"
            variant="ghost"
            size="sm"
            className="hidden gap-1.5 text-hoolclone-green-800 hover:bg-hoolclone-green-100 hover:text-hoolclone-green-900 lg:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Demo
          </ButtonLink>

          <div className="hidden h-6 w-px bg-border/80 sm:block" aria-hidden />

          <div className="hidden sm:block [&_button]:h-9 [&_button]:rounded-full [&_button]:border [&_button]:border-border [&_button]:bg-white [&_button]:px-4 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-hoolclone-gray-900 [&_button]:shadow-sm [&_button]:transition-colors hover:[&_button]:border-hoolclone-green-200 hover:[&_button]:bg-hoolclone-green-50">
            <ConnectButton
              connectText="Log in"
              walletFilter={suiWalletFilter}
            />
          </div>

          <ButtonLink
            href="/train"
            variant="accent"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <span className="hidden sm:inline">Launch App</span>
            <span className="sm:hidden">Launch</span>
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
