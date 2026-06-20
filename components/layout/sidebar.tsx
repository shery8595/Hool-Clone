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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/api/prefetch";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { WalrusMemoryBadge } from "./walrus-memory-badge";
import { useUser } from "@/components/providers/user-provider";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/train", label: "Train", icon: Brain },
  { href: "/predict", label: "Predict", icon: Target },
  { href: "/debate", label: "Debate", icon: MessageCircle },
  { href: "/memory", label: "Memory", icon: Database },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { me } = useUser();

  const publicHref =
    me?.publicSlug && me.profile.publicEnabled
      ? `/u/${me.publicSlug}`
      : "/profile/public";

  const allNavItems = [
    ...navItems,
    { href: publicHref, label: "Public Profile", icon: User },
  ];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-hoolclone-green-900 pitch-pattern text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/" onClick={onNavigate}>
          <HoolCloneLogo size="md" showWordmark />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              onMouseEnter={() => prefetchRoute(href, me?.id)}
              onFocus={() => prefetchRoute(href, me?.id)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-hoolclone-yellow-500" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <WalrusMemoryBadge />
      </div>
    </aside>
  );
}
