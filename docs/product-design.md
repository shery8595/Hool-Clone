# HoolClone Product Design Doc

## Design Intent

HoolClone should feel like a sharp sports dashboard with an AI personality living inside it. The app is playful, but it should not look like a toy. It should feel like something World Cup fans would actually use across several match days.

The design goal is:

> Make memory visible, make prediction fun, and make the clone feel personal.

## Product Personality

HoolClone's tone should be:

- Witty, but not mean.
- Confident, but honest when memory is weak.
- Sports-native, not generic AI assistant language.
- Slightly theatrical during debates.
- Clear about when it is using memory versus making an inference.

Avoid:

- Gambling language.
- Overly technical blockchain copy in the main user flow.
- Generic chatbot framing.
- Long explanations during prediction flow.

## Visual Direction

### Overall Feel

Use a sports broadcast and analytics-inspired interface:

- Strong match cards.
- Compact stat panels.
- Prediction comparisons.
- Timeline and receipt views.
- Clear public profile sections.

The app should open directly into the usable experience, not a marketing landing page.

### Suggested Palette

Use a balanced palette that avoids being one-note:

- Deep green for pitch/sport identity.
- Off-white or light gray for clean surfaces.
- Black or charcoal for contrast.
- Electric yellow or red as sparing matchday accents.
- Blue only as a secondary utility color.

Avoid making the whole app dark blue, purple, beige, or a single green theme.

### Typography

- Use a sturdy sans-serif for headings.
- Use compact readable text for dashboards.
- Avoid oversized hero text inside app surfaces.
- Keep labels short and scannable.

## Key UX Principles

### 1. Memory Must Be Visible

Every important clone output should show why it happened.

Do not just say:

> Clone predicts Portugal.

Say:

> Clone predicts Portugal because it remembers you trust late individual brilliance in close matches.

### 2. Clone Confidence Should Be Earned

The clone should start cautious and become more specific over time.

Weak memory state:

> "I only have two memories, so this is a low-confidence clone read."

Strong memory state:

> "I have seen this pattern four times, so I am fairly confident you would pick the emotional favorite."

### 3. The User Should Feel Seen, Not Tricked

The clone should reveal patterns playfully. It should never feel like it is exposing sensitive private data.

### 4. Public Demo Should Be Instantly Understandable

The public profile must show:

- Who the clone is.
- What it has learned.
- How predictions compare.
- Which memories shaped behavior.
- How the clone evolved.

## Information Architecture

```text
/
  Dashboard
/train
  Onboarding interview and clone training
/predict
  Match list
/predict/:matchId
  Human prediction vs clone prediction
/debate
  Conversation with clone
/memory
  Private memory receipts and controls
/u/:slug
  Public clone profile
/admin
  Demo, seed data, and health checks
```

## Screen Designs

### Dashboard

Purpose:

Give the user a quick view of clone state and next actions.

Core elements:

- Clone avatar and name.
- Clone maturity level.
- Next match card.
- Quick prediction action.
- Human vs clone accuracy.
- Latest memory receipts.
- Latest contradiction.

Primary action:

- Predict next match.

Secondary actions:

- Train clone.
- Debate clone.
- View public profile.

Empty state:

If the user is new, the dashboard should push them into training:

> "Your clone is still a stranger. Give it five takes to start sounding like you."

### Train Screen

Purpose:

Collect high-quality memory inputs.

Core elements:

- One focused question at a time.
- Progress indicator.
- Short answer input.
- Optional quick-choice chips.
- "Stored to memory" confirmation after each answer.

Question types:

- Loyalty: favorite and rival teams.
- Prediction style: stats, vibes, loyalty, chaos.
- Emotional history: heartbreaks and grudges.
- Tactical taste: pressing, possession, defense, counterattack.
- Bias challenge: "Which team do you rate higher than everyone else?"

Design note:

Avoid long forms. The training flow should feel like a conversation, but structured enough to generate useful memories.

### Predict Screen

Purpose:

Let users make match predictions and compare against the clone.

Core elements:

- Match card.
- Winner selector.
- Score inputs.
- Confidence slider.
- Reasoning input.
- Emotional state selector.
- Submit prediction button.

After submission:

- Human prediction summary.
- Clone prediction summary.
- Memory receipts.
- Difference callout.

Difference callout examples:

- "Your clone agrees with you."
- "Your clone thinks you are bluffing."
- "Your clone picked your emotional pattern over your stated logic."

### Debate Screen

Purpose:

Let users correct or argue with the clone.

Core elements:

- Chat-style debate view.
- Memory receipts drawer.
- Correction button.
- Store correction action.

Important interactions:

- User challenges a clone claim.
- Clone cites receipts.
- User marks a receipt as wrong, private, or accurate.
- App stores the correction as memory.

### Memory Screen

Purpose:

Give users control and transparency.

Core elements:

- Memory receipt list.
- Filter by memory type.
- Public/private toggle.
- Hide from public profile.
- "Used in prediction" history.

Memory states:

- Stored.
- Pending write.
- Failed write.
- Hidden from public.

### Public Profile

Purpose:

Prove the memory system to judges and let users share their clone.

Core sections:

- Profile header.
- Clone maturity.
- Fan personality summary.
- Human vs clone performance.
- Bias radar.
- Evolution timeline.
- Funniest contradiction.
- Selected memory receipts.
- Recent prediction comparisons.

The public profile should avoid raw private conversation text. It should show summarized receipts.

## Component Inventory

### CloneAvatar

Shows the clone identity, mood, and maturity level.

### MaturityMeter

Displays clone levels:

- Stranger.
- Learner.
- Imitator.
- Contradiction Hunter.
- Full HoolClone.

### MatchCard

Displays teams, kickoff, stage, status, and prediction state.

### PredictionForm

Captures winner, score, confidence, reasoning, and emotional state.

### HumanVsClonePanel

Compares user prediction and clone prediction side by side.

### MemoryReceipt

Shows one memory-based reason used by the clone.

### BiasRadar

Visualizes learned tendencies:

- Loyalty.
- Chaos appetite.
- Underdog bias.
- Star-player bias.
- Confidence.
- Rivalry emotion.

### EvolutionTimeline

Shows how the clone changed across sessions.

### WalrusHealthBadge

Shows whether memory storage and recall are connected.

## Microcopy Examples

### Empty Clone

> I do not know your football brain yet. Give me a few takes and I will start cloning your chaos.

### Weak Memory

> Low-confidence clone read. I only have three useful memories so far.

### Strong Memory

> I have seen this pattern before. You talk tactics, then pick the team with the dramatic striker.

### Contradiction

> You say you love underdogs. Your prediction history says you love safe favorites with good branding.

### Memory Receipt Label

> Used memory

### Public Profile Label

> Clone evidence

## Accessibility

- All controls must be keyboard accessible.
- Prediction choices should not rely on color alone.
- Memory receipts should be readable text, not only icons.
- Charts should include text summaries.
- Public profile should work on mobile.

## Responsive Design

### Mobile

- Stack human and clone prediction panels vertically.
- Keep prediction form compact.
- Use tabs for dashboard sections.
- Avoid dense multi-column charts.

### Desktop

- Use two-column layouts for prediction comparison.
- Keep dashboard panels scannable.
- Show memory receipts beside clone outputs.

## Design Success Criteria

The design is successful if:

- Users immediately understand they are training a clone.
- Clone outputs always feel connected to memory.
- The public page proves memory without explanation.
- The app feels World Cup-specific.
- The main flow works cleanly on mobile and desktop.

