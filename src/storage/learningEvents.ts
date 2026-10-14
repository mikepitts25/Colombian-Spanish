import AsyncStorage from '@react-native-async-storage/async-storage';

export type LearningModality = 'recognition' | 'recall' | 'listening' | 'speaking';
export interface LearningEvent {
  schemaVersion: 1;
  id: string;
  cardId: string;
  deckId: string;
  sessionId: string;
  missionId?: string;
  modality: LearningModality;
  outcome: 'correct' | 'incorrect';
  evidence: 'self-rated' | 'answer-checked';
  occurredAt: number;
  hintsUsed: number | null;
  durationMs: number | null;
}

const KEY = 'SRS_LEARNING_EVENTS_V1';
const MAX_EVENTS = 5000;
let writes: Promise<unknown> = Promise.resolve();
let sequence = 0;

export function createLearningSessionId(): string {
  // Local observation identity, not an authentication token.
  return `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeEvent(value: unknown): LearningEvent {
  const event = value as LearningEvent | null;
  const text = (item: unknown) => typeof item === 'string' && item.trim().length > 0;
  const nonnegative = (item: unknown) =>
    typeof item === 'number' && Number.isFinite(item) && item >= 0;
  if (
    !event ||
    event.schemaVersion !== 1 ||
    ![event.id, event.cardId, event.deckId, event.sessionId].every(text) ||
    (event.missionId !== undefined && !text(event.missionId)) ||
    !['recognition', 'recall', 'listening', 'speaking'].includes(event.modality) ||
    !['correct', 'incorrect'].includes(event.outcome) ||
    !['self-rated', 'answer-checked'].includes(event.evidence) ||
    !nonnegative(event.occurredAt) ||
    (event.hintsUsed !== null &&
      (!nonnegative(event.hintsUsed) || !Number.isInteger(event.hintsUsed))) ||
    (event.durationMs !== null && !nonnegative(event.durationMs))
  ) {
    throw new Error('Invalid learning event');
  }
  return {
    schemaVersion: 1,
    id: event.id,
    cardId: event.cardId,
    deckId: event.deckId,
    sessionId: event.sessionId,
    ...(event.missionId === undefined ? {} : { missionId: event.missionId }),
    modality: event.modality,
    outcome: event.outcome,
    evidence: event.evidence,
    occurredAt: event.occurredAt,
    hintsUsed: event.hintsUsed,
    durationMs: event.durationMs,
  };
}

export function validateLearningEvents(value: unknown): LearningEvent[] {
  if (!Array.isArray(value)) throw new Error('Invalid learning history');
  const events = value.map(normalizeEvent);
  const ids = new Set(events.map((event) => event.id));
  if (ids.size !== events.length) throw new Error('Duplicate learning event IDs');
  return events;
}

async function readLearningEvents(): Promise<LearningEvent[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const stored = JSON.parse(raw);
  if (stored?.schemaVersion !== 1) throw new Error('Unsupported learning history version');
  return validateLearningEvents(stored.events);
}

export async function getLearningEvents(): Promise<LearningEvent[]> {
  await writes;
  return readLearningEvents();
}

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writes.then(operation);
  writes = result.catch(() => {});
  return result;
}

function boundHistory(events: LearningEvent[]): LearningEvent[] {
  return events.sort((a, b) => a.occurredAt - b.occurredAt).slice(-MAX_EVENTS);
}

export function appendLearningEvent(value: LearningEvent): Promise<boolean> {
  return serializeWrite(async () => {
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
  return serializeWrite(async () => {
    const incoming = validateLearningEvents(value);
    const current = await readLearningEvents();
    const events = new Map(current.map((event) => [event.id, event]));
    for (const event of incoming) {
      const prior = events.get(event.id);
      if (prior && JSON.stringify(prior) !== JSON.stringify(event)) {
        throw new Error('Learning event ID conflict');
      }
      events.set(event.id, event);
    }
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({
        schemaVersion: 1,
        events: boundHistory([...events.values()]),
      }),
    );
  });
}
