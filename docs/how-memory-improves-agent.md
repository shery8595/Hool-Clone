# How Memory Improves the Agent

HoolClone does not fine-tune a model. The clone **improves** because Walrus memories accumulate, get recalled before every action, and are weighted by type, recency, and corrections. This page explains the visible behavioral shifts judges and users should expect.

For where memory is written in each flow, see [How Walrus Memory Is Used](./how-walrus-memory-is-used.md).

---

## The north star

> The clone remembers the user across sessions and uses that memory to behave differently.

If the clone's Day 4 prediction sounds like Day 1, memory failed. HoolClone is designed so improvement is **inspectable** — receipts, evolution panels, maturity labels, and mood badges all reflect stored memories.

---

## Maturity: memory count → clone capability

Maturity (`lib/auth/maturity.ts`) gates how assertive the clone is:

| Level | Memories | Clone behavior |
|-------|----------|----------------|
| **0 Stranger** | &lt; 3 | Asks training questions; avoids strong claims; no receipts |
| **1 Learner** | 3–8 | Summarizes preferences; low confidence |
| **2 Imitator** | 9–20 | Predictions with cited memory receipts |
| **3 Contradiction Hunter** | 20–40 | Surfaces gaps between stated beliefs and past picks |
| **4 Full HoolClone** | 40+ | High-confidence personalized predictions and debates |

Each `remember()` call can bump maturity via `syncCloneMaturity()`. The dashboard and train page show the current level.

---

## Same question, two answers

The evolution page's **Same Question — Two Answers** panel demonstrates the core proof:

| Phase | Clone state | Answer |
|-------|-------------|--------|
| **Day 1** | Stranger — few memories | Generic draw, ~28% confidence, no Walrus receipts |
| **Day 4+** | Imitator — corrections + fan profile stored | Portugal 2-1, ~68% confidence, cites correction memory |

The Day 4 answer is not magic — `recall()` surfaces the user's Portugal loyalty correction, reranked above stale generic takes, and the LLM is instructed to cite only recalled memories.

Static fallback copy exists for unseeded demos; production with `db:seed-demo-walrus` builds this panel **live** from `buildMemoryTimeMachine()`.

---

## Corrections override stale takes

When a user disagrees with the clone:

1. A `correction` memory is written to Walrus (`source: clone_correction` or `debate`).
2. The disputed memory is marked `disputed: true` in Postgres metadata.
3. Optional: clone prediction regenerates with `emphasizeCorrections: true`.
4. Rerank gives corrections **1.5× type weight** — they beat older fan_profile takes on the same topic.

The evolution **Correction Override Proof** panel shows: stale take → user correction blob → updated prediction citing the new receipt.

Prompt rule (`lib/prompts/clone-prediction.ts`):

> Corrections override stale disputed memories.

---

## Post-match loop: wins and losses reshape the next recall

After a match resolves:

| Channel | What happens |
|---------|--------------|
| **Web** | `match_resolution` memory summarizes how the user reacted |
| **Telegram** | Congrats or roast DM + `telegram_post_match` memory (`public_visible: false`) |
| **Next predict** | `recall()` weights post-match summaries heavily (+0.12 source boost, 1.35× type weight) |

A user who was roasted for picking wrong may see the clone reference that loss — or ride loyalty harder after a favorite-team win. The Telegram DM is ephemeral; the Walrus memory persists.

Clone mood (`lib/clone/clone-mood.ts`) also shifts from recent resolved predictions:

| Mood | Trigger | Tone effect |
|------|---------|-------------|
| **On Fire** | Mostly correct recent picks | Confident, celebratory |
| **Salty** | Mostly wrong recent picks | Sharp, self-aware |
| **Loyalist** | Strong loyalty memory drivers | Rides favorite team |
| **Contradiction Hunter** | Multiple contradictions detected | Calls out inconsistencies |

Mood label and `toneGuidance` are injected into the clone prediction prompt.

---

## Predict: habits, not cheating

Clone prediction recalls ~8 memories but **excludes** the user's saved pick for the current match. The clone imitates **habitual** behavior from `prediction_pattern` memories on *other* fixtures, plus fan profile and corrections.

Weak memory (&lt; 3 memories): clone returns a `trainingQuestion` instead of faking confidence.

Strong memory: 2–4 `memoryReceipts` in output, each mapped to a recalled row — Gemini is instructed not to fabricate IDs.

---

## Debate: memory as argument fuel

In debate, recall is driven by the user's message and recent turns. The clone:

- Cites memories as evidence in arguments
- Uses `contradiction-hunter` to compare stated loyalty vs past picks
- Writes new `correction` memories when the user pushes back

Debate quality scales with memory depth — a Stranger clone has little to argue with; a Contradiction Hunter clone has receipts for every claim.

---

## Telegram: memory-backed personality

`/roast` and post-match DMs are not generic templates when Gemini is available. They:

1. `recall()` user memories
2. Generate text citing specific takes
3. Enforce citations (`citation-enforcement.ts`) — invalid IDs stripped

Post-match writes close the loop: today's roast becomes tomorrow's recall input.

---

## Clone Clash: memory-defined identities

Two clones debate using **only** their respective Walrus namespaces. No shared context — each side's personality comes entirely from what was stored for that user. Demonstrates that memory is per-user identity, not a global system prompt.

---

## What judges should look for

| Signal | Good | Bad |
|--------|------|-----|
| Receipts on predict | Cite real memories with dates and blob IDs | Generic reasoning, no receipts |
| Evolution panels | Live data from time machine | "Illustrative fallback" on production |
| Correction flow | New prediction cites correction memory | Stale take still dominates |
| Recall badge | `Walrus: Verified recall` | Hidden fallback |
| Maturity | Rises as user trains | Stuck at Stranger with many memories |

---

## Testing the improvement story

151 unit tests cover the machinery behind visible improvement — without calling Gemini or Walrus:

- RRF rerank and diversity selection
- Correction emphasis and prediction filter
- Judge-proof panel builders
- Citation enforcement
- Clone mood computation
- Temporal contradictions

See [Test Coverage](./test-coverage.md) for the full map.

---

## Related docs

- [How Walrus Memory Is Used](./how-walrus-memory-is-used.md) — write/recall per flow
- [Walrus Memory](./walrus-memory.md) — pipelines and configuration
- [Judges Guide](./judges.md) — 15-minute production tour
- [How It Works](./how-it-works.md) — end-to-end runtime
