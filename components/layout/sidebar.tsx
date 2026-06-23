"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Clock,
  Database,
  Home,
  MessageCircle,
  Send,
  Swords,
  Target,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/api/prefetch";
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { useUser } from "@/components/providers/user-provider";

const APP_SIDEBAR_KEY = "hoolclone-app-sidebar-collapsed";
const SIDEBAR_BG_VERSION = "3";
const SIDEBAR_BG_SRC = `/images/sidebar-bg.png?v=${SIDEBAR_BG_VERSION}`;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const cloneCoreItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/train", label: "Train", icon: Brain },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/debate", label: "Debate", icon: MessageCircle },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/evolution", label: "Evolution", icon: Clock },
];

const communicationItems: NavItem[] = [
  { href: "/telegram-history", label: "Telegram", icon: Send },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onNavigate,
  userId,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  userId?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseEnter={() => prefetchRoute(href, userId)}
      onFocus={() => prefetchRoute(href, userId)}
      title={label}
      className={cn(
        "group relative flex items-center rounded-xl transition-all",
        collapsed ? "justify-center p-1" : "gap-2.5 px-2 py-1.5",
        active
          ? collapsed
            ? "bg-white/10"
            : "bg-gradient-to-b from-white/14 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "hover:bg-white/5",
      )}
    >
      {active && !collapsed ? (
        <span
          className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-hoolclone-yellow-500"
          aria-hidden
        />
      ) : null}

      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
          active
            ? "border-transparent bg-white text-hoolclone-green-900 shadow-sm"
            : "border-white/12 bg-hoolclone-green-800/70 text-white group-hover:border-white/20",
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 2} />
      </span>

      {!collapsed ? (
        <>
          <span
            className={cn(
              "text-sm leading-snug",
              active ? "font-semibold text-white" : "font-medium text-white/85",
            )}
          >
            {label}
          </span>
          {active ? (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-hoolclone-yellow-500" />
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

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

  const navSections: NavSection[] = [
    { label: "Clone core", items: cloneCoreItems },
    { label: "Communication", items: communicationItems },
    {
      label: "Profile",
      items: [{ href: publicHref, label: "Public Profile", icon: User }],
    },
  ];

  return (
    <aside
      className={cn(
        "relative sticky top-0 z-30 flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden text-white transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[4.75rem]" : "w-64",
        isMobileSheet ? "h-full w-full" : "hidden lg:flex",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${SIDEBAR_BG_SRC}')` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-hoolclone-green-950/20"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "shrink-0 border-b border-white/10",
          isCollapsed ? "px-2 py-3" : "px-3 py-3.5",
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

          {!isMobileSheet ? (
            <SidebarCollapseToggle
              collapsed={isCollapsed}
              onToggle={toggle}
              variant="dark"
              className={isCollapsed ? "mt-2" : undefined}
            />
          ) : null}
        </div>
      </div>

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          isCollapsed ? "gap-1.5 px-2 py-2" : "gap-2 px-2.5 py-2",
        )}
      >
        {navSections.map((section) => (
          <div
            key={section.label}
            className={cn("flex flex-col", isCollapsed ? "gap-0.5" : "gap-0.5")}
          >
            {!isCollapsed ? (
              <p className="px-2 pb-0.5 pt-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">
                {section.label}
              </p>
            ) : null}

            {section.items.map((item) => (
              <SidebarNavLink
                key={item.href}
                {...item}
                active={isNavActive(pathname, item.href)}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
                userId={me?.id}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className={cn("shrink-0 border-t border-white/10 p-2")}>
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
      </div>
    </aside>
  );
}
