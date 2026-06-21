"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { docSections } from "@/lib/docs/navigation";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to app
        </Link>
        <Link href="/docs" onClick={onNavigate} className="flex items-center gap-2">
          <HoolCloneLogo size="sm" showWordmark />
        </Link>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-hoolclone-green-700">
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {docSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.pages.map((page) => {
                const href = `/docs/${page.slug}`;
                const active = pathname === href;

                return (
                  <li key={page.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-hoolclone-green-100 font-semibold text-hoolclone-green-900"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
