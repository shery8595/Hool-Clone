import { NextResponse } from "next/server";
import { getArenaRecord } from "@/lib/db/clash-bouts";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const record = await getArenaRecord(slug);
    return NextResponse.json({ slug, ...record });
  } catch (error) {
    console.error("GET /api/arena/record/[slug]", error);
    return NextResponse.json(
      { error: "Failed to load arena record" },
      { status: 500 },
    );
  }
}
