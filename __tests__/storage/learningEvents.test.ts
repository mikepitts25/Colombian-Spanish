import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendLearningEvent,
  getLearningEvents,
  mergeLearningEvents,
  LearningEvent,
} from '../../src/storage/learningEvents';

const KEY = 'SRS_LEARNING_EVENTS_V1';
const event = (id: string, overrides: Partial<LearningEvent> = {}): LearningEvent => ({
  schemaVersion: 1,
  id,
  cardId: 'card-a',
  deckId: 'deck-a',
  sessionId: 'session-a',
  modality: 'recognition',
  outcome: 'correct',
  evidence: 'answer-checked',
  occurredAt: 1000,
  hintsUsed: 0,
  durationMs: 2500,
  ...overrides,
});
beforeEach(async () => {
  await AsyncStorage.clear();
});

test('starts without inventing learning events from legacy card repetitions', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([{ cards: [{ reps: 9 }] }]));
  expect(await getLearningEvents()).toEqual([]);
  expect(await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1')).toBeNull();
});
test('persists a versioned event and makes a retry with the same ID a no-op', async () => {
  expect(await appendLearningEvent(event('one'))).toBe(true);
  expect(await appendLearningEvent(event('one'))).toBe(false);
  expect(await getLearningEvents()).toEqual([event('one')]);
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!).schemaVersion).toBe(1);
});
test('serializes concurrent appends and rejects reuse of an ID for another answer', async () => {
  await Promise.all([appendLearningEvent(event('one')), appendLearningEvent(event('two'))]);
  expect((await getLearningEvents()).map((item) => item.id)).toEqual(['one', 'two']);
  await expect(appendLearningEvent(event('one', { outcome: 'incorrect' }))).rejects.toThrow(
    'conflict',
  );
  expect(await appendLearningEvent(event('three'))).toBe(true);
});
test('keeps modalities and evidence separate, including unknown hints and timing', async () => {
  const items = [
    event('a'),
    event('b', { modality: 'recall', evidence: 'self-rated', hintsUsed: null, durationMs: null }),
    event('c', { modality: 'listening' }),
    event('d', { modality: 'speaking' }),
  ];
  for (const item of items) await appendLearningEvent(item);
  expect(await getLearningEvents()).toEqual(items);
});
test('does not overwrite corrupt or unsupported stored history', async () => {
  for (const raw of [
    'broken-json',
    JSON.stringify({ schemaVersion: 99, events: [] }),
    JSON.stringify({ schemaVersion: 1, events: [{ id: 'broken' }] }),
  ]) {
    await AsyncStorage.setItem(KEY, raw);
    await expect(appendLearningEvent(event('one'))).rejects.toThrow();
    expect(await AsyncStorage.getItem(KEY)).toBe(raw);
  }
});
test('can retry a failed storage write without duplicating its event', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  await expect(appendLearningEvent(event('one'))).rejects.toThrow('disk full');
  expect(await appendLearningEvent(event('one'))).toBe(true);
  expect(await getLearningEvents()).toEqual([event('one')]);
});
test.each([
  { durationMs: -1 },
  { hintsUsed: 0.5 },
  { occurredAt: NaN },
  { cardId: '' },
  { modality: 'made-up' },
  { schemaVersion: 2 },
])('rejects invalid event data before touching stored history: %s', async (invalid) => {
  await expect(
    appendLearningEvent(event('one', invalid as Partial<LearningEvent>)),
  ).rejects.toThrow();
  expect(await AsyncStorage.getItem(KEY)).toBeNull();
});
test('bounds history to the newest 5000 observations without losing concurrent writes', async () => {
  const prior = Array.from({ length: 4999 }, (_, i) => event(`old-${i}`, { occurredAt: i }));
  await AsyncStorage.setItem(KEY, JSON.stringify({ schemaVersion: 1, events: prior }));
  await Promise.all([
    appendLearningEvent(event('new-a', { occurredAt: 6000 })),
    appendLearningEvent(event('new-b', { occurredAt: 6001 })),
  ]);
  const history = await getLearningEvents();
  expect(history).toHaveLength(5000);
  expect(history[0].id).toBe('old-1');
  expect(history.slice(-2).map((item) => item.id)).toEqual(['new-a', 'new-b']);
});

test('merges a backup without losing newer observations and deduplicates retained IDs', async () => {
  await appendLearningEvent(event('local', { occurredAt: 2000 }));
  await mergeLearningEvents([event('imported'), event('local', { occurredAt: 2000 })]);
  expect((await getLearningEvents()).map((item) => item.id)).toEqual(['imported', 'local']);
});
test('rejects invalid or conflicting imports without changing local history', async () => {
  await appendLearningEvent(event('local'));
  const prior = await AsyncStorage.getItem(KEY);
  await expect(mergeLearningEvents([{ id: 'bad' }])).rejects.toThrow();
  await expect(mergeLearningEvents([event('local', { outcome: 'incorrect' })])).rejects.toThrow(
    'conflict',
  );
  expect(await AsyncStorage.getItem(KEY)).toBe(prior);
});

it('waits for already queued saves before returning history to a newly focused screen', async () => {
  const setItem = AsyncStorage.setItem as jest.Mock;
  const actualWrite = setItem.getMockImplementation()!;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  setItem.mockImplementationOnce(async (...args) => {
    await gate;
    return actualWrite(...args);
  });
  const saving = appendLearningEvent(event('pending'));
  const reading = getLearningEvents();
  release();
  await saving;
  expect(await reading).toEqual([event('pending')]);
});
