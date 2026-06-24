import { NextResponse } from "next/server";
import { isMemWalConfigured } from "@/lib/env";
import { getMemWalClient } from "@/lib/memory/memwal-client";

export const maxDuration = 30;

const HEALTH_TIMEOUT_MS = 8_000;

export async function GET() {
  if (!isMemWalConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      status: "unconfigured",
      message: "MemWal is not configured on this deployment.",
    });
  }

  try {
    const memwal = await getMemWalClient();
    const health = await Promise.race([
      memwal.health(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Health check timed out")), HEALTH_TIMEOUT_MS),
      ),
    ]);

    const ok =
      health.status === "ok" ||
      health.status === "healthy" ||
      health.status === "up";

    return NextResponse.json({
      ok,
      configured: true,
      status: health.status,
      relayerVersion: health.relayerVersion ?? health.version,
    });
  } catch (error) {
    console.error("GET /api/health/memwal", error);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        status: "error",
        message: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 },
    );
  }
}
