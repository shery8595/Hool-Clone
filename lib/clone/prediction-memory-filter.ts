type PickMemory = {
  metadataMatchId?: string;
  source?: string;
  type?: string;
  text: string;
};

/** User's locked-in prediction for this match — not valid clone recall context. */
export function isCurrentMatchSubmittedPick(
  memory: PickMemory,
  matchId: string,
): boolean {
  if (memory.metadataMatchId !== matchId) return false;
  if (memory.source === "prediction_submit") return true;
  return (
    memory.type === "prediction_pattern" &&
    memory.text.trimStart().startsWith("[prediction]")
  );
}
