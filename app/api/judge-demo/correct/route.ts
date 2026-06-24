import { NextResponse } from "next/server";
import { storeCloneCorrection } from "@/lib/clone/store-clone-correction";
import { getJudgeDemoUserId } from "@/lib/judge-demo/demo-user";
import { parseJudgeDemoCorrectionText } from "@/lib/judge-demo/parse-correction-text";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON with correctionText." },
      { status: 400 },
    );
  }

  const parsed =
    body && typeof body === "object" && "correctionText" in body
      ? parseJudgeDemoCorrectionText(
          (body as { correctionText: unknown }).correctionText,
        )
      : { ok: false as const, error: "correctionText is required." };

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await storeCloneCorrection(userId, MATCH_ID, {
      correctionText: parsed.text,
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
      correctionText: parsed.text,
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
