import type { Metadata } from "next";
import { DocsLayoutShell } from "@/components/docs/docs-layout-shell";
import { DocsPageProvider } from "@/components/docs/docs-page-context";

export const metadata: Metadata = {
  title: "Documentation — HoolClone",
  description:
    "Complete documentation for HoolClone: Walrus Memory, deployment, API, Telegram, and demo guide.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocsPageProvider>
      <DocsLayoutShell>{children}</DocsLayoutShell>
    </DocsPageProvider>
  );
}
