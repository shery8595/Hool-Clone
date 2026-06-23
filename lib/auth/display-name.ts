/** Resolve the fan-facing name, preferring a saved display name over a fallback slug. */
export function resolveFanDisplayName(
  displayName: string | null | undefined,
  fallback: string,
): string {
  const trimmed = displayName?.trim();
  return trimmed || fallback;
}
