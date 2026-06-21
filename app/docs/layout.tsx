import type { Metadata } from "next";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

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
    <div className="flex min-h-screen bg-hoolclone-page-bg">
      <div className="hidden lg:block">
        <DocsSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DocsMobileNav />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
