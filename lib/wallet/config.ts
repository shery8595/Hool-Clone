import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";

/**
 * Shown first in the connect modal when installed.
 * Includes native Sui wallets, Phantom (Sui), and popular browser extensions.
 */
export const PREFERRED_SUI_WALLETS = [
  "Slush",
  "Sui Wallet",
  "Phantom",
  "Suiet",
  "Nightly",
  "Martian",
  "Surf",
  "OKX Wallet",
  "Ethos",
  "WalletConnect",
];

const REQUIRED_AUTH_FEATURES = ["sui:signPersonalMessage"] as const;

/**
 * HoolClone signs a personal message on connect — wallet must expose this feature.
 * Does not exclude Phantom or any other wallet that supports Sui auth.
 */
export function suiWalletFilter(wallet: WalletWithRequiredFeatures): boolean {
  return REQUIRED_AUTH_FEATURES.some((feature) => feature in wallet.features);
}
