import type { DebateMessage } from "./types";

export const debateMessages: DebateMessage[] = [
  {
    id: "msg-1",
    role: "user",
    text: "I would never pick England.",
    timestamp: "10:21 AM",
  },
  {
    id: "msg-2",
    role: "clone",
    text: "You picked England twice last week in your private predictions. I have receipts.",
    timestamp: "10:21 AM",
  },
  {
    id: "msg-3",
    role: "user",
    text: "Those were throwaway picks. I don't count friendlies.",
    timestamp: "10:22 AM",
  },
  {
    id: "msg-4",
    role: "clone",
    text: "You said the same thing about Morocco — then backed them as chaos football underdogs. Your pattern is emotional favorites, not rational underdogs.",
    timestamp: "10:22 AM",
  },
];

export const debateQuickActions = [
  { id: "push-back", label: "Push back", prompt: "That's not fair — " },
  {
    id: "challenge",
    label: "Challenge memory",
    prompt: "That memory is wrong because ",
  },
  {
    id: "never-pick",
    label: "I'd never pick them",
    prompt: "I would never pick ",
  },
  {
    id: "loyalty",
    label: "My loyalty",
    prompt: "I'm loyal to my team even when ",
  },
  {
    id: "change-topic",
    label: "Change topic",
    prompt: "Let's talk about Portugal instead — ",
  },
] as const;

export const cloneDebateTagline = "I call out patterns. You call it banter.";
