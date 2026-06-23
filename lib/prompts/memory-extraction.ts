export function buildMemoryExtractionPrompt(input: {
  question: string;
  answer: string;
  driver?: string;
}): { system: string; user: string } {
  return {
    system: `You extract durable football fan memories from onboarding answers.
Return concise facts the clone can recall later. Focus on teams, biases, emotional patterns, and prediction style.
Never invent details not present in the answer.
For emotional_memory facts, also return searchText: a redacted abstract phrase safe for public embedding (no verbatim quotes).`,
    user: `Question: ${input.question}
Answer: ${input.answer}
Driver chip: ${input.driver ?? "unspecified"}

Extract 1-3 memory facts and a one-line summary for the fan profile.
For each emotional_memory fact include searchText.`,
  };
}
