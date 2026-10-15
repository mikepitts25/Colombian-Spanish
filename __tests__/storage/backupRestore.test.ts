import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreBackup } from '../../src/storage/backupRestore';
import {
  appendLearningEvent,
  getLearningEvents,
  LearningEvent,
} from '../../src/storage/learningEvents';
import { loadDecks } from '../../src/storage/storage';
import { Deck } from '../../src/types';

const decks: Deck[] = [{ id: 'new', name: 'Restored', cards: [] }];
const event: LearningEvent = {
  schemaVersion: 1,
  id: 'e1',
  sessionId: 's1',
  cardId: 'c1',
  deckId: 'd1',
  modality: 'recognition',
  outcome: 'correct',
  evidence: 'answer-checked',
  occurredAt: 1000,
  hintsUsed: 0,
  durationMs: null,
};
const originalSet = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
beforeEach(async () => {
  (AsyncStorage.setItem as jest.Mock).mockImplementation(originalSet);
  await AsyncStorage.clear();
});

it('replaces decks and merges observations without deleting newer local history', async () => {
  await appendLearningEvent(event);
  const incoming = { ...event, id: 'e2', occurredAt: 500 };
  await restoreBackup(decks, [incoming]);
  expect(await loadDecks()).toEqual(decks);
  expect(await getLearningEvents()).toEqual([incoming, event]);
});

it('preserves history for a legacy restore', async () => {
  await appendLearningEvent(event);
  await restoreBackup(decks);
  expect(await getLearningEvents()).toEqual([event]);
  expect(await loadDecks()).toEqual(decks);
});

it('validates conflicts and decks before writing either key', async () => {
  await appendLearningEvent(event);
  await expect(restoreBackup(decks, [{ ...event, outcome: 'incorrect' }])).rejects.toThrow(
    'conflict',
  );
  await expect(restoreBackup([{ ...decks[0], cards: [null as any] }], [])).rejects.toThrow();
  expect(await loadDecks()).toEqual([]);
  expect(await getLearningEvents()).toEqual([event]);
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
});

it('recovers history and decks together after the second data write fails', async () => {
  await appendLearningEvent(event);
  let fail = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => {
    if (key === 'SRS_LEARNING_EVENTS_V1' && fail) {
      fail = false;
      throw new Error('disk full');
    }
    return originalSet(key, value);
  });
  const incoming = { ...event, id: 'e2' };
  await expect(restoreBackup(decks, [incoming])).rejects.toThrow('disk full');
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
  // Public reads must recover first, without an explicit manual recovery command.
  expect(await getLearningEvents()).toHaveLength(2);
  expect(await loadDecks()).toEqual(decks);
  await restoreBackup(decks, [incoming]);
  expect(await getLearningEvents()).toHaveLength(2);
});

it('serializes concurrent append with restore without losing either observation', async () => {
  await Promise.all([
    restoreBackup(decks, [event]),
    appendLearningEvent({ ...event, id: 'later' }),
  ]);
  expect((await getLearningEvents()).map((e) => e.id).sort()).toEqual(['e1', 'later']);
});
