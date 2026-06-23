import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClashDebate } from "@/components/clash/clash-debate";
import { ProfileHeader } from "@/components/profile/profile-header";
import {
  getPublicProfileBySlug,
  getPublicProfileIdsBySlug,
} from "@/lib/db/public-profile";
import type { CloneMaturity } from "@/lib/mock/types";

export const dynamic = "force-dynamic";

type ClashPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ opponent?: string; match?: string; from?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: ClashPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { opponent } = await searchParams;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return { title: "Clash not found · HoolClone" };
  return {
    title: opponent
      ? `${profile.displayName} vs ${opponent} · Clone Clash`
      : `Clone Clash · ${profile.displayName}`,
    description:
      "Two Walrus namespaces, one fixture — hooligan clones debate with memory receipts.",
  };
}

export default async function ClashPage({
  params,
  searchParams,
}: ClashPageProps) {
  const { slug } = await params;
  const { opponent, from } = await searchParams;

  if (!opponent?.trim()) {
    redirect("/arena");
  }

  const [profileA, profileB, participantA, participantB] = await Promise.all([
    getPublicProfileBySlug(slug),
    getPublicProfileBySlug(opponent.trim()),
    getPublicProfileIdsBySlug(slug),
    getPublicProfileIdsBySlug(opponent.trim()),
  ]);

  if (!profileA || !profileB || !participantA || !participantB) {
    notFound();
  }

  const walrusBackedCount = profileA.allMemoryReceipts.filter(
    (r) => r.storageStatus === "stored" && r.walrusBlobId,
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <Link
        href={`/u/${slug}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-sm font-semibold text-hoolclone-green-800 shadow-sm transition hover:bg-hoolclone-green-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <ProfileHeader
        displayName={profileA.displayName}
        handle={profileA.handle}
        bio={profileA.bio}
        joinedAt={profileA.joinedAt}
        maturityLabel={profileA.maturityLabel as CloneMaturity}
        displayLevel={profileA.level}
        displayMaxLevel={profileA.maxLevel}
        memoriesCount={profileA.memoriesCount}
        predictionsCount={profileA.predictionsCount}
        cloneMatchPercent={profileA.cloneMatchPercent}
        walrusBackedCount={walrusBackedCount}
        slug={profileA.slug}
        activeTab="clash"
        cloneMood={profileA.cloneAnalytics.cloneMood}
      />

      <ClashDebate
        slugA={slug}
        slugB={opponent.trim()}
        participantA={participantA}
        participantB={participantB}
        fromArena={from === "arena"}
      />
    </div>
  );
}
