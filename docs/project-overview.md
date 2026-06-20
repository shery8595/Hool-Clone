# HoolClone Project Overview

## What HoolClone Is

HoolClone is a World Cup 2026 dApp where users train an AI clone of themselves as a football fan. The clone learns how each user predicts matches, which teams they trust or distrust, how emotional they get about certain players, and where their stated football beliefs conflict with their actual behavior.

The user does not train the clone with model fine-tuning. Instead, the app stores durable agent memories through Walrus Memory. Over time, the clone recalls those memories and uses them to make predictions, debate the user, explain its reasoning, and show visible proof that it has learned from prior sessions.

The simplest product pitch:

> HoolClone is not predicting football. It is predicting you.

## Why This Project Fits The Challenge

The Walrus Memory World Cup challenge rewards projects that use persistent memory in a meaningful way. HoolClone is built around that requirement:

- The agent must behave differently after several sessions.
- The app must visibly show memory in action.
- The memory must shape predictions, debates, and commentary.
- User memory and agent state must be stored on Walrus Mainnet.
- The World Cup context gives the app emotional stakes and repeat usage.

HoolClone avoids being a generic prediction app. The clone's personality, prediction style, and confidence are all based on what it remembers about the user.

## Target Users

### Primary Users

Football fans who enjoy making predictions, arguing about teams, and sharing funny takes during the World Cup.

### Secondary Users

Hackathon judges and Walrus ecosystem builders who need to see a clear memory demonstration quickly.

### Demo Users

Pre-seeded users with multiple sessions of history. These accounts are important because the challenge specifically rewards before-and-after behavior over time.

## Core Experience

1. A user creates or connects a profile.
2. The clone interviews the user about football preferences and prediction style.
3. The app stores those memories through Walrus Memory.
4. The user predicts World Cup matches.
5. The clone predicts what the user would pick.
6. The clone cites memory receipts to explain its reasoning.
7. After matches resolve, the clone learns from correct and incorrect predictions.
8. The public profile shows how the clone has evolved.

## Main Product Surfaces

### Dashboard

The home screen for a user. It shows clone maturity, next matches, recent predictions, memory receipts, and human-vs-clone performance.

### Train

The guided interview and training screen. The user answers questions that help the clone learn their football personality.

### Predict

The match prediction screen. The user submits a prediction and the clone generates its own prediction as the user.

### Debate

A conversational screen where the user argues with the clone. The clone can cite previous memories and the user can correct it.

### Memory

A private memory-receipt screen where the user can inspect, hide, or review the memories being used for public display.

### Public Profile

A shareable page showing the clone's personality, prediction record, memory receipts, contradictions, and evolution timeline.

## What Makes It Interesting

HoolClone has a strong emotional loop:

- Users like to believe they are rational.
- Their predictions often reveal bias.
- The clone learns the real pattern.
- The clone calls out the gap between self-image and behavior.

Example:

> "You keep saying you trust defensive teams, but your last five predictions favored star attackers in emotionally charged matches."

This is funny, useful, and clearly memory-driven.

## MVP Scope

The MVP should include:

- Wallet or session identity.
- Fan onboarding interview.
- Seeded World Cup-style matches.
- Human prediction form.
- Clone prediction generation.
- Walrus Memory write and recall.
- Memory receipts.
- Public clone profile.
- Demo account with multi-session history.

The MVP does not need:

- Betting.
- Live sports odds.
- Full fantasy league support.
- Complex social graph.
- Custom model training.
- Paid LLM providers (Gemini 2.5 Flash free tier is sufficient).

## Success Criteria

HoolClone is successful if:

- A new user understands the product in under 10 seconds.
- A new user can train a clone in under 3 minutes.
- A returning user's clone behaves differently because of stored memory.
- Every clone prediction includes memory receipts.
- Public pages make Walrus Memory visible to judges.
- The project is deployed and usable on Mainnet.

## One-Minute Demo Story

1. Open a new HoolClone profile.
2. Show the clone has no memory yet.
3. Answer a few football personality questions.
4. Submit a match prediction.
5. Show memory being stored.
6. Open an older demo profile.
7. Show the clone referencing old predictions and contradictions.
8. Show the public profile with memory receipts and clone evolution.

The judge should leave with one clear thought:

> This agent remembers the user and uses that memory in a way that changes the product.

