"use client";

import { DocsCopyPageButton } from "@/components/docs/docs-copy-page-button";
import { useDocsPage } from "@/components/docs/docs-page-context";

export function DocsToolbar() {
  const { markdown } = useDocsPage();

  return (
    <div className="sticky top-[6.75rem] z-20 flex items-center justify-end gap-3 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur-md sm:px-6 lg:px-10">
      <DocsCopyPageButton markdown={markdown || undefined} />
    </div>
  );
}
