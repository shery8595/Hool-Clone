import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { TelegramHistoryList } from "@/components/telegram/telegram-history-list";
import { DEMO_SLUG } from "@/lib/db/demo-memories";
import { getPublicProfileBySlug } from "@/lib/db/public-profile";
import { buildDemoTelegramHistory } from "@/lib/telegram/demo-telegram-history";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== DEMO_SLUG) {
    return { title: "Telegram history not found · HoolClone" };
  }
  return {
    title: "Demo Telegram loop · HoolClone",
    description:
      "Public post-match Telegram roasts with Walrus memory citations — judge proof.",
  };
}

export default async function PublicTelegramHistoryPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug !== DEMO_SLUG) notFound();

  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  const messages = buildDemoTelegramHistory(
    profile.allMemoryReceipts.map((m) => ({
      id: m.id,
      text: m.text,
      walrusBlobId: m.walrusBlobId,
      date: m.date,
    })),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link
        href={`/u/${slug}/evolution`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-sm font-semibold text-hoolclone-green-800 shadow-sm transition hover:bg-hoolclone-green-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to evolution proof
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-hoolclone-green-700">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            Telegram · Public demo
          </span>
        </div>
        <h1 className="text-2xl font-bold text-hoolclone-green-950">
          Post-match loop
        </h1>
        <p className="text-sm text-muted-foreground">
          Curated Telegram-style cards showing how post-match roasts cite Walrus
          memories and write new blobs that shape the next clone recall. No
          wallet required for judges.
        </p>
      </header>

      <TelegramHistoryList messages={messages} />
    </div>
  );
}
