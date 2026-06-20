import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { buildMeResponse, enablePublicProfile } from "@/lib/db/users";

export async function POST() {
  try {
    const me = await requireUser();
    const { slug } = await enablePublicProfile(me.id, me.displayName);
    const updated = await buildMeResponse(me.id);
    return NextResponse.json({ slug, me: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/me/public-profile", error);
    return NextResponse.json(
      { error: "Failed to enable public profile" },
      { status: 500 },
    );
  }
}
