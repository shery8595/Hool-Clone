import { NextResponse } from "next/server";
import { storeCloneCorrection } from "@/lib/clone/store-clone-correction";
import { JUDGE_DEMO_CORRECTION_TEXT } from "@/lib/judge-demo/constants";
import { getJudgeDemoUserId } from "@/lib/judge-demo/demo-user";
import { checkRateLimit, clientIp } from "@/lib/judge-demo/rate-limit";
import { getMemoryRowById } from "@/lib/memory/postgres-memory";

const MATCH_ID = "m071";
const RATE_MAX = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(`judge-demo:correct:${ip}`, RATE_MAX, RATE_WINDOW_MS);
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
    const result = await storeCloneCorrection(userId, MATCH_ID, {
      correctionText: JUDGE_DEMO_CORRECTION_TEXT,
      regenerate: false,
    });

    const row = await getMemoryRowById(result.memoryId, userId);
    const metadata = row?.metadata ?? {};
    const walrusBlobId =
      typeof metadata.walrusBlobId === "string" ? metadata.walrusBlobId : undefined;
    const walrusNamespace =
      typeof metadata.walrusNamespace === "string"
        ? metadata.walrusNamespace
        : undefined;

    return NextResponse.json({
      ...result,
      correctionText: JUDGE_DEMO_CORRECTION_TEXT,
      walrusBlobId,
      walrusNamespace,
      memoryText: row?.text,
    });
  } catch (error) {
    console.error("POST /api/judge-demo/correct", error);
    const message =
      error instanceof Error ? error.message : "Failed to store correction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
