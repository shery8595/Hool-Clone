"use client";

import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsToolbar } from "@/components/docs/docs-toolbar";
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed";
import { cn } from "@/lib/utils";

const DOCS_SIDEBAR_KEY = "hoolclone-docs-sidebar-collapsed";
const DOCS_SIDEBAR_WIDTH_EXPANDED = "18rem";
const DOCS_SIDEBAR_WIDTH_COLLAPSED = "4.75rem";

export function DocsLayoutShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle, hydrated } = useSidebarCollapsed(DOCS_SIDEBAR_KEY);
  const sidebarWidth = collapsed
    ? DOCS_SIDEBAR_WIDTH_COLLAPSED
    : DOCS_SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="min-h-screen bg-hoolclone-page-bg">
      <div
        className="fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 ease-in-out lg:block"
        style={{ width: sidebarWidth }}
      >
        <DocsSidebar collapsed={collapsed} onToggleCollapsed={toggle} />
      </div>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-300 ease-in-out",
          hydrated && "lg:pl-[var(--docs-sidebar-width)]",
        )}
        style={
          hydrated
            ? ({ "--docs-sidebar-width": sidebarWidth } as React.CSSProperties)
            : undefined
        }
      >
        <DocsMobileNav />
        <div className="hidden lg:block">
          <DocsToolbar />
        </div>
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
