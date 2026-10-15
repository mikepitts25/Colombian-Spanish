import { recommendDailyReview, reviewLimits } from '../../src/utils/dailyReview';
import { Deck, FlashCard } from '../../src/types';
const card = (id: string, patch: Partial<FlashCard> = {}): FlashCard => ({
  id,
  front: id,
  back: id,
  createdAt: 0,
  due: 0,
  reps: 0,
  interval: 0,
  ease: 2.5,
  ...patch,
});
const deck = (id: string, cards: FlashCard[]): Deck => ({ id, name: id, cards });
const prefs = {
  learningReason: 'work' as const,
  homeRegion: 'paisa' as const,
  learningLevel: 'beginner' as const,
  studyMinutes: 3 as const,
};
const now = 1000;
test('prioritizes overdue review and bounds an absence backlog', () => {
  const d = deck(
    'backlog',
    Array.from({ length: 100 }, (_, i) => card(String(i), { reps: 3, interval: 3 })),
  );
  expect(
    recommendDailyReview([deck('deck-business', [card('fresh')]), d], prefs, 10, now),
  ).toMatchObject({
    deckId: 'backlog',
    cardLimit: 4,
    newLimit: 3,
    cardCount: 4,
    dueCount: 4,
    newCount: 0,
  });
});
test('uses purpose then regional evidence and preserves a general fallback', () => {
  const general = deck('deck-greetings', [card('g')]);
  const regional = deck('regional', [card('p', { regions: ['paisa'] })]);
  const work = deck('deck-business', [card('w')]);
  expect(recommendDailyReview([general, regional, work], prefs, 10, now)?.deckId).toBe(work.id);
  expect(recommendDailyReview([general, regional], prefs, 10, now)?.deckId).toBe(regional.id);
  expect(recommendDailyReview([general], prefs, 10, now)?.deckId).toBe(general.id);
});
test('never selects future-only, exhausted, empty or new-card-cap-blocked content', () => {
  const future = deck('future', [card('later', { reps: 2, interval: 2, due: 2000 })]);
  expect(recommendDailyReview([future], prefs, 10, now)).toBeUndefined();
  expect(recommendDailyReview([deck('empty', [])], prefs, 10, now)).toBeUndefined();
  expect(recommendDailyReview([deck('fresh', [card('new')])], prefs, 0, now)).toBeUndefined();
});
test('combines due and bounded new material without inventing available cards', () => {
  const d = deck('mixed', [
    card('due', { reps: 1, interval: 1 }),
    ...Array.from({ length: 20 }, (_, i) => card(String(i))),
  ]);
  expect(recommendDailyReview([d], prefs, 2, now)).toMatchObject({
    cardCount: 3,
    dueCount: 1,
    newCount: 2,
  });
});
test('all time/level choices stay bounded and invalid configuration falls back', () => {
  for (const minutes of [3, 5, 10])
    for (const level of ['beginner', 'basic', 'confident']) {
      const limits = reviewLimits(minutes, level);
      expect(limits.cardLimit).toBeGreaterThan(0);
      expect(limits.cardLimit).toBeLessThanOrEqual(15);
      expect(limits.newLimit).toBeLessThanOrEqual(limits.cardLimit);
    }
  expect(reviewLimits(999, 'fake')).toEqual(reviewLimits(5, 'beginner'));
  expect(reviewLimits(10, 'confident').cardLimit).toBe(15);
});
test('ties prefer the active deck without overriding purpose or due priority', () => {
  const a = deck('a', [card('a')]),
    b = deck('b', [card('b')]);
  expect(
    recommendDailyReview(
      [a, b],
      { ...prefs, learningReason: 'general', homeRegion: 'all' },
      10,
      now,
      'b',
    )?.deckId,
  ).toBe('b');
});

test('estimates the selected workload rather than claiming a full budget for one card', () => {
  expect(
    recommendDailyReview([deck('one', [card('a')])], { ...prefs, studyMinutes: 10 }, 10, now),
  ).toMatchObject({ cardCount: 1, estimatedMinutes: 1 });
});
