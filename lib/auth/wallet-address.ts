import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";

export function normalizeWalletAddress(address: string): string {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid Sui wallet address");
  }
  return normalizeSuiAddress(address);
}

export function walletAddressesMatch(a: string, b: string): boolean {
  try {
    return normalizeWalletAddress(a) === normalizeWalletAddress(b);
  } catch {
    return false;
  }
}
