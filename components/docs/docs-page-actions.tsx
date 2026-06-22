import { DocsCopyPageButton } from "@/components/docs/docs-copy-page-button";

export function DocsPageActions({ markdown }: { markdown: string }) {
  return (
    <div className="mb-6 flex justify-end">
      <DocsCopyPageButton markdown={markdown} />
    </div>
  );
}
