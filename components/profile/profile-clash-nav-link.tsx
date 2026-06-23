"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { buildClashHref } from "@/lib/clash/arena-opponents";
import { cn } from "@/lib/utils";

type ProfileClashNavLinkProps = {
  slug: string;
  active: boolean;
};

export function ProfileClashNavLink({ slug, active }: ProfileClashNavLinkProps) {
  const { me } = useUser();
  const isOwner =
    me?.publicSlug &&
    me.profile.publicEnabled &&
    me.publicSlug.toLowerCase() === slug.toLowerCase();

  const href = isOwner
    ? "/arena"
    : me?.publicSlug && me.profile.publicEnabled
      ? buildClashHref(me.publicSlug, slug)
      : "/arena";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-hoolclone-green-900 text-white shadow-sm"
          : "bg-white text-hoolclone-green-900 ring-1 ring-border/60 hover:bg-hoolclone-green-50",
      )}
    >
      <Swords className="h-3.5 w-3.5" />
      {isOwner ? "Arena" : "Clash"}
    </Link>
  );
}
