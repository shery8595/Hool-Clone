"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Home,
  MessageCircle,
  Target,
  User,
  Brain,
  History,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/api/prefetch";
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { useUser } from "@/components/providers/user-provider";

const APP_SIDEBAR_KEY = "hoolclone-app-sidebar-collapsed";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/train", label: "Train", icon: Brain },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/debate", label: "Debate", icon: MessageCircle },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/evolution", label: "Evolution", icon: Clock },
  { href: "/telegram-history", label: "Telegram", icon: History },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { me } = useUser();
  const isMobileSheet = Boolean(onNavigate);
  const { collapsed, toggle } = useSidebarCollapsed(APP_SIDEBAR_KEY);
  const isCollapsed = isMobileSheet ? false : collapsed;

  const publicHref =
    me?.publicSlug && me.profile.publicEnabled
      ? `/u/${me.publicSlug}`
      : "/profile/public";

  const allNavItems = [
    ...navItems,
    { href: publicHref, label: "Public Profile", icon: User },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden bg-hoolclone-green-900 text-white transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[4.75rem]" : "w-64",
        isMobileSheet ? "h-full w-full" : "hidden lg:flex",
      )}
    >
      <div
        className={cn(
          "shrink-0 border-b border-white/10",
          isCollapsed ? "px-2 py-3.5" : "px-3.5 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-start gap-2",
            isCollapsed ? "flex-col items-center" : "justify-between",
          )}
        >
          <Link
            href="/"
            onClick={onNavigate}
            className={cn(
              "min-w-0 transition-opacity hover:opacity-90",
              isCollapsed && "flex justify-center",
            )}
            title="HoolClone"
          >
            {isCollapsed ? (
              <HoolCloneLogo size="sm" />
            ) : (
              <>
                <HoolCloneLogo size="sm" showWordmark />
                <p className="mt-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-white/50">
                  Fan clone OS
                </p>
              </>
            )}
          </Link>

          {!isMobileSheet && (
            <SidebarCollapseToggle
              collapsed={isCollapsed}
              onToggle={toggle}
              variant="dark"
              className={isCollapsed ? "mt-2" : undefined}
            />
          )}
        </div>
      </div>

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-x-hidden",
          isMobileSheet ? "justify-start overflow-y-auto py-3" : "justify-start overflow-hidden py-3",
          isCollapsed ? "gap-1 px-2" : "gap-1 px-2.5",
        )}
      >
        {!isCollapsed && (
          <p className="mb-2 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/45">
            Operating system
          </p>
        )}

        {allNavItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              onMouseEnter={() => prefetchRoute(href, me?.id)}
              onFocus={() => prefetchRoute(href, me?.id)}
              title={label}
              className={cn(
                "group relative flex items-center rounded-lg border border-transparent transition-all",
                isCollapsed ? "justify-center p-1.5" : "gap-3 px-2.5 py-1.5",
                active
                  ? "border-white/15 bg-gradient-to-r from-white/15 to-white/5"
                  : "hover:bg-white/10",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  active
                    ? "border-hoolclone-yellow-500/40 bg-white text-hoolclone-green-900"
                    : "border-white/15 bg-white/5 text-white/80 group-hover:border-white/25",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {!isCollapsed && (
                <>
                  <span
                    className={cn(
                      "text-sm font-medium leading-snug",
                      active ? "font-semibold text-white" : "text-white/75",
                    )}
                  >
                    {label}
                  </span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-hoolclone-yellow-500" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("shrink-0 border-t border-white/10", isCollapsed ? "p-2.5" : "p-2.5")}>
        {isCollapsed ? (
          <p
            className="py-1 text-center font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-white/50"
            title="Powered by Walrus"
          >
            Walrus
          </p>
        ) : (
          <p className="px-1 text-center font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
            Powered by Walrus
          </p>
        )}
      </div>
    </aside>
  );
}
