import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { getEnv } from "@/lib/env";

let suiClient: SuiJsonRpcClient | null = null;

function getSuiVerifyClient(): SuiJsonRpcClient {
  if (!suiClient) {
    const network = getEnv().SUI_NETWORK;
    suiClient = new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl(network),
      network,
    });
  }
  return suiClient;
}

export async function verifyWalletPersonalMessage(input: {
  message: string;
  signature: string;
  walletAddress: string;
}): Promise<void> {
  const bytes = new TextEncoder().encode(input.message);
  await verifyPersonalMessageSignature(bytes, input.signature, {
    address: input.walletAddress,
    client: getSuiVerifyClient(),
  });
}
