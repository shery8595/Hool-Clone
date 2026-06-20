import type { BiasAxis, EvolutionEvent, PredictionComparison } from "./types";
import { getTeam } from "./matches";

export const biasRadarData: BiasAxis[] = [
  { label: "Loyalty", you: 6.5, clone: 8.3 },
  { label: "Underdog bias", you: 4.2, clone: 7.6 },
  { label: "Confidence", you: 6.8, clone: 6.2 },
  { label: "Chaos appetite", you: 7.8, clone: 8.7 },
  { label: "Star-player bias", you: 7.1, clone: 8.1 },
  { label: "Rivalry emotion", you: 8.3, clone: 6.9 },
];

export const publicProfileBiasData: BiasAxis[] = [
  { label: "Loyalty", you: 8.3, clone: 8.3 },
  { label: "Chaos", you: 8.7, clone: 8.7 },
  { label: "Underdog bias", you: 7.6, clone: 7.6 },
  { label: "Star-player bias", you: 8.1, clone: 8.1 },
  { label: "Confidence", you: 6.2, clone: 6.2 },
  { label: "Rivalry", you: 6.9, clone: 6.9 },
];

export const evolutionTimeline: EvolutionEvent[] = [
  {
    day: 1,
    title: "Stranger",
    description: "I had no idea who you were.",
    icon: "user",
  },
  {
    day: 3,
    title: "Imitator",
    description: "I started copying your picks.",
    icon: "brain",
  },
  {
    day: 7,
    title: "Contradiction Hunter",
    description: "I learned your patterns — especially the chaotic ones.",
    icon: "target",
  },
];

export const predictionComparisons: PredictionComparison[] = [
  {
    matchId: "m071",
    homeTeam: getTeam("COL"),
    awayTeam: getTeam("POR"),
    userPrediction: "2 - 1 POR",
    clonePrediction: "2 - 1 POR",
    agreed: true,
  },
  {
    matchId: "m066",
    homeTeam: getTeam("URU"),
    awayTeam: getTeam("ESP"),
    userPrediction: "2 - 1 URU",
    clonePrediction: "2 - 1 ESP",
    agreed: false,
  },
];
