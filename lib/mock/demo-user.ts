import type { DemoUser } from "./types";

export const demoUser: DemoUser = {
  name: "Alex",
  handle: "alexfan",
  slug: "alexfan",
  walletAddress: "0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9c2",
  maturity: "Contradiction Hunter",
  level: 3,
  maxLevel: 5,
  levelProgress: 68,
  bio: "Picks with vibes, argues with stats. Loyal to Portugal. Chaos-prone in knockouts.",
  joinedAt: "2026-05-12",
  quote:
    "I have seen this pattern before. You talk tactics, then pick the team with the dramatic striker.",
  memoriesCount: 23,
  cloneMatchPercent: 71,
  matchAccuracyPercent: 44,
  predictionsCount: 12,
};

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function formatKickoff(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isToday) return `Today ${time}`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
