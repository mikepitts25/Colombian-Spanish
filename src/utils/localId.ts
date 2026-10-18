let sequence = 0;

/** Stable intent identity for local creates; not an authentication token. */
export function createLocalId(kind: 'card' | 'deck'): string {
  return `custom-${kind}-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
}
