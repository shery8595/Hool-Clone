import type { TrainingQuestion } from "./types";

export const trainingQuestions: TrainingQuestion[] = [
  {
    id: "q1",
    question: "Who is your favorite team and why?",
    placeholder: "Portugal — because of late-game brilliance...",
    maxLength: 120,
    defaultAnswer: "Portugal — because of late-game brilliance and Ronaldo-era trauma bonding.",
    defaultDriver: "loyalty",
    storedSummary: "Favorite team: Portugal, because of late-game brilliance",
  },
  {
    id: "q2",
    question: "Which team do you never trust, even when everyone else believes in them?",
    placeholder: "England — they always disappoint...",
    maxLength: 120,
    defaultAnswer: "England — they always disappoint in knockouts",
    defaultDriver: "chaos",
  },
  {
    id: "q3",
    question: "Do you predict with stats, vibes, loyalty, or chaos?",
    placeholder: "I say stats but pick with vibes...",
    maxLength: 120,
    defaultAnswer: "I say stats but my history says vibes and chaos in knockouts.",
    defaultDriver: "vibes",
  },
  {
    id: "q4",
    question: "What is your worst World Cup heartbreak?",
    placeholder: "Portugal losing to Morocco in 2022...",
    maxLength: 120,
    defaultAnswer: "Portugal losing to Morocco in 2022 — still not over it.",
    defaultDriver: "loyalty",
  },
  {
    id: "q5",
    question: "Which kind of team do you usually overrate?",
    placeholder: "Star-heavy favorites with good branding...",
    maxLength: 120,
    defaultAnswer: "Star-heavy favorites with good branding and a dramatic striker.",
    defaultDriver: "stats",
  },
];

export const emptyCloneMessage =
  "I do not know your football brain yet. Give me a few takes and I will start cloning your chaos.";

export const trainingTip =
  "Your answers shape your clone. There are no wrong takes.";
