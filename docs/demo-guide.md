# Demo Guide

Step-by-step guide for hackathon judges, video recording, and live demos. Every link below points to the **production** deployment with real Walrus Mainnet memories.

**Production:** [https://walrus-mu.vercel.app](https://walrus-mu.vercel.app)

---

## Demo URLs (bookmark these)

| Resource | URL |
|----------|-----|
| **Home** | [walrus-mu.vercel.app](https://walrus-mu.vercel.app) |
| **Demo profile** | [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) |
| **Evolution (judge page)** | [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) |
| **Judge demo docs** | [/docs/judge-demo](/docs/judge-demo) |
| **Live judge sandbox** | On evolution page — no wallet |
| **Clone Clash** | [/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) |
| **Telegram history (public demo)** | [/u/hoolclone-demo/telegram-history](https://walrus-mu.vercel.app/u/hoolclone-demo/telegram-history) |
| **MemWal health** | [/api/health/memwal](https://walrus-mu.vercel.app/api/health/memwal) |

---

## Seeded accounts

| Account | Slug | Profile | Memories |
|---------|------|---------|----------|
| Demo Fan | `hoolclone-demo` | [/u/hoolclone-demo](https://walrus-mu.vercel.app/u/hoolclone-demo) | 10 Walrus receipts |
| Rival Fan | `hoolclone-rival` | [/u/hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-rival) | 10 Walrus receipts |

See [Judge Demo](./judge-demo.md) for namespaces, wallets, seed commands, and API routes.

---

## What is real vs curated

Judges care about **memory depth and authenticity** — whether Walrus memory changes clone behavior over time. Here is what is genuinely on Mainnet vs what is presentation:

| Layer | Status | Why it satisfies the criterion |
|-------|--------|--------------------------------|
| Walrus blob IDs on demo profile | **Real Mainnet** | Every receipt is a verifiable `walrusBlobId` — expand any memory card to inspect |
| Recall before clone actions | **Real** | `recall()` runs vector search on Walrus; UI labels `Walrus: Verified recall` vs fallback |
| Day 1 vs Day 4+ behavior | **Real, memory-driven** | Same question panel compares clone output with vs without stored memories; Day 4+ cites a real correction blob |
| Memory timestamps | **Real** | Provenance table shows `created_at` spanning multiple days — memories accumulated before Day 4 answers |
| Live judge sandbox | **Real, interactive** | Apply correction → new Mainnet blob → regenerate → clone cites that receipt (strongest live proof) |
| Fan narrative (loyalty, rival grudges) | **Curated copy** | Story is seeded for clarity; **storage and recall are not mocked** |
| Evolution time machine | **Derived from stored memories** | Day-by-day panels are rebuilt from the same Walrus receipts you can inspect — not replayed chat logs |
| LLM output | **Gemini** when API key set; templates when unavailable | Receipt IDs are enforced either way |

> **Bottom line:** The demo compresses a multi-day fan journey into one scrollable page, but every memory receipt is a **real Walrus Mainnet blob** and the clone **recalls** them before answering. The live sandbox proves you can write a new blob and watch behavior change in the same session.

---

## Three-minute demo script (judge-focused)

Lead with **verifiable Walrus proof**, then personality. Judges should see blob IDs and a live write before anything else.

### Scene 1 — The pitch (15 sec)

Open the landing page. One line:

> "HoolClone doesn't predict football — it predicts *you*. Your AI fan clone learns from every take and stores it on Walrus Memory."

### Scene 2 — Live judge sandbox (45 sec) ★ authenticity anchor

Open [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution) and scroll to **Live judge sandbox**:

1. Click **Apply correction** — zoom on the returned **memory ID** and **Walrus blob ID**
2. Click **Regenerate clone prediction** — show the clone now cites that correction receipt
3. Say: *"That blob was not here on day one — memory changed the pick."*

No wallet required. This is the clearest before/after proof in one session.

### Scene 3 — Evolution proof (45 sec)

On the same page, scroll up to:

- **Same Question — Two Answers** — Day 1 generic draw (no receipts) vs Day 4+ Portugal pick citing a **real correction blob**
- **Memory Provenance** — table of blob IDs, dates, and sources across multiple days
- **Correction Override Proof** — stale take → correction memory → updated prediction (badge: **Live Walrus proof**)

Point at blob IDs on screen. Panels marked **Illustrative fallback** mean demo seed is missing — production should show **Live Walrus proof**.

### Scene 4 — Clone Clash (30 sec)

Open [Clone Clash vs rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival). Pick a match, start debate — two Walrus namespaces argue with memory receipts.

### Scene 5 — Telegram loop (20 sec)

Open [/u/hoolclone-demo/telegram-history](https://walrus-mu.vercel.app/u/hoolclone-demo/telegram-history) — post-match roast citing Walrus memories.

### Closing line (15 sec)

> "Every take is a receipt on Walrus Mainnet. Day one the clone had no memories; day four it recalls them and changes the answer. That's memory depth."

### Optional wallet scenes (not required for judges)

- `/train` — empty clone → first Walrus receipt
- `/predict` — submit pick + clone cites memories
- `/memory` — encrypted emotional memory unlock

---

## Judging criteria map

### Memory Depth & Authenticity

| Proof | Where |
|-------|-------|
| Same question, two answers over time | Evolution → **Same Question — Two Answers** |
| Blob IDs + dates + sources | Evolution → **Memory Provenance** |
| Citations on predict with provenance | `/predict/[matchId]` receipt cards |
| Correction overriding stale take | Evolution → **Correction Override Proof** |
| Roast with memory receipts | Evolution → **Roast my record** + `/u/hoolclone-demo/telegram-history` |
| Live correction write | Evolution → **Live judge sandbox** |

### Creativity & Flair

| Proof | Where |
|-------|-------|
| Memory-only cross-user feature | **Clone Clash** |
| Human vs clone leaderboard | Dashboard + evolution analytics |
| Screenshot-ready roasts | `/telegram-history` |
| Memory-driven clone mood | Dashboard + predict mood badge |

### Technical Execution

| Proof | Where |
|-------|-------|
| Walrus status in UI | Sidebar, top bar, predict panel |
| Recall source per receipt | `Walrus: Verified recall` vs `Postgres fallback recall` |
| Mainnet verification | `npm run verify:mainnet` |
| Closed-loop cron + Telegram | Cron hits every minute; post-match memories feed next recall |
| Sleep-cycle consolidation | Every 6h cron merges repetitive takes into `consolidated_bias` |
| Encrypted emotional memories | Lock badge on `/memory`; wallet unlock for plaintext |

---

## Inspecting Walrus proof

1. Open any memory card on `/u/hoolclone-demo`.
2. Expand → **Verified on Walrus Mainnet** with truncated blob ID.
3. Hover or tap for full blob ID + explorer link.
4. Placeholder seeds show **Demo placeholder — not on Mainnet** (amber) — should be zero on production.

Top bar shows **Walrus: Verified** when Mainnet recall is healthy.

---

## CLI verification (for judges with repo access)

```bash
git clone https://github.com/shery8595/Hool-Clone.git
cd Hool-Clone
npm install

# Point at production env or run against same MemWal account
npm run verify:mainnet
```

Expected: all checks pass, 10+ demo blobs, 10+ rival blobs, zero placeholders.

---

## Recording tips

- **Start with the live sandbox** — blob write + regenerate is the strongest authenticity proof in one session.
- Use the **evolution page** as your anchor — it has all judge panels in one scroll.
- Zoom into receipt cards to show **Walrus blob IDs** and **created_at** dates across multiple days.
- Confirm panels show **Live Walrus proof** (not **Illustrative fallback**) before recording.
- Show **recall backend badge** on at least one predict page.
- Keep under 3 minutes; scenes 2–3 are the memory proof core.
- Record at 1080p; dark mode not required (app uses light sports dashboard theme).

---

## Pre-demo checklist (operators)

- [x] `npm run verify:mainnet` passes
- [x] Demo profile loads with 10 memories
- [x] Evolution panels show **Live Walrus proof** (not "Illustrative fallback")
- [x] Consolidation cron scheduled (`/api/cron/memory-consolidation` every 6h)
- [x] Telegram bot responds to `/start`
- [x] `GEMINI_API_KEY` set (clone generates real text)

---

## Related docs

- [Judge Demo](./judge-demo.md) — demo and rival accounts, live sandbox, API routes
- [Judges Guide](./judges.md) — 15-minute tour and criteria map
- [How Memory Improves the Agent](./how-memory-improves-agent.md) — why clone behavior changes
- [Getting Started](./getting-started.md) — run locally
- [Walrus Memory](./walrus-memory.md) — namespaces and recall
- [Deployment](./deployment.md) — production setup
- [Project Overview](./project-overview.md) — product vision
