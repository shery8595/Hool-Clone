import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { generateClashDebate } from "@/lib/clash/generate-clash-debate";
import { getPublicProfileIdsBySlug } from "@/lib/db/public-profile";
import { getMatchDataAdapter } from "@/lib/match-data";

type GenerateBody = {
  slugA?: string;
  slugB?: string;
  matchId?: string;
};

async function runClashGenerate(slugA: string, slugB: string, matchId: string) {
  if (slugA.toLowerCase() === slugB.toLowerCase()) {
    return { error: "Choose two different public profiles", status: 400 as const };
  }

  const [participantA, participantB, match] = await Promise.all([
    getPublicProfileIdsBySlug(slugA),
    getPublicProfileIdsBySlug(slugB),
    getMatchDataAdapter().getMatch(matchId),
  ]);

  if (!participantA || !participantB) {
    return { error: "One or both public profiles not found", status: 404 as const };
  }

  if (!match?.homeTeam || !match?.awayTeam) {
    return { error: "Match not found or teams not set", status: 404 as const };
  }

  const result = await generateClashDebate({
    match,
    participantA,
    participantB,
  });

  return { data: result, status: 200 as const };
}

const cachedClashGenerate = unstable_cache(
  async (slugA: string, slugB: string, matchId: string) =>
    runClashGenerate(slugA, slugB, matchId),
  ["clash-generate"],
  { revalidate: 300 },
);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const slugA = body.slugA?.trim();
    const slugB = body.slugB?.trim();
    const matchId = body.matchId?.trim();

    if (!slugA || !slugB || !matchId) {
      return NextResponse.json(
        { error: "slugA, slugB, and matchId are required" },
        { status: 400 },
      );
    }

    const result = await cachedClashGenerate(slugA, slugB, matchId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/clash/generate", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate clash";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
