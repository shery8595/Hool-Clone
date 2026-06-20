import { CheckCircle2 } from "lucide-react";
import { CloneAvatar } from "@/components/clone/clone-avatar";

type StoredMemoryBannerProps = {
  summary: string;
};

export function StoredMemoryBanner({ summary }: StoredMemoryBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-hoolclone-green-100 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-hoolclone-green-700" />
      <p className="flex-1 text-sm text-hoolclone-green-900">
        Stored to memory — {summary}
      </p>
      <CloneAvatar size="sm" />
    </div>
  );
}
