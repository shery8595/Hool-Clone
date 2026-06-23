import type { BiasAxis } from "@/lib/mock/types";

export const landingFeatures = [
  {
    title: "Learns You",
    description:
      "Studies your predictions, logic, and vibes until it knows how you think.",
    icon: "brain" as const,
  },
  {
    title: "Remembers Everything",
    description:
      "Every take stored on Walrus Memory — immutable, verifiable, and yours.",
    icon: "database" as const,
  },
  {
    title: "Debates You",
    description:
      "Challenges your hottest takes with receipts from your own memories.",
    icon: "message" as const,
  },
  {
    title: "Improves Over Time",
    description:
      "Your clone gets sharper with every correction, match, and debate.",
    icon: "trending" as const,
  },
  {
    title: "Yours to Share",
    description:
      "Climb the global leaderboard and show off your clone's accuracy.",
    icon: "trophy" as const,
  },
] as const;

export const trustBadges = [
  { label: "Powered by Walrus Memory", icon: "database" as const },
  { label: "Verifiable Memories", icon: "shield" as const },
  { label: "Your Data Stays Yours", icon: "lock" as const },
  { label: "Built for Fans Not for Profit", icon: "heart" as const },
] as const;

export const footerTrustItems = [
  { label: "Decentralized", icon: "globe" as const },
  { label: "Private", icon: "lock" as const },
  { label: "Verifiable", icon: "shield" as const },
  { label: "Fan First", icon: "heart" as const },
] as const;

export type ShowcaseFan = {
  handle: string;
  level: number;
  matchPercent: number;
  title: string;
  rank: number;
  avatar: string;
  titleIcon: "target" | "zap" | "trophy";
  memories: number;
  predictions: number;
  debatesWon: number;
  roastLevel: number;
  receipt: string;
  radar: BiasAxis[];
};

export const showcaseStats = [
  { label: "Active Clones", value: "4,328", icon: "brain" as const },
  { label: "Avg Accuracy", value: "78%", icon: "target" as const },
  { label: "Memories Stored", value: "126K+", icon: "database" as const },
  { label: "Walrus Backed", value: "100%", icon: "shield" as const },
] as const;

export const showcaseFans: ShowcaseFan[] = [
  {
    handle: "@alexfan",
    level: 4,
    matchPercent: 76,
    title: "Contradiction Hunter",
    rank: 1,
    avatar: "/landing/showcase/fan-alexfan.png",
    titleIcon: "target",
    memories: 142,
    predictions: 58,
    debatesWon: 34,
    roastLevel: 8.7,
    receipt: "3pZ8...kL9m",
    radar: [
      { label: "Loyalty", you: 8, clone: 7 },
      { label: "Chaos", you: 6, clone: 8 },
      { label: "Stats", you: 5, clone: 4 },
      { label: "Vibes", you: 9, clone: 8 },
      { label: "Rivalry", you: 7, clone: 7 },
    ],
  },
  {
    handle: "@mariacopa",
    level: 3,
    matchPercent: 82,
    title: "Chaos Specialist",
    rank: 2,
    avatar: "/landing/showcase/fan-mariacopa.png",
    titleIcon: "zap",
    memories: 118,
    predictions: 44,
    debatesWon: 28,
    roastLevel: 9.2,
    receipt: "7rM2...xP4n",
    radar: [
      { label: "Loyalty", you: 6, clone: 7 },
      { label: "Chaos", you: 9, clone: 9 },
      { label: "Stats", you: 4, clone: 5 },
      { label: "Vibes", you: 8, clone: 7 },
      { label: "Rivalry", you: 8, clone: 8 },
    ],
  },
  {
    handle: "@jordi10",
    level: 5,
    matchPercent: 91,
    title: "Full HoolClone",
    rank: 3,
    avatar: "/landing/showcase/fan-jordi10.png",
    titleIcon: "trophy",
    memories: 201,
    predictions: 73,
    debatesWon: 51,
    roastLevel: 7.4,
    receipt: "9wK5...mQ2j",
    radar: [
      { label: "Loyalty", you: 9, clone: 9 },
      { label: "Chaos", you: 5, clone: 5 },
      { label: "Stats", you: 8, clone: 8 },
      { label: "Vibes", you: 7, clone: 7 },
      { label: "Rivalry", you: 9, clone: 8 },
    ],
  },
];

export const socialProofAvatars = [
  { initials: "SK", color: "#1a6b4a" },
  { initials: "LM", color: "#d97706" },
  { initials: "TR", color: "#7c3aed" },
  { initials: "NP", color: "#dc2626" },
  { initials: "DW", color: "#0284c7" },
];

export const walrusMemoryFeatures = [
  {
    label: "Durable fan takes survive across sessions",
    icon: "shield" as const,
  },
  {
    label: "Real walrusBlobId receipts — not placeholders",
    icon: "receipt" as const,
  },
  {
    label: "Clone predictions recall() from your namespace",
    icon: "brain" as const,
  },
  {
    label: "Corrections append new blobs; clone visibly shifts",
    icon: "refresh" as const,
  },
] as const;

export const walrusMemoryProofPoints = [
  { label: "On Walrus Mainnet", icon: "globe" as const },
  { label: "Immutable & Durable", icon: "lock" as const },
  { label: "Recall Ready", icon: "zap" as const },
  { label: "Verifiable Proofs", icon: "fingerprint" as const },
] as const;

export const DEMO_NAMESPACE = "hoolclone:demo:hoolclone-demo";

/** Production deployment for judges and hackathon demo links */
export const PRODUCTION_APP_URL = "https://walrus-mu.vercel.app";

export const DEMO_EVOLUTION_URL = `${PRODUCTION_APP_URL}/u/hoolclone-demo/evolution`;
export const LEADERBOARD_URL = "/leaderboard";
export const JUDGES_DOC_URL = "/docs/judges";
export const DEMO_PROFILE_URL = `${PRODUCTION_APP_URL}/u/hoolclone-demo`;
export const DEMO_CLASH_URL = `${PRODUCTION_APP_URL}/u/hoolclone-demo/clash?opponent=hoolclone-rival`;
