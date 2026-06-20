# HoolClone Docs

This folder contains the planning and architecture documents for HoolClone, a World Cup 2026 dApp where users train an AI clone of themselves as a football fan. The clone stores durable memory through Walrus Memory and uses those memories to make predictions, debate the user, and reveal prediction patterns over time.

**Stack highlights:** Walrus Memory (`@mysten-incubation/memwal`) for agent memory, **Google Gemini 2.5 Flash** for clone generation and debate, Next.js for the web app.

## Document Map

### [Project Overview](./project-overview.md)

High-level explanation of what HoolClone is, why it fits the Walrus Memory World Cup challenge, who it is for, and what the MVP must prove.

### [Architecture](./hoolclone-architecture.md)

Full technical architecture covering system modules, memory architecture, data model, APIs, agent behavior, security, deployment, observability, testing, and demo strategy.

### [Product Design](./product-design.md)

UX and visual design direction, screen breakdowns, component inventory, product tone, memory-receipt behavior, public profile design, and responsive design notes.

### [Implementation Plan](./implementation-plan.md)

Build sequence, repo structure, core interfaces, milestones, acceptance criteria, and minimum shippable version.

### [Risks And Mitigations](./risks-and-mitigations.md)

Likely technical, product, privacy, demo, and scope risks with practical mitigation plans.

## Recommended Reading Order

1. Read the project overview to understand the idea.
2. Read the product design doc to understand the user experience.
3. Read the architecture doc to understand the full system.
4. Read the implementation plan to start building.
5. Keep the risks doc open while cutting scope or preparing the demo.

## MVP North Star

The MVP should prove one thing clearly:

> The clone remembers the user across sessions and uses that memory to behave differently.

If a feature does not strengthen that proof, it should wait.

