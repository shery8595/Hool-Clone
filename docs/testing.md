# Testing

HoolClone uses **Node's built-in test runner** (`node:test`) with TypeScript via `tsx`. Tests are colocated next to source as `lib/**/*.test.ts` — no Jest or Vitest, no browser E2E.

**Current suite:** 39 test files · 165 test cases · 75 suites

---

## Quick start

```bash
# Run full suite (no external services required)
npm test

# Re-run on file changes
npm run test:watch
```

Expected output:

```
ℹ tests 165
ℹ pass 165
ℹ fail 0
```

All tests run offline. The only env var some tests set internally is `AUTH_SECRET` for wallet challenge round-trips.

---

## Philosophy

| Principle | What it means |
|-----------|---------------|
| **Test logic in `lib/`** | API routes under `app/api/` are thin wrappers; unit tests target business logic |
| **Pure functions first** | Memory rerank, debate pipeline, citation enforcement — highest ROI |
| **Offline fallbacks** | When Gemini is unavailable, `fallbackExtraction` and `fallbackClonePrediction` are tested directly |
| **No live Walrus/Gemini** | Mainnet proof uses `npm run verify:mainnet`; LLM adapters are mocked or bypassed |
| **Colocated tests** | `lib/debate/extract-entities.test.ts` lives beside `extract-entities.ts` |

This maps to [Architecture §18](./hoolclone-architecture.md): memory formatting, prediction scoring, maturity, and public profile shaping.

---

## Test runner

From `package.json`:

```json
"test": "node --import tsx --test lib/**/*.test.ts",
"test:watch": "node --import tsx --test --watch lib/**/*.test.ts"
```

Pattern used in every test file:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { myFunction } from "@/lib/some/module";

describe("myFunction", () => {
  it("does the expected thing", () => {
    assert.equal(myFunction("input"), "output");
  });
});
```

Path alias `@/` resolves via `tsx` the same as the app.

---

## Shared fixtures

[`lib/test/fixtures.ts`](../lib/test/fixtures.ts) provides factories used across test files:

| Factory | Purpose |
|---------|---------|
| `makeMatch()` | `Match` with defaults from `m071` (COL vs POR) or overrides |
| `makeReceipt()` | `MemoryReceipt` for debate and clone tests |
| `makeRecalledMemory()` | `RecalledMemory` for rerank/recall tests |
| `makeTeam()` | `Team` with code, name, flag |

Mock data in [`lib/mock/`](../lib/mock/) (matches, memories, predictions, debate messages) is used where full fixtures help.

---

## Writing a new test

1. Create `lib/<module>/<name>.test.ts` next to the source file.
2. Import from `@/lib/...` and use `node:assert/strict`.
3. Prefer pure function tests; for orchestrators, test exported helpers or offline fallback paths.
4. Run `npm test` — new files matching `lib/**/*.test.ts` are picked up automatically.
5. Document coverage in [Test Coverage](./test-coverage.md) if adding a new flow.

### Example: testing a pure helper

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { predictionsAgree } from "@/lib/clone/prediction-agreement";

describe("predictionsAgree", () => {
  it("returns true when winner and scores match", () => {
    assert.equal(
      predictionsAgree(
        { winner: "BRA", homeScore: 2, awayScore: 1 },
        { winner: "BRA", homeScore: 2, awayScore: 1 },
      ),
      true,
    );
  });
});
```

### Auth tests

Wallet challenge tests need a valid Sui address and `AUTH_SECRET`:

```ts
process.env.AUTH_SECRET = "test-secret-min-16-chars";
const wallet = "0x0000000000000000000000000000000000000000000000000000000000000001";
```

---

## What is not tested (by design)

| Area | Reason | Alternative proof |
|------|--------|-------------------|
| `app/api/*` routes | Thin zod + `requireUser` + one lib call | Logic tested in `lib/` |
| `walrus-memory-adapter.ts` | External MemWal / Mainnet | `npm run verify:mainnet` |
| `gemini-adapter.ts` | SDK wrapper | Test `fallbackExtraction` / `fallbackClonePrediction` |
| `verify-wallet-signature.ts` | Sui RPC | Manual wallet connect in dev |
| Browser / E2E | Out of unit-test scope | Manual demo script |
| DB `query()` integration | Out of unit-test scope | Seed scripts + production smoke |

See [Test Coverage](./test-coverage.md) for the full flow matrix.

---

## Submission checklist

Before recording a demo or submitting to judges:

- [ ] `npm test` — all 165 tests pass
- [ ] `npm run verify:mainnet` — passes on production DB (Walrus demo)
- [ ] No placeholder `demo-blob-*` IDs on public demo profile

---

## Related docs

- [Test Coverage](./test-coverage.md) — flow-by-flow map of all test files
- [Getting Started](./getting-started.md) — local setup
- [Architecture §18](./hoolclone-architecture.md) — testing strategy
- [Demo Guide](./demo-guide.md) — what judges should verify manually
