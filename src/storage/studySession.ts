import { RegionFilterId } from '../utils/regions';
export interface StudyQueueSnapshot {
  schemaVersion: 1;
  cardIds: string[];
  region: RegionFilterId;
  sessionId: string;
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
      ['schemaVersion', 'cardIds', 'region', 'sessionId'].includes(key),
    ) &&
    q.schemaVersion === 1 &&
    text(q.sessionId) &&
    ['all', 'general', 'paisa', 'rolo', 'costeno', 'valluno', 'llanero'].includes(
      q.region as string,
    ) &&
    Array.isArray(q.cardIds) &&
    q.cardIds.length <= 15 &&
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
    ...(session.queue ? { queue: { ...session.queue, cardIds: [...session.queue.cardIds] } } : {}),
  };
}
