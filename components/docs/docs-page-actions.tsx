import { DocsPageRegistrar } from "@/components/docs/docs-page-context";

export function DocsPageActions({ markdown }: { markdown: string }) {
  return <DocsPageRegistrar markdown={markdown} />;
}
