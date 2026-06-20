import { NextResponse } from "next/server";
import { AuthError, requireUserId } from "@/lib/auth/require-user";
import { storedMemoryToReceipt } from "@/lib/api/memory-mapper";
import { getMemoryAdapter, getMemoryBackendLabel } from "@/lib/memory";

export async function GET() {
  try {
    const userId = await requireUserId();
    const adapter = getMemoryAdapter();
    const stored = await adapter.listMemories(userId);
    const memories = stored.map(storedMemoryToReceipt);

    return NextResponse.json({
      memories,
      backend: getMemoryBackendLabel(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/memories", error);
    return NextResponse.json({ error: "Failed to load memories" }, { status: 500 });
  }
}
