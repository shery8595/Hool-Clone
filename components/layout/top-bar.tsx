"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HoolCloneLogo } from "@/components/brand/hoolclone-logo";
import { Sidebar } from "./sidebar";
import { WalletButton } from "./wallet-button";
import { useUser } from "@/components/providers/user-provider";

type TopBarProps = {
  title?: string;
  showProfileDropdown?: boolean;
  extra?: React.ReactNode;
};

export function TopBar({
  title,
  showProfileDropdown = true,
  extra,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { me, enablePublic, signOut } = useUser();

  const displayName = me?.displayName ?? "Fan";
  const profileLabel = `${displayName}'s HoolClone`;

  const handleEnablePublic = async () => {
    try {
      const slug = await enablePublic();
      if (slug) router.push(`/u/${slug}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/" className="lg:hidden">
          <HoolCloneLogo size="sm" />
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-hoolclone-green-100 bg-hoolclone-green-100/50 px-3 py-1.5">
          <Trophy className="h-4 w-4 text-hoolclone-green-700" />
          <span className="text-sm font-semibold text-hoolclone-green-900">
            World Cup 2026
          </span>
        </div>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        {title ? (
          <h1 className="text-lg font-bold text-hoolclone-gray-900">{title}</h1>
        ) : showProfileDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="gap-2 font-semibold" />}
            >
              {profileLabel}
              <ChevronDown className="h-4 w-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem disabled>
                {me?.profile.cloneMaturityLabel ?? "Stranger"} ·{" "}
                {me?.profile.memoriesCount ?? 0} memories
              </DropdownMenuItem>
              {me?.publicSlug && me.profile.publicEnabled ? (
                <DropdownMenuItem
                  render={
                    <Link href={`/u/${me.publicSlug}`}>View public profile</Link>
                  }
                />
              ) : (
                <DropdownMenuItem onClick={handleEnablePublic}>
                  Enable public profile
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {extra}
        <WalletButton />
      </div>
    </header>
  );
}
