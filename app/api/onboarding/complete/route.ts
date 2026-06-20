import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth/require-user";
import { buildMeResponse } from "@/lib/db/users";
import { completeOnboarding } from "@/lib/onboarding/service";

export async function POST() {
  try {
    const me = await requireUser();
    await completeOnboarding(me.id);
    const updated = await buildMeResponse(me.id);
    return NextResponse.json({
      maturityLabel: updated?.profile.cloneMaturityLabel ?? me.profile.cloneMaturityLabel,
      onboardingComplete: true,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/onboarding/complete", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
