export type DocPage = {
  slug: string;
  title: string;
  file: string;
  description?: string;
};

export type DocSection = {
  title: string;
  pages: DocPage[];
};

export const docSections: DocSection[] = [
  {
    title: "Start here",
    pages: [
      {
        slug: "getting-started",
        title: "Getting Started",
        file: "getting-started.md",
        description: "Install, configure, and run locally or on Mainnet.",
      },
      {
        slug: "overview",
        title: "Project Overview",
        file: "project-overview.md",
        description: "What HoolClone is and who it is for.",
      },
      {
        slug: "how-it-works",
        title: "How It Works",
        file: "how-it-works.md",
        description: "Training, memory, predictions, cron, and Telegram.",
      },
      {
        slug: "judges",
        title: "Judges Guide",
        file: "judges.md",
        description: "15-minute tour, criteria map, and proof URLs.",
      },
    ],
  },
  {
    title: "Walrus & operations",
    pages: [
      {
        slug: "walrus-memory",
        title: "Walrus Memory",
        file: "walrus-memory.md",
        description: "Namespaces, write/recall, receipts, and maturity.",
      },
      {
        slug: "how-walrus-memory-is-used",
        title: "How Walrus Memory Is Used",
        file: "how-walrus-memory-is-used.md",
        description: "Write and recall paths across every user flow.",
      },
      {
        slug: "how-memory-improves-agent",
        title: "How Memory Improves the Agent",
        file: "how-memory-improves-agent.md",
        description: "Maturity, corrections, mood, and visible behavior change.",
      },
      {
        slug: "deployment",
        title: "Deployment",
        file: "deployment.md",
        description: "Vercel, env vars, Mainnet verification.",
      },
      {
        slug: "cron-job",
        title: "Production Cron",
        file: "cron-job.md",
        description: "cron-job.org scheduler for live scores.",
      },
      {
        slug: "telegram-bot",
        title: "Telegram Bot",
        file: "telegram-bot.md",
        description: "Connect, commands, roasts, and memory loop.",
      },
    ],
  },
  {
    title: "Reference",
    pages: [
      {
        slug: "api-reference",
        title: "API Reference",
        file: "api-reference.md",
        description: "All REST endpoints under /api.",
      },
      {
        slug: "architecture",
        title: "Architecture",
        file: "hoolclone-architecture.md",
        description: "Full system design and data model.",
      },
      {
        slug: "demo-guide",
        title: "Demo Guide",
        file: "demo-guide.md",
        description: "Judge URLs and 3-minute demo script.",
      },
      {
        slug: "testing",
        title: "Testing",
        file: "testing.md",
        description: "Run tests, conventions, and writing new tests.",
      },
      {
        slug: "test-coverage",
        title: "Test Coverage",
        file: "test-coverage.md",
        description: "165 tests mapped to user flows and judging criteria.",
      },
    ],
  },
  {
    title: "Design & planning",
    pages: [
      {
        slug: "product-design",
        title: "Product Design",
        file: "product-design.md",
        description: "UX direction, screens, and tone.",
      },
      {
        slug: "implementation",
        title: "Implementation Plan",
        file: "implementation-plan.md",
        description: "Build phases and milestones.",
      },
      {
        slug: "risks",
        title: "Risks & Mitigations",
        file: "risks-and-mitigations.md",
        description: "Technical and demo risk register.",
      },
    ],
  },
];

const slugToPage = new Map<string, DocPage>();

for (const section of docSections) {
  for (const page of section.pages) {
    slugToPage.set(page.slug, page);
  }
}

export function getDocPage(slug: string): DocPage | undefined {
  return slugToPage.get(slug);
}

export function getAllDocSlugs(): string[] {
  return [...slugToPage.keys()];
}

export function getAdjacentDocs(slug: string): {
  prev: DocPage | null;
  next: DocPage | null;
} {
  const flat = docSections.flatMap((s) => s.pages);
  const index = flat.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? flat[index - 1]! : null,
    next: index < flat.length - 1 ? flat[index + 1]! : null,
  };
}
