export type MemWalNetwork = "mainnet" | "testnet";

export type RelayerConfig = {
  packageId: string;
  network: MemWalNetwork;
  suiRpcUrl: string;
};

/** On-chain registry object IDs — see https://docs.memwal.ai/contract/overview */
const REGISTRY_BY_NETWORK: Record<MemWalNetwork, string> = {
  mainnet: "0x0da982cefa26864ae834a8a0504b904233d49e20fcc17c373c8bed99c75a7edd",
  testnet: "0xe80f2feec1c139616a86c9f71210152e2a7ca552b20841f2e192f99f75864437",
};

const DEFAULT_RELAYER_BY_NETWORK: Record<MemWalNetwork, string> = {
  mainnet: "https://relayer.memwal.ai",
  testnet: "https://relayer.staging.memwal.ai",
};

export function getDefaultRelayerUrl(network: MemWalNetwork): string {
  return DEFAULT_RELAYER_BY_NETWORK[network];
}

export function getRegistryId(
  network: MemWalNetwork,
  override?: string,
): string {
  return override ?? REGISTRY_BY_NETWORK[network];
}

export async function fetchRelayerConfig(
  serverUrl: string,
): Promise<RelayerConfig> {
  const res = await fetch(`${serverUrl.replace(/\/$/, "")}/config`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`GET ${serverUrl}/config returned ${res.status}`);
  }
  const body = (await res.json()) as {
    packageId?: string;
    network?: string;
    suiRpcUrl?: string;
  };
  if (!body.packageId || !body.network || !body.suiRpcUrl) {
    throw new Error("Relayer /config missing packageId, network, or suiRpcUrl");
  }
  if (body.network !== "mainnet" && body.network !== "testnet") {
    throw new Error(`Unsupported relayer network: ${body.network}`);
  }
  return {
    packageId: body.packageId,
    network: body.network,
    suiRpcUrl: body.suiRpcUrl,
  };
}
