"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Database } from "lucide-react";
import { docSections } from "@/lib/docs/navigation";
import { docsHomeIcon, getDocPageIcon } from "@/lib/docs/page-icons";
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { SidebarCollapseToggle } from "@/components/layout/sidebar-collapse-toggle";
import { cn } from "@/lib/utils";

const DOCS_SIDEBAR_KEY = "hoolclone-docs-sidebar-collapsed";

export function DocsSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const isMobileSheet = Boolean(onNavigate);
  const { collapsed, toggle } = useSidebarCollapsed(DOCS_SIDEBAR_KEY);
  const isCollapsed = isMobileSheet ? false : collapsed;

  const DocsHomeIcon = docsHomeIcon;
  const docsHomeActive = pathname === "/docs";

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border bg-white transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[4.75rem]" : "w-72",
        isMobileSheet ? "h-full w-full" : "hidden lg:flex",
        className,
      )}
    >
      <div
        className={cn(
          "border-b border-border",
          isCollapsed ? "px-2 py-4" : "px-4 py-5",
        )}
      >
        <div
          className={cn(
            "flex items-start gap-2",
            isCollapsed ? "flex-col items-center" : "justify-between",
          )}
        >
          <Link
            href="/docs"
            onClick={onNavigate}
            className={cn(
              "min-w-0 transition-opacity hover:opacity-90",
              isCollapsed && "flex justify-center",
            )}
            title="Documentation"
          >
            {isCollapsed ? (
              <HoolCloneLogo size="sm" />
            ) : (
              <>
                <HoolCloneLogo size="sm" showWordmark />
                <p className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Documentation
                </p>
              </>
            )}
          </Link>

          {!isMobileSheet && (
            <SidebarCollapseToggle
              collapsed={isCollapsed}
              onToggle={toggle}
              className={isCollapsed ? "mt-3" : undefined}
            />
          )}
        </div>

        {!isCollapsed && (
          <Link
            href="/"
            onClick={onNavigate}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to app
          </Link>
        )}
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-4",
          isCollapsed ? "px-2" : "px-3",
        )}
      >
        <div className={cn("mb-5", isCollapsed && "mb-3")}>
          {!isCollapsed && (
            <p className="mb-2 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/90">
              Index
            </p>
          )}
          <Link
            href="/docs"
            onClick={onNavigate}
            title="Documentation index"
            className={cn(
              "group flex items-center rounded-xl border border-transparent transition-all",
              isCollapsed ? "justify-center p-1.5" : "gap-3 px-2 py-2",
              docsHomeActive
                ? "border-hoolclone-green-200 bg-gradient-to-r from-hoolclone-green-50 to-white"
                : "hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                docsHomeActive
                  ? "border-hoolclone-green-800 bg-hoolclone-green-800 text-white"
                  : "border-border bg-white text-muted-foreground group-hover:border-hoolclone-green-200",
              )}
            >
              <DocsHomeIcon className="h-4 w-4" />
            </span>
            {!isCollapsed && (
              <>
                <span
                  className={cn(
                    "text-sm font-medium",
                    docsHomeActive
                      ? "font-semibold text-hoolclone-green-900"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  Docs home
                </span>
                {docsHomeActive && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-hoolclone-green-700" />
                )}
              </>
            )}
          </Link>
        </div>

        {docSections.map((section) => (
          <div key={section.title} className="mb-5">
            {!isCollapsed && (
              <p className="mb-2 px-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/90">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.pages.map((page) => {
                const href = `/docs/${page.slug}`;
                const active = pathname === href;
                const Icon = getDocPageIcon(page.slug);

                return (
                  <li key={page.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      title={page.title}
                      className={cn(
                        "group flex items-center rounded-xl border border-transparent transition-all",
                        isCollapsed ? "justify-center p-1.5" : "gap-3 px-2 py-2",
                        active
                          ? "border-hoolclone-green-200 bg-gradient-to-r from-hoolclone-green-50 to-white"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          active
                            ? "border-hoolclone-green-800 bg-hoolclone-green-800 text-white"
                            : "border-border bg-white text-muted-foreground group-hover:border-hoolclone-green-200",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {!isCollapsed && (
                        <>
                          <span
                            className={cn(
                              "min-w-0 text-sm font-medium leading-snug",
                              active
                                ? "font-semibold text-hoolclone-green-900"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {page.title}
                          </span>
                          {active && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-hoolclone-green-700" />
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "mt-auto border-t border-border",
          isCollapsed ? "p-2" : "p-3",
        )}
      >
        {isCollapsed ? (
          <div
            className="flex justify-center py-1"
            title="Powered by Walrus Memory"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-hoolclone-green-50 text-hoolclone-green-800">
              <Database className="h-4 w-4" />
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Powered by
            </p>
            <p className="mt-0.5 text-xs font-bold text-hoolclone-green-800">
              Walrus Memory
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
