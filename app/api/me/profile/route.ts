import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { buildMeResponse, updateFanProfile } from "@/lib/db/users";

const bodySchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  favoriteTeam: z.string().max(80).optional(),
  rivalTeam: z.string().max(80).optional(),
  preferredStyle: z.string().max(80).optional(),
});

export async function PATCH(request: Request) {
  try {
    const me = await requireUser();
    const body = bodySchema.parse(await request.json());

    await updateFanProfile(me.id, {
      displayName: body.displayName,
      favoriteTeam: body.favoriteTeam,
      rivalTeam: body.rivalTeam,
      preferredStyle: body.preferredStyle,
    });

    const updated = await buildMeResponse(me.id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
    }
    console.error("PATCH /api/me/profile", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
