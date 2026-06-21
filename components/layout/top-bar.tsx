"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Trophy,
  ChevronDown,
  Database,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CloneAvatar } from "@/components/clone/clone-avatar";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { Sidebar } from "./sidebar";
import { WalletButton } from "./wallet-button";
import { WalrusMemoryBadge } from "./walrus-memory-badge";
import { useUser } from "@/components/providers/user-provider";

type TopBarProps = {
  title?: string;
  showProfileDropdown?: boolean;
  extra?: React.ReactNode;
};

function resolvePageContext(pathname: string): {
  title: string;
  subtitle?: string;
} {
  if (pathname === "/dashboard") {
    return { title: "Dashboard", subtitle: "Your clone at a glance" };
  }
  if (pathname.startsWith("/train")) {
    return { title: "Train", subtitle: "Teach your hooligan" };
  }
  if (pathname.startsWith("/predict")) {
    return { title: "Predict", subtitle: "World Cup picks" };
  }
  if (pathname.startsWith("/debate")) {
    return { title: "Debate", subtitle: "Argue with your clone" };
  }
  if (pathname.startsWith("/memory")) {
    return { title: "Memory", subtitle: "Walrus receipts" };
  }
  if (pathname.includes("/clash")) {
    return { title: "Clone Clash", subtitle: "Namespace vs namespace" };
  }
  if (pathname.includes("/evolution")) {
    return { title: "Evolution", subtitle: "Day 1 vs Day 4" };
  }
  if (pathname.startsWith("/u/")) {
    return { title: "Public Profile", subtitle: "Shareable clone proof" };
  }
  if (pathname.startsWith("/profile")) {
    return { title: "Profile", subtitle: "Visibility settings" };
  }
  return { title: "HoolClone" };
}

function ProfileMenu({
  me,
  onEnablePublic,
  onSignOut,
}: {
  me: NonNullable<ReturnType<typeof useUser>["me"]>;
  onEnablePublic: () => void;
  onSignOut: () => void;
}) {
  const displayName = me.displayName ?? "Fan";
  const maturity = me.profile.cloneMaturityLabel;
  const memories = me.profile.memoriesCount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 font-semibold hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/80"
          />
        }
      >
        <CloneAvatar size="sm" className="h-8 w-8 ring-2 ring-hoolclone-green-700/15" />
        <span className="hidden max-w-[140px] truncate text-left sm:inline lg:max-w-[180px]">
          <span className="block text-sm leading-tight text-hoolclone-gray-900">
            {displayName}
          </span>
          <span className="block text-[10px] font-medium text-muted-foreground">
            {maturity} · {memories} memories
          </span>
        </span>
        <ChevronDown className="hidden h-4 w-4 shrink-0 opacity-50 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="border-b px-3 py-2.5">
          <p className="text-sm font-semibold">{displayName}&apos;s HoolClone</p>
          <p className="text-xs text-muted-foreground">
            {maturity} · Level {me.profile.cloneMaturity}
          </p>
        </div>
        <DropdownMenuItem render={<Link href="/memory" />}>
          <Database className="h-3.5 w-3.5" />
          Memory receipts
        </DropdownMenuItem>
        {me.publicSlug && me.profile.publicEnabled ? (
          <DropdownMenuItem
            render={<Link href={`/u/${me.publicSlug}`} />}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public profile
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onEnablePublic}>
            Enable public profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar({
  title,
  showProfileDropdown = true,
  extra,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { me, enablePublic, signOut } = useUser();

  const pageContext = title
    ? { title, subtitle: undefined }
    : resolvePageContext(pathname);

  const handleEnablePublic = async () => {
    try {
      const slug = await enablePublic();
      if (slug) router.push(`/u/${slug}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-hoolclone-page-bg/85 shadow-[0_1px_0_0_rgba(10,61,46,0.06),0_4px_24px_-4px_rgba(10,61,46,0.08)] backdrop-blur-md">
      <div className="flex h-[3.75rem] items-center gap-3 px-4 lg:px-6">
        {/* Mobile nav */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-hoolclone-green-900 hover:bg-hoolclone-green-100"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link
            href="/dashboard"
            className="flex items-center rounded-lg transition-opacity hover:opacity-90"
          >
            <HoolCloneLogo size="sm" />
          </Link>
        </div>

        {/* Desktop page context */}
        <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-hoolclone-gray-900">
              {pageContext.title}
            </h1>
            {pageContext.subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {pageContext.subtitle}
              </p>
            )}
          </div>

          <div className="hidden h-8 w-px bg-border/80 xl:block" aria-hidden />

          <div className="hidden items-center gap-1.5 rounded-full border border-hoolclone-green-200/60 bg-gradient-to-r from-hoolclone-green-50 to-white px-3 py-1 shadow-sm xl:flex">
            <Trophy className="h-3.5 w-3.5 text-hoolclone-yellow-500" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-hoolclone-green-800">
              World Cup 2026
            </span>
          </div>
        </div>

        {/* Mobile page title */}
        <div className="min-w-0 flex-1 lg:hidden">
          <p className="truncate text-sm font-bold text-hoolclone-gray-900">
            {pageContext.title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {extra}

          <WalrusMemoryBadge variant="compact" />

          {showProfileDropdown && me ? (
            <ProfileMenu
              me={me}
              onEnablePublic={() => void handleEnablePublic()}
              onSignOut={() => void signOut()}
            />
          ) : null}

          <div className="hidden h-6 w-px bg-border/80 sm:block" aria-hidden />

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
