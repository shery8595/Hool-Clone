"use client";

import { DocsScrollPanel } from "@/components/docs/docs-scroll-panel";
import { List } from "lucide-react";
import { useEffect, useState } from "react";
import type { DocHeading } from "@/lib/docs/extract-headings";
import { cn } from "@/lib/utils";

export function DocsTableOfContents({ headings }: { headings: DocHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <DocsScrollPanel className="sticky top-[6.75rem] pb-10 pl-6">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
          <List className="h-3.5 w-3.5 text-muted-foreground" />
          On this page
        </p>
        <nav className="space-y-1 border-l border-border pl-3">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={cn(
                "block py-1 text-sm leading-snug transition-colors",
                heading.level === 3 && "pl-3",
                activeId === heading.id
                  ? "font-medium text-hoolclone-green-700"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      </DocsScrollPanel>
    </aside>
  );
}
