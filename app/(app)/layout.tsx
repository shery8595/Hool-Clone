import { PrefetchOnAuth } from "@/components/layout/prefetch-on-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <PrefetchOnAuth />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto bg-hoolclone-page-bg p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
