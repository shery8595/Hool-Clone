import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import {
  EvolutionProofPage,
  parseComparePhase,
} from "@/components/evolution/evolution-proof-page";
import { getOptionalUserId } from "@/lib/auth/require-user";
import { buildEvolutionPageData } from "@/lib/evolution/build-evolution-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clone Evolution · HoolClone",
  description:
    "Day 1 vs Day 7 clone evolution — memory receipts, contradictions, and Walrus proof.",
};

type EvolutionAppPageProps = {
  searchParams: Promise<{ compare?: string }>;
};

const getEvolutionPageData = unstable_cache(
  async (userId: string) =>
    buildEvolutionPageData(userId, { isPublicView: false }),
  ["evolution-page-data"],
  { revalidate: 30 },
);

export default async function EvolutionAppPage({
  searchParams,
}: EvolutionAppPageProps) {
  const userId = await getOptionalUserId();
  if (!userId) {
    redirect("/dashboard");
  }

  const { compare } = await searchParams;
  const comparePhase = parseComparePhase(compare);

  const data = await getEvolutionPageData(userId);
  if (!data) {
    redirect("/dashboard");
  }

  return (
    <EvolutionProofPage
      data={data}
      comparePhase={comparePhase}
      showBackLink
    />
  );
}
