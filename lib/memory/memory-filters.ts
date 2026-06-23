/** SQL fragment: active memories (not disputed, archived, or superseded). */
export const ACTIVE_MEMORY_SQL = `
  coalesce((metadata->>'disputed')::boolean, false) = false
  and coalesce((metadata->>'archived')::boolean, false) = false
  and coalesce((metadata->>'superseded')::boolean, false) = false
`;

export function isActiveMemory(metadata: Record<string, unknown>): boolean {
  return (
    metadata.disputed !== true &&
    metadata.archived !== true &&
    metadata.superseded !== true
  );
}
