import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/db/public-profile";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const profile = await getPublicProfileBySlug(slug);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/u/[slug]", error);
    return NextResponse.json(
      { error: "Failed to load public profile" },
      { status: 500 },
    );
  }
}
