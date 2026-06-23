"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { useState, type ReactNode } from "react";
import { UserProvider } from "@/components/providers/user-provider";
import { PreloadSidebarBg } from "@/components/layout/preload-sidebar-bg";
import { PREFERRED_SUI_WALLETS, suiWalletFilter } from "@/lib/wallet/config";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  mainnet: { network: "mainnet", url: getJsonRpcFullnodeUrl("mainnet") },
  testnet: { network: "testnet", url: getJsonRpcFullnodeUrl("testnet") },
  devnet: { network: "devnet", url: getJsonRpcFullnodeUrl("devnet") },
});

const defaultNetwork =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as "mainnet" | "testnet" | "devnet") ??
  "mainnet";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
        <WalletProvider
          autoConnect={false}
          preferredWallets={PREFERRED_SUI_WALLETS}
          walletFilter={suiWalletFilter}
          slushWallet={{ name: "HoolClone" }}
        >
          <UserProvider>
            <PreloadSidebarBg />
            {children}
          </UserProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
