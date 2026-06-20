# HoolClone Implementation Plan

## Implementation Strategy

Build HoolClone in layers:

1. App shell and database.
2. Prediction workflow.
3. Local memory adapter.
4. Walrus Memory adapter.
5. Clone generation.
6. Public proof surfaces.
7. Mainnet deployment and demo polish.

The most important engineering decision is to isolate memory behind an adapter. This lets the team build and test the app with a local mock while integrating Walrus Memory without blocking every other feature.

## Recommended Repo Structure

```text
/
  app/
    api/
    train/
    predict/
    debate/
    memory/
    u/[slug]/
    admin/
  components/
    clone/
    match/
    memory/
    ui/
  lib/
    auth/
    db/
    llm/
      gemini-adapter.ts
      llm-adapter.ts
      schemas/
    match-data/
    memory/
    prompts/
    scoring/
  docs/
  scripts/
  tests/
```

## Core Interfaces

### Memory Adapter

```ts
export type MemoryRecord = {
  type: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type MemorySearchResult = {
  text: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export interface MemoryAdapter {
  health(): Promise<{ ok: boolean; message?: string }>;
  remember(userId: string, memory: MemoryRecord): Promise<{ id?: string; status: string }>;
  recall(userId: string, query: string): Promise<MemorySearchResult[]>;
}
```

Implementations:

- `LocalMemoryAdapter` for development.
- `WalrusMemoryAdapter` for production.

### LLM Adapter

Primary provider: **Google Gemini 2.5 Flash** (`@google/generative-ai`).

```ts
export interface LlmAdapter {
  generateJson<T>(input: {
    system: string;
    user: string;
    schemaName: string;
    schema: object;
  }): Promise<T>;
}
```

Implementations:

- `GeminiLlmAdapter` for production and hackathon demo.
- `OllamaLlmAdapter` for local development (optional).
- `GroqLlmAdapter` for rate-limit fallback during live demo (optional).

### Match Data Adapter

```ts
export interface MatchDataAdapter {
  listMatches(): Promise<Match[]>;
  getMatch(matchId: string): Promise<Match | null>;
  refreshResults(): Promise<void>;
}
```

## Milestone 1: Project Bootstrap

Deliverables:

- Next.js app with TypeScript.
- Styling setup.
- Database connection.
- Base layout.
- Navigation.
- Seeded match data.
- Environment variable validation.
- `GeminiLlmAdapter` wired to `gemini-2.5-flash`.

Acceptance criteria:

- App runs locally.
- Dashboard page loads.
- Matches can be listed from database.
- Admin seed command works.

## Milestone 2: User Identity And Profiles

Deliverables:

- Wallet/session login.
- User table.
- Fan profile table.
- Public slug generation.
- Profile settings page or dashboard section.

Acceptance criteria:

- User can create profile.
- User can return to same profile.
- Each user has a memory namespace.
- Public profile can be enabled or disabled.

Implementation notes:

- Use wallet identity for official path.
- Keep a guest/demo mode for easier testing.
- Never expose private keys to the browser.

## Milestone 3: Training Flow

Deliverables:

- Training page.
- Onboarding questions.
- Answer submission API.
- Memory extraction prompt.
- Local memory adapter write.
- Clone maturity calculation.

Acceptance criteria:

- User can answer at least 5 questions.
- Answers generate memory records.
- Profile summary updates.
- Maturity moves from Stranger to Learner.

Training questions:

- Who is your favorite team and why?
- Which team do you never trust?
- Do you predict with stats, vibes, loyalty, or chaos?
- What is your worst World Cup heartbreak?
- Which kind of team do you usually overrate?

## Milestone 4: Prediction Flow

Deliverables:

- Match list page.
- Prediction detail page.
- Prediction form.
- Human prediction database write.
- Prediction history view.

Acceptance criteria:

- User can pick winner and score.
- User can add confidence and reasoning.
- Prediction appears in history.
- Duplicate predictions are handled cleanly.

## Milestone 5: Clone Prediction Engine

Deliverables:

- Recall relevant memories.
- Build clone prediction prompt.
- Generate clone prediction JSON.
- Store clone prediction.
- Render human-vs-clone comparison.
- Show memory receipts.

