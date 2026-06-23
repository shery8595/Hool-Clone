"use client";

import { DocsScrollPanel } from "@/components/docs/docs-scroll-panel";
import { DocsHeader } from "@/components/docs/docs-header";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsTableOfContents } from "@/components/docs/docs-table-of-contents";
import { DocsToolbar } from "@/components/docs/docs-toolbar";
import { useDocsPage } from "@/components/docs/docs-page-context";

export function DocsLayoutShell({ children }: { children: React.ReactNode }) {
  const { headings } = useDocsPage();

  return (
    <div className="docs-layout min-h-screen bg-white">
      <DocsHeader />

      <div className="mx-auto flex w-full max-w-[1400px]">
        <div className="hidden w-64 shrink-0 lg:block">
          <DocsScrollPanel className="sticky top-[6.75rem]">
            <DocsSidebar />
          </DocsScrollPanel>
        </div>

        <div className="min-w-0 flex-1">
          <DocsMobileNav />
          <div className="hidden lg:block">
            <DocsToolbar />
          </div>

          <div className="flex">
            <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div className="mx-auto max-w-3xl">{children}</div>
            </main>
            <DocsTableOfContents headings={headings} />
          </div>
        </div>
      </div>
    </div>
  );
}
