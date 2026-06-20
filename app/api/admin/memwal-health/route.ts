import { NextResponse } from "next/server";
import { getEnv, isMemWalConfigured } from "@/lib/env";
import { getMemWalClient } from "@/lib/memory/memwal-client";

function isAdminAllowed(request: Request): boolean {
  const env = getEnv();
  if (env.NODE_ENV === "development") return true;

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  return request.headers.get("x-admin-secret") === secret;
}

export async function GET(request: Request) {
  if (!isAdminAllowed(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isMemWalConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message:
        "Set MEMWAL_ACCOUNT_ID and MEMWAL_DELEGATE_PRIVATE_KEY in .env",
    });
  }

  try {
    const memwal = await getMemWalClient();
    const health = await memwal.health();
    const ok =
      health.status === "ok" ||
      health.status === "healthy" ||
      health.status === "up";

    return NextResponse.json({
      ok,
      configured: true,
      status: health.status,
      version: health.version,
      relayerVersion: health.relayerVersion,
      apiVersion: health.apiVersion,
      mode: health.mode,
    });
  } catch (error) {
    console.error("GET /api/admin/memwal-health", error);
    return NextResponse.json({
      ok: false,
      configured: true,
      message: error instanceof Error ? error.message : "Health check failed",
    });
  }
}
