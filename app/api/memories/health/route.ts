import { NextResponse } from "next/server";
import { isMemWalConfigured } from "@/lib/env";
import { getMemoryAdapter, getMemoryBackendLabel } from "@/lib/memory";

export async function GET() {
  const backend = getMemoryBackendLabel();
  const configured = backend === "Local" || isMemWalConfigured();

  try {
    const adapter = getMemoryAdapter();
    const health = await Promise.race([
      adapter.health(),
      new Promise<{ ok: boolean; message?: string }>((resolve) =>
        setTimeout(
          () => resolve({ ok: false, message: "Health check timed out" }),
          4000,
        ),
      ),
    ]);
    return NextResponse.json({
      ok: health.ok,
      backend,
      configured,
      message: health.message,
    });
  } catch (error) {
    console.error("GET /api/memories/health", error);
    return NextResponse.json({
      ok: false,
      backend,
      configured,
      message: error instanceof Error ? error.message : "Health check failed",
    });
  }
}