Acceptance criteria:

- Clone can make a prediction for a match.
- Clone prediction references recalled memory.
- Output is parseable JSON.
- If memory is weak, clone asks a training question.
- Memory receipts are visible in UI.

Prompt construction steps:

1. Fetch user profile summary.
2. Fetch match context.
3. Fetch human prediction if it exists.
4. Recall memory using several focused queries.
5. Compact recalled memories.
6. Call Gemini 2.5 Flash with clone system prompt and JSON response schema.
7. Validate JSON.
8. Store result.

## Milestone 6: Walrus Memory Integration

Deliverables:

- Install `@mysten-incubation/memwal`.
- Configure MemWal environment variables.
- Implement `WalrusMemoryAdapter`.
- Add memory health endpoint.
- Add retry state for failed writes.
- Verify Mainnet write and recall.

Acceptance criteria:

- `/api/admin/memwal-health` returns healthy in production.
- Onboarding facts are stored on Walrus Memory.
- Prediction facts are stored on Walrus Memory.
- Clone generation recalls Walrus memories.
- Failed writes are visible and do not silently pass.

Important configuration:

```text
MEMWAL_ACCOUNT_ID=
MEMWAL_DELEGATE_PRIVATE_KEY=
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
SUI_NETWORK=mainnet
```

## Milestone 7: Debate And Correction

Deliverables:

- Debate page.
- Clone chat API.
- Memory receipt drawer.
- User correction action.
- Correction memory write.

Acceptance criteria:

- User can challenge a clone claim.
- Clone can cite memory receipts.
- User correction updates future behavior.
- Wrong memory claims can be marked.

## Milestone 8: Match Resolution And Learning

Deliverables:

- Admin match result tool.
- Prediction scoring.
- Clone scoring.
- Post-match summary generation.
- Memory update after result.

Acceptance criteria:

- Match can be marked final.
- Human and clone accuracy update.
- App stores what was learned from the result.
- Public profile reflects updated record.

Scoring fields:

- Correct winner.
- Correct score.
- Confidence calibration.
- Reasoning quality, optional.
- Clone agreement or disagreement.

## Milestone 9: Public Profile

Deliverables:

- `/u/:slug` route.
- Public clone profile API.
- Clone maturity timeline.
- Memory receipt section.
- Human vs clone stats.
- Bias radar.

Acceptance criteria:

- Public page loads without auth.
- Private memories are not exposed.
- Receipts are summarized.
- Judges can see before-and-after memory effect.

## Milestone 10: Demo And Deployment

Deliverables:

- Production deployment.
- Mainnet Walrus Memory config.
- Dedicated session wallet.
- Seeded demo account.
- Public demo URL.
- 3-minute demo script and recording.

Acceptance criteria:

- Production app loads.
- Memory health passes.
- Demo profile has several sessions of history.
- Public profile demonstrates clone evolution.
- Submission requirements are ready.

## Suggested Build Order

Week 1:

- Bootstrap app.
- Database schema.
- Dashboard.
- Training flow.
- Prediction flow.
- Local memory adapter.

Week 2:

- Walrus Memory integration.
- Clone prediction engine.
- Memory receipts.
- Public profile.
- Match resolution.

Final days:

- Mainnet verification.
- Demo data.
- UI polish.
- Video.
- Submission.

## Development Practices

- Keep memory writes explicit and logged.
- Validate all Gemini JSON outputs with Zod before persisting.
- Use Gemini `responseSchema` for clone predictions and memory extraction.
- Store raw LLM outputs for debugging during development.
- Monitor Gemini free-tier rate limits; enable Groq fallback only if needed for demo.
- Sanitize all public text.
- Avoid overbuilding social features before memory demo works.
- Treat the public profile as a judging artifact.

## Minimum Shippable Version

The absolute minimum version should include:

- One demo user.
- Five stored training memories.
- Three stored predictions.
- Clone prediction with memory receipts.
- Public profile.
- Walrus Memory health check.
- Mainnet memory write proof.

If time gets tight, cut debate mode before cutting memory receipts or public proof.

