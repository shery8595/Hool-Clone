"use client";

import { Wallet } from "lucide-react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/mock/demo-user";
import { suiWalletFilter } from "@/lib/wallet/config";
import { useUser } from "@/components/providers/user-provider";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const account = useCurrentAccount();
  const { loading } = useUser();
  const connected = Boolean(account?.address);

  return (
    <div className="relative hidden sm:block">
      {connected && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-hoolclone-green-900"
          disabled={loading}
        >
          <Wallet className="h-4 w-4" />
          {loading ? "Syncing..." : truncateAddress(account!.address)}
        </Button>
      )}
      {/* Keep ConnectButton mounted to avoid dialog controlled/uncontrolled warnings */}
      <div
        className={cn(
          connected && "pointer-events-none absolute inset-0 opacity-0",
          !connected &&
            "[&_button]:h-8 [&_button]:rounded-full [&_button]:border [&_button]:border-white/90 [&_button]:bg-gradient-to-b [&_button]:from-white [&_button]:to-hoolclone-gray-50 [&_button]:px-4 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-hoolclone-green-900 [&_button]:shadow-[5px_5px_14px_var(--btn-neu-shadow),-4px_-4px_12px_var(--btn-neu-highlight),inset_0_1px_0_rgba(255,255,255,0.9)] [&_button]:transition-all [&_button]:duration-200 hover:[&_button]:shadow-[6px_6px_16px_var(--btn-neu-shadow),-5px_-5px_14px_var(--btn-neu-highlight)] active:[&_button]:translate-y-px active:[&_button]:shadow-[inset_4px_4px_10px_var(--btn-neu-inset),inset_-2px_-2px_8px_var(--btn-neu-highlight)]",
        )}
        aria-hidden={connected}
      >
        <ConnectButton connectText="Connect wallet" walletFilter={suiWalletFilter} />
      </div>
    </div>
  );
}
