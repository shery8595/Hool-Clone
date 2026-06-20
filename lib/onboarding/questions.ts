import type { TrainingQuestion } from "@/lib/mock/types";

export const onboardingQuestions: TrainingQuestion[] = [
  {
    id: "q1",
    question: "Who is your favorite team and why?",
    placeholder: "Portugal — because of late-game brilliance...",
    maxLength: 120,
  },
  {
    id: "q2",
    question:
      "Which team do you never trust, even when everyone else believes in them?",
    placeholder: "England — they always disappoint...",
    maxLength: 120,
  },
  {
    id: "q3",
    question: "Do you predict with stats, vibes, loyalty, or chaos?",
    placeholder: "I say stats but pick with vibes...",
    maxLength: 120,
  },
  {
    id: "q4",
    question: "What is your worst World Cup heartbreak?",
    placeholder: "Portugal losing to Morocco in 2022...",
    maxLength: 120,
  },
  {
    id: "q5",
    question: "Which kind of team do you usually overrate?",
    placeholder: "Star-heavy favorites with good branding...",
    maxLength: 120,
  },
];

export const emptyCloneMessage =
  "I do not know your football brain yet. Give me a few takes and I will start cloning your chaos.";

export const trainingTip =
  "Your answers shape your clone. There are no wrong takes.";
