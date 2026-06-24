export const DEMO_SLUG = "hoolclone-demo";
export const DEMO_WALLET =
  "0x0000000000000000000000000000000000000000000000000000000000demo01";

export type DemoMemorySeed = {
  text: string;
  type: string;
  metadata: Record<string, unknown>;
  daysAgo: number;
  publicVisible?: boolean;
};

export const DEMO_MEMORIES: DemoMemorySeed[] = [
  {
    text: "Portugal is my team — I will back them even when the xG chart says no.",
    type: "remembered",
    metadata: { driver: "loyalty", team: "Portugal", source: "onboarding" },
    daysAgo: 14,
  },
  {
    text: "I pick with vibes first. Stats are for post-match arguments.",
    type: "remembered",
    metadata: { driver: "vibes", source: "onboarding" },
    daysAgo: 13,
  },
  {
    text: "Brazil always look inevitable until they do not — I do not trust the hype.",
    type: "remembered",
    metadata: { driver: "chaos", team: "Brazil", source: "onboarding" },
    daysAgo: 12,
  },
  {
    text: "I said Portugal would struggle if Ronaldo is isolated — still believe it.",
    type: "remembered",
    metadata: { driver: "stats", team: "Portugal" },
    daysAgo: 9,
  },
  {
    text: "User correction: I do trust Portugal in tight games — loyalty matters more than xG.",
    type: "correction",
    metadata: { driver: "loyalty", team: "Portugal", source: "correction" },
    daysAgo: 8,
  },
  {
    text: "Colombia are physical and fast — bad matchup on paper for Portugal.",
    type: "inferred",
    metadata: { driver: "stats", team: "Colombia" },
    daysAgo: 7,
  },
  {
    text: "Predicted Portugal 2-1 Colombia because I always ride my team in group games.",
    type: "used",
    metadata: { driver: "loyalty", team: "Portugal", source: "prediction" },
    daysAgo: 6,
  },
  {
    text: "Featured match COL vs POR: loyalty says Portugal, stats say draw.",
    type: "used",
    metadata: { driver: "loyalty", team: "Portugal", source: "prediction" },
    daysAgo: 1,
  },
  {
    text: "Chaos pick: Colombia could nick it if Portugal sit deep.",
    type: "inferred",
    metadata: { driver: "chaos", team: "Colombia" },
    daysAgo: 1,
  },
  {
    text: "[post_match] COL vs POR (2-1): predicted POR (2-1), actual winner COL (2-1). User was incorrect. Clone disagreed with the user's pick.",
    type: "remembered",
    metadata: {
      source: "telegram_post_match",
      matchId: "m071",
      driver: "loyalty",
    },
    daysAgo: 2,
    publicVisible: false,
  },
];

/** Baseline seed count from `DEMO_MEMORIES` — production demo profile matches after Walrus seed. */
export const DEMO_SEED_MEMORY_COUNT = DEMO_MEMORIES.length;

/** Expected memory count on the production demo profile (same as seed baseline). */
export const DEMO_PROFILE_MEMORY_COUNT = DEMO_SEED_MEMORY_COUNT;

export function getDemoNamespace(slug: string = DEMO_SLUG): string {
  return `hoolclone:demo:${slug}`;
}

export const RIVAL_SLUG = "hoolclone-rival";
export const RIVAL_WALLET =
  "0x0000000000000000000000000000000000000000000000000000000000demo02";

/** Opposing Colombia-first fan for Clone Clash demos vs hoolclone-demo */
export const RIVAL_MEMORIES: DemoMemorySeed[] = [
  {
    text: "Colombia are my team — Los Cafeteros play with heart every World Cup.",
    type: "remembered",
    metadata: { driver: "loyalty", team: "Colombia", source: "onboarding" },
    daysAgo: 14,
  },
  {
    text: "I pick underdogs with pace. Portugal slow down in heat — Colombia win.",
    type: "remembered",
    metadata: { driver: "chaos", team: "Colombia", source: "onboarding" },
    daysAgo: 13,
  },
  {
    text: "Stats say Portugal. My Walrus receipts say Colombia nick tight games.",
    type: "remembered",
    metadata: { driver: "vibes", team: "Colombia" },
    daysAgo: 12,
  },
  {
    text: "Portugal rely on Ronaldo nostalgia — I fade European favorites in Americas.",
    type: "remembered",
    metadata: { driver: "stats", team: "Portugal" },
    daysAgo: 11,
  },
  {
    text: "Physical South American teams beat technical European sides in group chaos.",
    type: "remembered",
    metadata: { driver: "loyalty", team: "Colombia" },
    daysAgo: 10,
  },
  {
    text: "Predicted Colombia 2-1 Portugal — James Rodríguez energy beats Ronaldo age.",
    type: "used",
    metadata: {
      driver: "loyalty",
      team: "Colombia",
      source: "prediction",
      matchId: "m071",
    },
    daysAgo: 6,
  },
  {
    text: "Debate: argued Colombia press beats Portugal full-backs. Clone cited my chaos receipts.",
    type: "remembered",
    metadata: {
      source: "debate_highlight",
      exchangeCount: 3,
      citedMemoryCount: 2,
      topics: ["Colombia press", "Portugal aging"],
    },
    daysAgo: 4,
  },
  {
    text: "User correction: I do respect Portugal in knockouts — but group stage Colombia is different.",
    type: "correction",
    metadata: { driver: "chaos", team: "Colombia", source: "correction" },
    daysAgo: 3,
  },
  {
    text: "COL vs POR: Colombia 2-1. Portugal sit deep, Colombia counter with pace.",
    type: "used",
    metadata: {
      driver: "chaos",
      team: "Colombia",
      source: "prediction",
      matchId: "m071",
    },
    daysAgo: 1,
  },
  {
    text: "Portugal fans overrate group-stage form — Colombia are live underdogs.",
    type: "inferred",
    metadata: { driver: "stats", team: "Portugal" },
    daysAgo: 1,
  },
];

export const RIVAL_SEED_MEMORY_COUNT = RIVAL_MEMORIES.length;
