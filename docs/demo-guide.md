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
| **Clone Clash** | [/u/hoolclone-demo/clash?opponent=hoolclone-rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival) |
| **Telegram history** | [/telegram-history](https://walrus-mu.vercel.app/telegram-history) |
| **MemWal health** | [/api/admin/memwal-health](https://walrus-mu.vercel.app/api/admin/memwal-health) |

---

## What is real vs curated

| Layer | Status |
|-------|--------|
| Walrus blob IDs on demo profile | **Real Mainnet** after `db:seed-demo-walrus` |
| Fan narrative (Brazil loyalty, rival grudges) | **Curated** for judging clarity |
| Evolution snapshots | **Reconstructed** from stored memories (not replayed LLM sessions) |
| Recall | **Real** vector search when Walrus healthy; UI shows fallback explicitly |
| LLM output | **Gemini** when API key set; templates when unavailable |

> The demo fan story is seeded for clarity, but every memory receipt is a **real Walrus Mainnet blob**.

---

## Three-minute demo script

### Scene 1 — The pitch (15 sec)

Open the landing page. One line:

> "HoolClone doesn't predict football — it predicts *you*. Your AI fan clone learns from every take and stores it on Walrus Memory."

### Scene 2 — Empty clone (20 sec)

Connect wallet → `/train`. Show maturity **Level 0 Stranger**. Clone admits it doesn't know you yet.

### Scene 3 — Training writes memory (45 sec)

Answer 2–3 onboarding questions. Expand a memory receipt — show Walrus blob ID and **Verified on Walrus Mainnet** badge.

### Scene 4 — Prediction with receipts (45 sec)

Go to `/predict`, pick a match. Submit your pick. Generate clone prediction. Point at **memory receipts** — each cites a recalled memory with source and date.

### Scene 5 — Demo profile with history (30 sec)

Open [/u/hoolclone-demo/evolution](https://walrus-mu.vercel.app/u/hoolclone-demo/evolution):

- **Same Question — Two Answers** (Day 1 vs Day 4+)
- **Memory Provenance** table with blob IDs
- **Correction Override Proof**

### Scene 6 — Clone Clash (20 sec)

Open [Clone Clash vs rival](https://walrus-mu.vercel.app/u/hoolclone-demo/clash?opponent=hoolclone-rival). Two separate Walrus namespaces argue — memory-only cross-user feature.

### Scene 7 — Memory browser (optional, 15 sec)

Open `/memory`. Show encrypted emotional memory with lock badge → wallet unlock → plaintext visible. Note clone still recalls via search surrogate without unlock.

### Closing line

> "Every take is a receipt on Walrus Mainnet. The clone recalls them before every prediction. That's memory depth."

---

## Judging criteria map

### Memory Depth & Authenticity

| Proof | Where |
|-------|-------|
| Same question, two answers over time | Evolution → **Same Question — Two Answers** |
| Blob IDs + dates + sources | Evolution → **Memory Provenance** |
| Citations on predict with provenance | `/predict/[matchId]` receipt cards |
| Correction overriding stale take | Evolution → **Correction Override Proof** |
| Roast with memory receipts | Evolution → **Roast my record** + `/telegram-history` |

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

Expected: all checks pass, 15+ demo blobs, 10+ rival blobs, zero placeholders.

---

## Recording tips

- Use the **evolution page** as your anchor — it has all judge panels in one scroll.
- Zoom into receipt cards to show blob IDs.
- Show **recall backend badge** on at least one predict page.
- Keep under 3 minutes; scenes 4–5 are the memory proof core.
- Record at 1080p; dark mode not required (app uses light sports dashboard theme).

---

## Pre-demo checklist (operators)

- [ ] `npm run verify:mainnet` passes
- [ ] Demo profile loads with 15 memories
- [ ] Evolution panels show live data (not "Illustrative fallback")
- [ ] Consolidation cron scheduled (`/api/cron/memory-consolidation` every 6h)
- [ ] Telegram bot responds to `/start`
- [ ] `GEMINI_API_KEY` set (clone generates real text)

---

## Related docs

- [Judges Guide](./judges.md) — 15-minute tour and criteria map
- [How Memory Improves the Agent](./how-memory-improves-agent.md) — why clone behavior changes
- [Getting Started](./getting-started.md) — run locally
- [Walrus Memory](./walrus-memory.md) — namespaces and recall
- [Deployment](./deployment.md) — production setup
- [Project Overview](./project-overview.md) — product vision
