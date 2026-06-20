import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MemWal dynamically imports @mysten/seal at runtime — keep these external.
  serverExternalPackages: [
    "@mysten-incubation/memwal",
    "@mysten/seal",
    "@mysten/sui",
    "@mysten/walrus",
  ],
};

export default nextConfig;
