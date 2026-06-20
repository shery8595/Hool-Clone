import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicProfileNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-white p-12 text-center">
      <h1 className="text-xl font-bold">Profile not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This slug does not exist or the fan has not enabled their public
        profile yet.
      </p>
      <Button
        className="mt-6"
        render={<Link href="/profile/public">Enable your public profile</Link>}
      />
    </div>
  );
}
