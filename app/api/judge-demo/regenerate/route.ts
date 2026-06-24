import { NextResponse } from "next/server";
import { generateClonePrediction } from "@/lib/clone/generate-clone-prediction";
import { getJudgeDemoUserId } from "@/lib/judge-demo/demo-user";
import { checkRateLimit, clientIp } from "@/lib/judge-demo/rate-limit";
import { getUserPredictionForMatch } from "@/lib/db/predictions";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";

const MATCH_ID = "m071";
const RATE_MAX = 12;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(
    `judge-demo:regenerate:${ip}`,
    RATE_MAX,
    RATE_WINDOW_MS,
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  const userId = await getJudgeDemoUserId();
  if (!userId) {
    return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
  }

  try {
    const result = await generateClonePrediction(userId, MATCH_ID, {
      bumpVersion: true,
      emphasizeCorrections: true,
    });
    const prediction = await getUserPredictionForMatch(userId, MATCH_ID);
    const agreed =
      prediction && result.clone
        ? predictionsAgree(prediction, result.clone)
        : undefined;

    return NextResponse.json({
      ...result,
      prediction,
      agreed,
    });
  } catch (error) {
    console.error("POST /api/judge-demo/regenerate", error);
    const message =
      error instanceof Error ? error.message : "Failed to regenerate clone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
