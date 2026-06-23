"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/components/providers/user-provider";
import { LEADERBOARD_URL } from "@/lib/landing/content";

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
            <div className="flex flex-col gap-2">
              <Button
                render={
                  <Link href={`/u/${me.publicSlug}`}>
                    View /u/{me.publicSlug}
                  </Link>
                }
              />
              <ButtonLink
                href={LEADERBOARD_URL}
                variant="outline"
                className="gap-2"
              >
                <Trophy className="h-4 w-4 text-hoolclone-yellow-600" />
                View global leaderboard
              </ButtonLink>
            </div>
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
            <div className="space-y-3">
              <p className="rounded-xl bg-muted p-4 text-sm">
                Connect your wallet first to publish a profile.
              </p>
              <ButtonLink
                href={LEADERBOARD_URL}
                variant="outline"
                className="w-full gap-2"
              >
                <Trophy className="h-4 w-4 text-hoolclone-yellow-600" />
                View global leaderboard
              </ButtonLink>
            </div>
          ) : (
            <>
              <Button
                variant="accent"
                className="w-full"
                onClick={() => void handleEnable()}
              >
                Publish my HoolClone profile
              </Button>
              <ButtonLink
                href={LEADERBOARD_URL}
                variant="outline"
                className="w-full gap-2"
              >
                <Trophy className="h-4 w-4 text-hoolclone-yellow-600" />
                View global leaderboard
              </ButtonLink>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
