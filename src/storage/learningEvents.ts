import AsyncStorage, { StorageAccess } from './durableStorage';
import { LearningEvent, normalizeEvent, validateLearningEvents } from './learningEventSchema';
export type { LearningEvent, LearningModality } from './learningEventSchema';
export { validateLearningEvents } from './learningEventSchema';

const KEY = 'SRS_LEARNING_EVENTS_V1';
const MAX_EVENTS = 5000;
let writes: Promise<unknown> = Promise.resolve();
let sequence = 0;

export function createLearningSessionId(): string {
  // Local observation identity, not an authentication token.
  return `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function readLearningEvents(
  access: StorageAccess = AsyncStorage,
): Promise<LearningEvent[]> {
  const raw = await access.getItem(KEY);
  if (!raw) return [];
  const stored = JSON.parse(raw);
  if (stored?.schemaVersion !== 1) throw new Error('Unsupported learning history version');
  return validateLearningEvents(stored.events);
}

export async function getLearningEvents(): Promise<LearningEvent[]> {
  await writes;
  return readLearningEvents();
}

export function serializeLearningHistoryWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writes.then(operation);
  writes = result.catch(() => {});
  return result;
}

function boundHistory(events: LearningEvent[]): LearningEvent[] {
  return events.sort((a, b) => a.occurredAt - b.occurredAt).slice(-MAX_EVENTS);
}

export function appendLearningEvent(value: LearningEvent): Promise<boolean> {
  return serializeLearningHistoryWrite(async () => {
    const event = normalizeEvent(value);
    const history = await readLearningEvents();
    const existing = history.find((item) => item.id === event.id);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(event))
        throw new Error('Learning event ID conflict');
      return false;
    }
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 1,
        events: boundHistory([...history, event]),
      }),
    );
    return true;
  });
}

// Backup imports merge by stable identity. A conflicting ID is never overwritten.
export function mergeLearningEvents(value: unknown): Promise<void> {
  return serializeLearningHistoryWrite(async () => {
    const incoming = validateLearningEvents(value);
    const current = await readLearningEvents();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 1,
        events: mergeEventHistory(current, incoming),
      }),
    );
  });
}

// Pure merge shared by ordinary history imports and recoverable deck restores.
export function mergeEventHistory(
  current: LearningEvent[],
  incoming: LearningEvent[],
): LearningEvent[] {
  const events = new Map(current.map((event) => [event.id, event]));
  for (const event of incoming) {
    const prior = events.get(event.id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(event)) {
      throw new Error('Learning event ID conflict');
    }
    events.set(event.id, event);
  }
  return boundHistory([...events.values()]);
}
