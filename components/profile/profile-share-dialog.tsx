"use client";

import { useCallback, useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  Check,
  Copy,
  Download,
  Link2,
  Share2,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileShareCardPreview } from "@/components/profile/profile-share-card-preview";
import {
  buildPublicProfileUrl,
  buildShareCardTweet,
  renderShareCardBlob,
  type ShareCardData,
} from "@/lib/profile/share-card";
import { cn } from "@/lib/utils";

export type ProfileShareCardInput = Omit<ShareCardData, "profileUrl">;

type ProfileShareDialogProps = {
  slug: string;
  card: ProfileShareCardInput;
  className?: string;
};

type ActionState = "idle" | "loading" | "done" | "error";

export function ProfileShareDialog({
  slug,
  card,
  className,
}: ProfileShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [downloadState, setDownloadState] = useState<ActionState>("idle");

  const shareCardData = useMemo<ShareCardData>(() => {
    return {
      ...card,
      profileUrl: buildPublicProfileUrl(slug),
    };
  }, [card, slug]);

  const exportBlob = useCallback(async () => {
    return renderShareCardBlob(shareCardData);
  }, [shareCardData]);

  const handleDownload = useCallback(async () => {
    setDownloadState("loading");
    try {
      const blob = await exportBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `hoolclone-${card.handle}.png`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      setDownloadState("done");
      window.setTimeout(() => setDownloadState("idle"), 2000);
    } catch {
      setDownloadState("error");
      window.setTimeout(() => setDownloadState("idle"), 2500);
    }
  }, [card.handle, exportBlob]);

  const handleCopyImage = useCallback(async () => {
    try {
      const blob = await exportBlob();
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("Clipboard image copy is not supported in this browser");
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setImageCopied(true);
      window.setTimeout(() => setImageCopied(false), 2000);
    } catch {
      window.alert(
        "Could not copy the image. Try downloading it instead, then paste manually.",
      );
    }
  }, [exportBlob]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareCardData.profileUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy this judge URL:", shareCardData.profileUrl);
    }
  }, [shareCardData.profileUrl]);

  const handleShareOnX = useCallback(() => {
    const text = buildShareCardTweet(shareCardData);
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", text);
    intent.searchParams.set("url", shareCardData.profileUrl);
    window.open(intent.toString(), "_blank", "noopener,noreferrer");
  }, [shareCardData]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="accent" className={className}>
            <Share2 className="mr-2 h-4 w-4" />
            Share profile
          </Button>
        }
      />

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-ending-style:opacity-0 data-starting-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-hoolclone-green-200/70 bg-white p-4 shadow-2xl sm:p-5",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            "transition duration-200",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-lg font-bold text-hoolclone-green-950">
                Share your HoolClone
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Download or copy a judge-ready card, then share your public
                profile link on X.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                />
              }
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <ProfileShareCardPreview data={shareCardData} className="mb-4" />

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownload()}
              disabled={downloadState === "loading"}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloadState === "done"
                ? "Downloaded"
                : downloadState === "error"
                  ? "Try again"
                  : "Download"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleCopyImage()}>
              {imageCopied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {imageCopied ? "Image copied" : "Copy image"}
            </Button>
            <Button type="button" variant="accent" onClick={handleShareOnX}>
              <Share2 className="mr-2 h-4 w-4" />
              Share on X
            </Button>
            <Button type="button" variant="secondary" onClick={() => void handleCopyLink()}>
              {linkCopied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              {linkCopied ? "Link copied" : "Copy link"}
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Copy image first, then paste it into your X post after opening Share
            on X.
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
