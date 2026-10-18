import AsyncStorage from '@react-native-async-storage/async-storage';
import { commitFlashcardAnswer } from '../../src/storage/flashcardAnswer';
import {
  getDailyProgress,
  getSeenWords,
  loadDecks,
  getLastStudySession,
} from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { setPrefs } from '../../src/storage/prefs';
import { FlashCard } from '../../src/types';
const card = (id: string): FlashCard => ({
  id,
  front: 'hola',
  back: 'hello',
  createdAt: 0,
  due: 0,
  reps: 0,
  interval: 0,
  ease: 2.5,
});
const attempt = {
  attemptId: 'attempt1',
  sessionId: 'study1',
  cardId: 'c1',
  quality: 4 as const,
  nextSession: { deckId: 'd1', cardId: 'c2' },
};
const originalSet = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
beforeEach(async () => {
  (AsyncStorage.setItem as jest.Mock).mockImplementation(originalSet);
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([{ id: 'd1', name: 'Test', cards: [card('c1'), card('c2')] }]),
  );
});
it('commits schedule, budget, seen word, self-rated event and next pointer together', async () => {
  await commitFlashcardAnswer(attempt);
  expect((await loadDecks())[0].cards[0].reps).toBe(1);
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
  expect(await getSeenWords()).toEqual([
    expect.objectContaining({ cardId: 'c1', correctCount: 1 }),
  ]);
  expect(await getLastStudySession()).toMatchObject({ deckId: 'd1', cardId: 'c2' });
  expect(await getLearningEvents()).toEqual([
    expect.objectContaining({
      id: 'attempt1',
      sessionId: 'study1',
      modality: 'recall',
      evidence: 'self-rated',
      outcome: 'correct',
      hintsUsed: null,
      durationMs: null,
    }),
  ]);
});
it('deduplicates a retained attempt and rejects conflicting retries', async () => {
  await commitFlashcardAnswer(attempt);
  await commitFlashcardAnswer(attempt);
  expect((await loadDecks())[0].cards[0].reps).toBe(1);
  expect((await getDailyProgress()).count).toBe(1);
  await expect(commitFlashcardAnswer({ ...attempt, quality: 1 })).rejects.toThrow('conflict');
  expect(await getLearningEvents()).toHaveLength(1);
});
it('journals measured active duration with the grade and keeps retry timing immutable', async () => {
  const timed = { ...attempt, durationMs: 23456 };
  await commitFlashcardAnswer(timed);
  await commitFlashcardAnswer(timed);
  expect((await getLearningEvents())[0].durationMs).toBe(23456);
  await expect(commitFlashcardAnswer({ ...timed, durationMs: 34567 })).rejects.toThrow('conflict');
  expect((await getDailyProgress()).count).toBe(1);
});
it.each([-1, NaN, Infinity, 1.5])(
  'rejects invalid active duration %s before writing',
  async (durationMs) => {
    await expect(commitFlashcardAnswer({ ...attempt, durationMs })).rejects.toThrow('Invalid');
    expect(await getLearningEvents()).toHaveLength(0);
    expect((await loadDecks())[0].cards[0].reps).toBe(0);
  },
);
it('recovers a failed partial grade without duplicating it on retry', async () => {
  let fail = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => {
    if (key === 'SRS_SEEN_WORDS_V1' && fail) {
      fail = false;
      throw new Error('disk full');
    }
    return originalSet(key, value);
  });
  await expect(commitFlashcardAnswer(attempt)).rejects.toThrow('disk full');
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
  await commitFlashcardAnswer(attempt);
  expect((await getDailyProgress()).count).toBe(1);
  expect((await getDailyProgress()).newCount).toBe(1);
  expect((await getSeenWords())[0].correctCount).toBe(1);
  expect(await getLearningEvents()).toHaveLength(1);
  expect((await loadDecks())[0].cards[0].reps).toBe(1);
});
it('enforces a shared daily new-card cap across concurrent attempts', async () => {
  await setPrefs({ newCardsPerDay: 1 });
  const outcomes = await Promise.allSettled([
    commitFlashcardAnswer(attempt),
    commitFlashcardAnswer({ ...attempt, attemptId: 'attempt2', cardId: 'c2' }),
  ]);
  expect(outcomes.map((result) => result.status)).toEqual(['fulfilled', 'rejected']);
  expect((await getDailyProgress()).newCount).toBe(1);
  expect(await getLearningEvents()).toHaveLength(1);
});
it('reads current stored decks and retains edits absent from an old provider snapshot', async () => {
  const decks = await loadDecks();
  decks[0].cards[0].favorite = true;
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
  await commitFlashcardAnswer(attempt);
  expect((await loadDecks())[0].cards[0].favorite).toBe(true);
});
it('keeps unknown-card calls as no-ops', async () => {
  await commitFlashcardAnswer({ ...attempt, cardId: 'missing' });
  expect(await getLearningEvents()).toEqual([]);
  expect(await getSeenWords()).toEqual([]);
});

it('rejects a changed queue even when card meaning and session ID are retained', async () => {
  const session = {
    deckId: 'd1',
    cardId: 'c1',
    queue: {
      schemaVersion: 1 as const,
      cardIds: ['c1', 'c2'],
      region: 'all' as const,
      sessionId: 'study1',
    },
  };
  await AsyncStorage.setItem(
    'SRS_LAST_STUDY_SESSION_V1',
    JSON.stringify({
      ...session,
      updatedAt: 100,
      queue: { ...session.queue, cardIds: ['c1'] },
    }),
  );
  const before = await AsyncStorage.multiGet(await AsyncStorage.getAllKeys());
  await expect(
    commitFlashcardAnswer({
      ...attempt,
      context: { deckId: 'd1', front: 'hola', back: 'hello', session },
    }),
  ).rejects.toThrow('Displayed card or study queue changed');
  expect(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys())).toEqual(before);
});

it('allows metadata and scheduling changes without invalidating displayed meaning', async () => {
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([
      {
        id: 'd1',
        name: 'Renamed',
        cards: [card('c1'), card('c2')].map((c) => ({
          ...c,
          flagged: true,
          reviewedAt: 100,
          reviewStatus: 'approved',
          reps: 3,
          interval: 5,
        })),
      },
    ]),
  );
  await commitFlashcardAnswer({
    ...attempt,
    context: { deckId: 'd1', front: 'hola', back: 'hello' },
  });
  expect((await loadDecks())[0]).toMatchObject({
    name: 'Renamed',
    cards: [
      expect.objectContaining({ flagged: true, reviewedAt: 100, reps: 4 }),
      expect.objectContaining({ flagged: true, reviewedAt: 100, reps: 3 }),
    ],
  });
  expect(await getLearningEvents()).toHaveLength(1);
});

it.each(['card', 'deck'] as const)(
  'rejects a new displayed answer after its %s was removed without changing any record',
  async (removed) => {
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify(removed === 'deck' ? [] : [{ id: 'd1', name: 'Test', cards: [card('c2')] }]),
    );
    const before = await AsyncStorage.multiGet(await AsyncStorage.getAllKeys());
    await expect(
      commitFlashcardAnswer({
        ...attempt,
        context: { deckId: 'd1', front: 'hola', back: 'hello' },
      }),
    ).rejects.toThrow('Displayed card or study queue changed');
    expect(await AsyncStorage.multiGet(await AsyncStorage.getAllKeys())).toEqual(before);
  },
);
