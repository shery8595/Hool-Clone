import Link from "next/link";
import { Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type CloneClashCtaProps = {
  slug?: string;
};

export function CloneClashCta(_props: CloneClashCtaProps = {}) {
  return (
    <Card className="rounded-2xl border border-hoolclone-green-200 bg-gradient-to-r from-hoolclone-green-50 to-white shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-hoolclone-green-700" />
            <h3 className="text-base font-bold">Clone Arena</h3>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Challenge leaderboard clones in Walrus-backed namespace vs namespace
            debates on real fixtures.
          </p>
        </div>
        <Link
          href="/arena"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-hoolclone-green-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-hoolclone-green-900"
        >
          Enter arena
        </Link>
      </CardContent>
    </Card>
  );
}
