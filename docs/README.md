# HoolClone Documentation

Complete documentation for **HoolClone** — a World Cup 2026 dApp where you train an AI clone of yourself as a football fan. Memories are stored durably on **Walrus Mainnet** and recalled before every prediction, debate, and Telegram roast.

**Live app:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)  
**GitHub:** [shery8595/Hool-Clone](https://github.com/shery8595/Hool-Clone)  
**Web docs:** [/docs](/docs) (browse in the app)

---

## Quick links

| I want to… | Start here |
|------------|------------|
| **Review as a judge** | [Judges Guide](./judges.md) |
| Run the app locally | [Getting Started](./getting-started.md) |
| Understand the runtime loop | [How It Works](./how-it-works.md) |
| See Walrus in every flow | [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) |
| Understand agent improvement | [How Memory Improves the Agent](./how-memory-improves-agent.md) |
| Configure Walrus / MemWal | [Walrus Memory](./walrus-memory.md) |
| Deploy to Vercel + Mainnet | [Deployment](./deployment.md) |
| Set up Telegram + cron | [Telegram Bot](./telegram-bot.md) + [Cron](./cron-job.md) |
| Record the hackathon demo | [Demo Guide](./demo-guide.md) |
| Look up API endpoints | [API Reference](./api-reference.md) |
| Run or understand tests | [Testing](./testing.md) |
| See what's covered by tests | [Test Coverage](./test-coverage.md) |

---

## Documentation map

### Start here

| Document | Description |
|----------|-------------|
| [Getting Started](./getting-started.md) | Install, env vars, database, local dev, Mainnet seeds |
| [Project Overview](./project-overview.md) | What HoolClone is, target users, MVP scope, success criteria |
| [How It Works](./how-it-works.md) | Training, memory write/recall, predictions, cron, Telegram |
| [Judges Guide](./judges.md) | 15-minute tour, criteria map, proof URLs, CLI verification |

### Walrus & operations

| Document | Description |
|----------|-------------|
| [Walrus Memory](./walrus-memory.md) | Namespaces, write/recall paths, RRF rerank, receipts, maturity |
| [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) | Write/recall across train, predict, debate, Telegram, evolution |
| [How Memory Improves the Agent](./how-memory-improves-agent.md) | Maturity, corrections, post-match loop, mood, same-question proof |
| [Deployment](./deployment.md) | Vercel env vars, migrations, Mainnet verification, troubleshooting |
| [Production Cron](./cron-job.md) | cron-job.org setup for live scores and post-match loop |
| [Telegram Bot](./telegram-bot.md) | Connect flow, commands, live goals, roasts, history page |

### Reference

| Document | Description |
|----------|-------------|
| [API Reference](./api-reference.md) | All `/api` routes with auth and request shapes |
| [Architecture](./hoolclone-architecture.md) | Full system design, data model, agent design, security |
| [Demo Guide](./demo-guide.md) | Judge URLs, 3-minute script, criteria mapping |
| [Testing](./testing.md) | Run `npm test`, conventions, fixtures, writing tests |
| [Test Coverage](./test-coverage.md) | 165 tests mapped to flows and judging criteria |

### Design & planning

| Document | Description |
|----------|-------------|
| [Product Design](./product-design.md) | UX direction, screens, components, tone |
| [Implementation Plan](./implementation-plan.md) | Build phases, milestones, acceptance criteria |
| [Risks & Mitigations](./risks-and-mitigations.md) | Technical, product, and demo risks |

---

## Recommended reading order

### For judges (15 minutes)

1. [Judges Guide](./judges.md) — bookmark URLs and criteria map
2. [How Memory Improves the Agent](./how-memory-improves-agent.md) — why behavior changes
3. [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) — where memory flows

### For developers (45 minutes)

1. [Getting Started](./getting-started.md) — run locally
2. [How It Works](./how-it-works.md) — runtime behavior
3. [Walrus Memory](./walrus-memory.md) — storage layer
4. [API Reference](./api-reference.md) — endpoints
5. [Architecture](./hoolclone-architecture.md) — deep dive

### For operators (deploying production)

1. [Deployment](./deployment.md)
2. [Production Cron](./cron-job.md)
3. [Telegram Bot](./telegram-bot.md)
4. Run `npm run verify:mainnet`

---

## MVP north star

The MVP proves one thing:

> The clone remembers the user across sessions and uses that memory to behave differently.

If a feature does not strengthen that proof, it can wait.

---

## Tech stack (summary)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind, shadcn/ui |
| Memory | Walrus Memory via `@mysten-incubation/memwal` |
| LLM | Google Gemini 2.5 Flash |
| Auth | Sui wallet signature challenge |
| Database | Postgres |
| Bot | grammy + Telegram webhook |
| Deployment | Vercel |

---

## Contributing to docs

Documentation lives in the `docs/` folder as Markdown. The web UI at `/docs` renders these same files — edit markdown here and both GitHub and the site stay in sync.

When adding a new doc:

1. Create `docs/your-topic.md`
2. Register the slug in `lib/docs/navigation.ts`
3. Link from this index
