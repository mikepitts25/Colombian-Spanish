import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLastStudySession, saveLastStudySession } from '../../src/storage/storage';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
const queue = {
  schemaVersion: 1,
  cardIds: ['c3', 'c2'],
  region: 'paisa',
  sessionId: 'session-saved',
};
beforeEach(async () => {
  await AsyncStorage.clear();
});
it('round-trips exact queue/order/region/identity through session storage and version-3 backup', async () => {
  const saved = await saveLastStudySession({ deckId: 'd1', cardId: 'c3', queue } as any);
  expect(await getLastStudySession()).toEqual(saved);
  const backup = await captureBackupSnapshot();
  expect(parseBackupText(JSON.stringify(backup)).applicationState?.lastSession).toEqual(saved);
});
it.each([
  { ...queue, schemaVersion: 99 },
  { ...queue, cardIds: ['c3', 'c3'] },
  { ...queue, cardIds: Array.from({ length: 16 }, (_, i) => `c${i}`) },
  { ...queue, region: 'unknown' },
  { ...queue, sessionId: '' },
])(
  'rejects malformed queue snapshots before writes and ignores them on legacy reads',
  async (queue) => {
    const invalid = { deckId: 'd1', cardId: 'c3', queue };
    await expect(saveLastStudySession(invalid as any)).rejects.toThrow();
    expect(await AsyncStorage.getItem('SRS_LAST_STUDY_SESSION_V1')).toBeNull();
    await AsyncStorage.setItem(
      'SRS_LAST_STUDY_SESSION_V1',
      JSON.stringify({ ...invalid, updatedAt: 1 }),
    );
    expect(await getLastStudySession()).toBeUndefined();
  },
);
it('does not accept a pointer inconsistent with the remaining queue', async () => {
  await expect(
    saveLastStudySession({ deckId: 'd1', cardId: 'c1', queue } as any),
  ).rejects.toThrow();
});
it('recovers the exact next queue with an interrupted grade and deduplicates its retry', async () => {
  const { commitFlashcardAnswer } = require('../../src/storage/flashcardAnswer');
  const { loadDecks, getDailyProgress } = require('../../src/storage/storage');
  const card = (id: string) => ({
    id,
    front: 'hola',
    back: 'hello',
    due: 0,
    createdAt: 0,
    reps: 0,
    interval: 0,
    ease: 2.5,
  });
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([{ id: 'd1', name: 'Test', cards: [card('c1'), card('c2')] }]),
  );
  const attempt = {
    attemptId: 'queue-grade',
    sessionId: 'original-session',
    cardId: 'c1',
    quality: 4,
    nextSession: {
      deckId: 'd1',
      cardId: 'c2',
      queue: { schemaVersion: 1, cardIds: ['c2'], region: 'all', sessionId: 'original-session' },
    },
  };
  const write = AsyncStorage.setItem as jest.Mock;
  const original = write.getMockImplementation()!;
  let fail = true;
  write.mockImplementation(async (key, value) => {
    if (key === 'SRS_LAST_STUDY_SESSION_V1' && fail) {
      fail = false;
      throw new Error('interrupted');
    }
    return original(key, value);
  });
  try {
    await expect(commitFlashcardAnswer(attempt)).rejects.toThrow('interrupted');
    expect(await getLastStudySession()).toMatchObject(attempt.nextSession);
    await commitFlashcardAnswer(attempt);
    expect((await loadDecks())[0].cards[0].reps).toBe(1);
    expect((await getDailyProgress()).count).toBe(1);
    expect(await getLastStudySession()).toMatchObject(attempt.nextSession);
  } finally {
    write.mockImplementation(original);
  }
});
