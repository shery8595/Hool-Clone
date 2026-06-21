import { NextResponse } from "next/server";
import {
  buildLineageContextFromMemories,
  buildMemoryLineage,
} from "@/lib/api/memory-lineage";
import { getMemoryByWalrusBlobId } from "@/lib/memory/postgres-memory";
import {
  fetchWalrusBlobRaw,
  isPlaceholderBlobId,
  isValidWalrusBlobId,
  walrusExplorerLinks,
} from "@/lib/walrus/fetch-blob";
import { parseBlobPayload } from "@/lib/walrus/parse-blob-payload";
import type { WalrusBlobProof } from "@/lib/clash/types";

type RouteParams = { params: Promise<{ blobId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { blobId: rawBlobId } = await params;
  const blobId = decodeURIComponent(rawBlobId);

  if (isPlaceholderBlobId(blobId)) {
    return NextResponse.json(
      {
        error: "Placeholder blob ID — run db:seed-demo-walrus for Mainnet blobs",
        isPlaceholder: true,
        blobId,
      },
      { status: 422 },
    );
  }

  if (!isValidWalrusBlobId(blobId)) {
    return NextResponse.json({ error: "Invalid Walrus blob ID" }, { status: 400 });
  }

  try {
    const [blobResult, storedMemory] = await Promise.all([
      fetchWalrusBlobRaw(blobId),
      getMemoryByWalrusBlobId(blobId),
    ]);

    const parsed = parseBlobPayload(blobResult.rawText);
    const metadata = storedMemory?.metadata ?? {};
    const lineageContext = storedMemory
      ? buildLineageContextFromMemories([storedMemory])
      : undefined;
    const lineage = storedMemory
      ? buildMemoryLineage(storedMemory, lineageContext)
      : [];

    const proof: WalrusBlobProof = {
      blobId,
      rawText: blobResult.rawText,
      byteLength: blobResult.byteLength,
      fetchedAt: new Date().toISOString(),
      parsed,
      appMetadata: storedMemory
        ? {
            memoryId: storedMemory.id,
            namespace:
              typeof metadata.walrusNamespace === "string"
                ? metadata.walrusNamespace
                : undefined,
            jobId:
              typeof metadata.walrusJobId === "string"
                ? metadata.walrusJobId
                : undefined,
            createdAt: storedMemory.createdAt,
            storageStatus: storedMemory.storageStatus,
            text: storedMemory.text,
          }
        : null,
      lineage,
      explorerLinks: walrusExplorerLinks(blobId),
      isPlaceholder: false,
    };

    return NextResponse.json(proof, {
      headers: {
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/walrus/blobs", blobId, error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch Walrus blob";
    return NextResponse.json({ error: message, blobId }, { status: 502 });
  }
}
