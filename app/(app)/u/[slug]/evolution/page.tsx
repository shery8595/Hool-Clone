import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  EvolutionProofPage,
  parseComparePhase,
} from "@/components/evolution/evolution-proof-page";
import { getPublicProfileBySlug } from "@/lib/db/public-profile";
import { evolutionDataFromPublicProfile } from "@/lib/evolution/build-evolution-page";

export const dynamic = "force-dynamic";

type EvolutionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ compare?: string }>;
};

export async function generateMetadata({
  params,
}: EvolutionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return { title: "Evolution not found · HoolClone" };
  return {
    title: `${profile.displayName}'s Clone Evolution · HoolClone`,
    description:
      "Day 1 vs Day 7 clone evolution — memory receipts, contradictions, and drift.",
  };
}

export default async function PublicEvolutionPage({
  params,
  searchParams,
}: EvolutionPageProps) {
  const { slug } = await params;
  const { compare } = await searchParams;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) notFound();

  return (
    <EvolutionProofPage
      data={evolutionDataFromPublicProfile(profile)}
      comparePhase={parseComparePhase(compare)}
      showBackLink
    />
  );
}
