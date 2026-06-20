import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";

const SUI_SIGN_FEATURES = ["sui:signTransaction", "sui:signTransactionBlock"] as const;

/** Sui-native wallets first; exclude Phantom (injects on all pages and spams console). */
export const PREFERRED_SUI_WALLETS = ["Slush", "Sui Wallet"];

export function suiWalletFilter(wallet: WalletWithRequiredFeatures): boolean {
  const name = wallet.name.toLowerCase();
  if (name.includes("phantom")) return false;

  return SUI_SIGN_FEATURES.some((feature) => wallet.features[feature]);
}
