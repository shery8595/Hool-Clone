export function buildMemoryConsolidationPrompt(input: {
  memories: Array<{ id: string; text: string; type: string }>;
}): { system: string; user: string } {
  return {
    system: `You consolidate repetitive football fan prediction memories into one durable bias memory.
Merge overlapping takes into a single behavioral pattern the clone can recall later.
Preserve teams, prediction style, and loyalty signals. Drop match-specific noise.
Never invent biases not supported by the input memories.
Return mergedIds as the subset of input ids you actually merged.`,
    user: `Memories to consolidate:
${JSON.stringify(input.memories, null, 2)}

Produce one consolidated bias sentence and a short theme label.`,
  };
}
