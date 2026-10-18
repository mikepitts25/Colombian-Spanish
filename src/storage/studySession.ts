import { RegionFilterId } from '../utils/regions';
export interface StudyQueueSnapshot {
  schemaVersion: 1;
  cardIds: string[];
  region: RegionFilterId;
  sessionId: string;
  limits?: { cardLimit: number; newLimit: number };
}
export interface LastStudySession {
  deckId: string;
  cardId?: string;
  updatedAt: number;
  queue?: StudyQueueSnapshot;
}
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function isValidStudySession(value: unknown): value is LastStudySession {
  if (
    !record(value) ||
    !Object.keys(value).every((key) => ['deckId', 'cardId', 'updatedAt', 'queue'].includes(key)) ||
    !text(value.deckId) ||
    typeof value.updatedAt !== 'number' ||
    !Number.isFinite(value.updatedAt) ||
    value.updatedAt < 0 ||
    (value.cardId !== undefined && !text(value.cardId))
  )
    return false;
  if (value.queue === undefined) return true;
  const q = value.queue;
  return (
    record(q) &&
    Object.keys(q).every((key) =>
      ['schemaVersion', 'cardIds', 'region', 'sessionId', 'limits'].includes(key),
    ) &&
    q.schemaVersion === 1 &&
    (q.limits === undefined ||
      (record(q.limits) &&
        Object.keys(q.limits).every((key) => ['cardLimit', 'newLimit'].includes(key)) &&
        Number.isInteger(q.limits.cardLimit) &&
        (q.limits.cardLimit as number) >= 1 &&
        (q.limits.cardLimit as number) <= 15 &&
        Number.isInteger(q.limits.newLimit) &&
        (q.limits.newLimit as number) >= 0 &&
        (q.limits.newLimit as number) <= 15)) &&
    text(q.sessionId) &&
    ['all', 'general', 'paisa', 'rolo', 'costeno', 'valluno', 'llanero'].includes(
      q.region as string,
    ) &&
    Array.isArray(q.cardIds) &&
    q.cardIds.length <= 15 &&
    (q.limits === undefined || q.cardIds.length <= (q.limits as { cardLimit: number }).cardLimit) &&
    Array.from(q.cardIds).every(text) &&
    new Set(q.cardIds).size === q.cardIds.length &&
    value.cardId === q.cardIds[0]
  );
}
export function copySessionInput(
  session: Omit<LastStudySession, 'updatedAt'>,
): Omit<LastStudySession, 'updatedAt'> {
  return {
    ...session,
    ...(session.queue
      ? {
          queue: {
            ...session.queue,
            cardIds: [...session.queue.cardIds],
            ...(session.queue.limits ? { limits: { ...session.queue.limits } } : {}),
          },
        }
      : {}),
  };
}

export class StaleStudySessionError extends Error {
  constructor() {
    super('Study session changed');
  }
}

/** Compare checkpoint ownership, ignoring only its refresh timestamp. */
export function sameStudySession(
  stored: Omit<LastStudySession, 'updatedAt'> | undefined,
  expected: Omit<LastStudySession, 'updatedAt'>,
): boolean {
  const a = stored?.queue;
  const b = expected.queue;
  return (
    !!stored &&
    stored.deckId === expected.deckId &&
    stored.cardId === expected.cardId &&
    a?.schemaVersion === b?.schemaVersion &&
    a?.sessionId === b?.sessionId &&
    a?.region === b?.region &&
    a?.limits?.cardLimit === b?.limits?.cardLimit &&
    a?.limits?.newLimit === b?.limits?.newLimit &&
    JSON.stringify(a?.cardIds) === JSON.stringify(b?.cardIds)
  );
}
