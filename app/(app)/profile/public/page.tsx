"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/components/providers/user-provider";

export default function PublicProfileSetupPage() {
  const router = useRouter();
  const { me, enablePublic } = useUser();

  const handleEnable = async () => {
    try {
      const slug = await enablePublic();
      if (slug) router.push(`/u/${slug}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (me?.publicSlug && me.profile.publicEnabled) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="space-y-4 p-8 text-center">
            <Globe className="mx-auto h-10 w-10 text-hoolclone-green-700" />
            <h1 className="text-xl font-bold">Your public profile is live</h1>
            <p className="text-sm text-muted-foreground">
              Judges and other fans can view your clone maturity, predictions,
              memory receipts, and evolution timeline.
            </p>
            <Button
              render={
                <Link href={`/u/${me.publicSlug}`}>
                  View /u/{me.publicSlug}
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="space-y-4 p-8">
          <div className="flex items-center gap-3">
            <Share2 className="h-8 w-8 text-hoolclone-green-700" />
            <div>
              <h1 className="text-xl font-bold">Enable public profile</h1>
              <p className="text-sm text-muted-foreground">
                Share a read-only page for judges and friends.
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>· Memory count and clone maturity level</li>
            <li>· Prediction history with human vs clone picks</li>
            <li>· Public memory receipts and Walrus-backed evidence</li>
            <li>· Memory Time Machine (Day 1 → Day 7 clone evolution)</li>
            <li>· Bias radar and evolution timeline</li>
          </ul>

          {!me ? (
            <p className="rounded-xl bg-muted p-4 text-sm">
              Connect your wallet first to publish a profile.
            </p>
          ) : (
            <Button
              variant="accent"
              className="w-full"
              onClick={() => void handleEnable()}
            >
              Publish my HoolClone profile
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
