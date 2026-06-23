"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { docSections } from "@/lib/docs/navigation";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { cn } from "@/lib/utils";

export function DocsSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const docsHomeActive = pathname === "/docs";

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-r border-border bg-[#fafafa]",
        className,
      )}
    >
      <div className="border-b border-border px-4 py-4 lg:hidden">
        <Link href="/" onClick={onNavigate} className="inline-block">
          <HoolCloneLogo size="sm" showWordmark />
        </Link>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to app
        </Link>
      </div>

      <nav className="px-3 py-5">
        <div className="mb-6">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Index
          </p>
          <Link
            href="/docs"
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-2 py-1.5 text-sm transition-colors",
              docsHomeActive
                ? "bg-hoolclone-green-50 font-medium text-hoolclone-green-800"
                : "text-muted-foreground hover:bg-white hover:text-foreground",
            )}
          >
            Introduction
          </Link>
        </div>

        {docSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
                        "block rounded-lg px-2 py-1.5 text-sm leading-snug transition-colors",
                        active
                          ? "bg-hoolclone-green-50 font-medium text-hoolclone-green-800"
                          : "text-muted-foreground hover:bg-white hover:text-foreground",
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
