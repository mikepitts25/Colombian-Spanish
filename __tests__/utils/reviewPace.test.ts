import { calibratedReviewSeconds } from '../../src/utils/reviewPace';
import { LearningEvent } from '../../src/storage/learningEvents';
import { recommendDailyReview } from '../../src/utils/dailyReview';

const now = 10000000000;
const sample = (i: number, durationMs = 20000): LearningEvent => ({
  schemaVersion: 1,
  id: `e${i}`,
  cardId: `c${i}`,
  deckId: 'd',
  sessionId: `s${i % 2}`,
  modality: 'recall',
  evidence: 'self-rated',
  outcome: 'correct',
  quality: 4,
  occurredAt: now - i,
  hintsUsed: null,
  durationMs,
});
test('requires five timed observations across two sessions and ignores legacy/other evidence', () => {
  expect(
    calibratedReviewSeconds(
      Array.from({ length: 4 }, (_, i) => sample(i)),
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedReviewSeconds(
      Array.from({ length: 8 }, (_, i) => ({ ...sample(i), sessionId: 'one' })),
      now,
    ),
  ).toBeUndefined();
  const ignored = [
    { ...sample(9), durationMs: null },
    { ...sample(10), modality: 'recognition' as const },
    { ...sample(11), missionId: 'mission' },
    { ...sample(12), evidence: 'answer-checked' as const },
    { ...sample(13), occurredAt: now + 1 },
    { ...sample(14), occurredAt: 0 },
    sample(15, 1000),
    sample(16, 180001),
  ];
  expect(calibratedReviewSeconds(ignored, now)).toBeUndefined();
  expect(
    calibratedReviewSeconds([...ignored, ...Array.from({ length: 5 }, (_, i) => sample(i))], now),
  ).toBe(20);
});
test('uses a bounded recent median, deduplicates IDs and never treats speed as mastery', () => {
  const five = [
    sample(0, 3000),
    sample(1, 5000),
    sample(2, 20000),
    sample(3, 90000),
    sample(4, 170000),
  ];
  expect(calibratedReviewSeconds(five, now)).toBe(20);
  expect(calibratedReviewSeconds(Array(5).fill(sample(1)), now)).toBeUndefined();
  expect(
    calibratedReviewSeconds(
      Array.from({ length: 5 }, (_, i) => sample(i, 3000)),
      now,
    ),
  ).toBe(15);
  expect(
    calibratedReviewSeconds(
      Array.from({ length: 5 }, (_, i) => sample(i, 150000)),
      now,
    ),
  ).toBe(90);
  expect(
    calibratedReviewSeconds(
      [
        ...Array.from({ length: 30 }, (_, i) => sample(i, 30000)),
        ...Array.from({ length: 30 }, (_, i) => sample(i + 30, 150000)),
      ],
      now,
    ),
  ).toBe(30);
});
test('calibrates the bounded workload while preserving due priority and new-card caps', () => {
  const cards = Array.from({ length: 30 }, (_, i) => ({
    id: String(i),
    front: 'hola',
    back: 'hello',
    reps: 0,
    interval: 0,
    ease: 2.5,
    due: 0,
    createdAt: 0,
  }));
  const profile = { studyMinutes: 3 as const, learningLevel: 'beginner' as const };
  const decks = [{ id: 'd', name: 'Test', cards }];
  expect(recommendDailyReview(decks, profile, 10, now, undefined, 20)).toMatchObject({
    cardLimit: 9,
    newLimit: 3,
    cardCount: 3,
  });
  expect(recommendDailyReview(decks, profile, 10, now, undefined, 90)).toMatchObject({
    cardLimit: 2,
    newLimit: 2,
  });
  expect(recommendDailyReview(decks, profile, 0, now, undefined, 20)).toBeUndefined();
  expect(recommendDailyReview(decks, profile, 10, now, undefined, NaN)?.cardLimit).toBe(4);
});
