"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  ExternalLink,
  Database,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BrainBlocksTimeline } from "@/components/memory/brain-blocks-timeline";
import { fetchWalrusBlobProof } from "@/lib/api/client";
import type { WalrusBlobProof } from "@/lib/clash/types";
import type { MemoryReceipt } from "@/lib/mock/types";
import { tokenizeBlobPayload } from "@/lib/walrus/parse-blob-payload";
import { cn } from "@/lib/utils";

type WalrusBlobExplorerSheetProps = {
  receipt: MemoryReceipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const tokenClass: Record<string, string> = {
  type: "text-violet-600 font-semibold",
  text: "text-foreground",
  "tag-key": "text-sky-600",
  "tag-value": "text-emerald-600",
  bracket: "text-muted-foreground",
};

export function WalrusBlobExplorerSheet({
  receipt,
  open,
  onOpenChange,
}: WalrusBlobExplorerSheetProps) {
  const [proof, setProof] = useState<WalrusBlobProof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const blobId = receipt?.walrusBlobId;

  const loadProof = useCallback(async () => {
    if (!blobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWalrusBlobProof(blobId);
      setProof(data);
    } catch (err) {
      setProof(null);
      setError(err instanceof Error ? err.message : "Failed to load blob");
    } finally {
      setLoading(false);
    }
  }, [blobId]);

  useEffect(() => {
    if (open && blobId) {
      void loadProof();
    } else {
      setProof(null);
      setError(null);
    }
  }, [open, blobId, loadProof]);

  const lineage =
    proof?.lineage && proof.lineage.length > 0
      ? proof.lineage
      : (receipt?.lineage ?? []);

  const copyBlobId = async () => {
    if (!blobId) return;
    await navigator.clipboard.writeText(blobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokens = proof ? tokenizeBlobPayload(proof.rawText) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-hoolclone-green-700" />
            MemWal Block Explorer
          </SheetTitle>
          <SheetDescription>
            Raw bytes from Walrus Mainnet — not a database mock.
          </SheetDescription>
        </SheetHeader>

        {!receipt ? null : (
          <div className="mt-6 space-y-6 px-1 pb-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Memory receipt
              </h3>
              <p className="mt-2 text-sm leading-relaxed">{receipt.text}</p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Brain blocks timeline
              </h3>
              <div className="mt-3">
                <BrainBlocksTimeline steps={lineage} />
              </div>
            </section>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching from Walrus aggregator…
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Could not fetch blob
                </div>
                <p className="mt-1 text-muted-foreground">{error}</p>
                {blobId?.startsWith("demo-blob-") && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Run{" "}
                    <code className="rounded bg-muted px-1">npm run db:seed-demo-walrus</code>{" "}
                    for real Mainnet blob IDs.
                  </p>
                )}
              </div>
            )}

            {proof && (
              <>
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Raw Walrus payload
                  </h3>
                  <pre className="mt-2 overflow-x-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
                    {tokens.map((token, i) => (
                      <span key={i} className={cn(tokenClass[token.kind])}>
                        {token.value}
                      </span>
                    ))}
                  </pre>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {proof.byteLength} bytes · fetched{" "}
                    {new Date(proof.fetchedAt).toLocaleString()}
                  </p>
                </section>

                {proof.appMetadata && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      App metadata
                    </h3>
                    <dl className="mt-2 space-y-2 text-xs">
                      {proof.appMetadata.namespace && (
                        <div>
                          <dt className="font-semibold text-muted-foreground">
                            Namespace
                          </dt>
                          <dd className="font-mono break-all">
                            {proof.appMetadata.namespace}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="font-semibold text-muted-foreground">
                          Storage status
                        </dt>
                        <dd>{proof.appMetadata.storageStatus}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-muted-foreground">
                          Written
                        </dt>
                        <dd>
                          {new Date(
                            proof.appMetadata.createdAt,
                          ).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}
              </>
            )}

            {blobId && (
              <section className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyBlobId()}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy blob ID"}
                </Button>
                {proof?.explorerLinks.aggregator && (
                  <a
                    href={proof.explorerLinks.aggregator}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open aggregator
                  </a>
                )}
                {proof?.explorerLinks.walruscan && (
                  <a
                    href={proof.explorerLinks.walruscan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Walruscan
                  </a>
                )}
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
