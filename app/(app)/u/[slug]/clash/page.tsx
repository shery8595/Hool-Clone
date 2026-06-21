import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  searchParams: Promise<{ opponent?: string; match?: string }>;
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
  const { opponent } = await searchParams;

  if (!opponent?.trim()) {
    notFound();
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href={`/u/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-hoolclone-green-800 hover:underline"
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
        level={profileA.level}
        slug={profileA.slug}
        activeTab="clash"
        clashOpponent={opponent.trim()}
      />

      <ClashDebate
        slugA={slug}
        slugB={opponent.trim()}
        participantA={participantA}
        participantB={participantB}
      />
    </div>
  );
}
