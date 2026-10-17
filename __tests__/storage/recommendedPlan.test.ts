import AsyncStorage from '@react-native-async-storage/async-storage';
import { openRecommendedPlan } from '../../src/storage/recommendedPlan';
import { abandonDailyPlan, readDailyPlan } from '../../src/storage/dailyPlans';
import { setPrefs } from '../../src/storage/prefs';
import { getDailyProgress } from '../../src/storage/storage';
import { DAILY_RESPONSE, availableDailyResponse } from '../../src/missions/dailyResponse';
import { ALL_DECKS } from '../../src/data/decks';

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(ALL_DECKS));
});
test('draft response requires its real registry and development gate', () => {
  expect(availableDailyResponse(ALL_DECKS, true)).toEqual(DAILY_RESPONSE);
  expect(availableDailyResponse(ALL_DECKS, false)).toBeUndefined();
  expect(availableDailyResponse([], true)).toBeUndefined();
  expect(DAILY_RESPONSE.nodes).toHaveLength(2);
});
test.each([3, 5, 10] as const)(
  'builds one bounded %s-minute plan with fresh budget, review and applied identity',
  async (studyMinutes) => {
    await setPrefs({ studyMinutes, learningReason: 'work', homeRegion: 'paisa' });
    const p = await openRecommendedPlan(true);
    expect(p?.minutes).toBe(studyMinutes);
    expect(p?.review?.session.deckId).toBe('deck-business');
    expect(p?.applied).toMatchObject({
      missionId: DAILY_RESPONSE.id,
      contentVersion: DAILY_RESPONSE.contentVersion,
    });
    const limit = Math.min(15, Math.floor((studyMinutes * 60 - 60) / 45));
    expect(p?.review?.session.queue?.limits?.cardLimit).toBe(limit);
    expect(p?.review?.session.queue?.cardIds.length).toBeLessThanOrEqual(limit);
    expect((await getDailyProgress()).count).toBe(0);
  },
);
test('competing starts, preference/day changes and restart resume the same exact identity', async () => {
  const [a, b] = await Promise.all([openRecommendedPlan(true), openRecommendedPlan(true)]);
  expect(a).toEqual(b);
  await setPrefs({ studyMinutes: 10, learningReason: 'culture' });
  expect(await openRecommendedPlan(true)).toEqual(a);
  await expect(abandonDailyPlan('wrong')).rejects.toThrow();
  await abandonDailyPlan(a!.id);
  expect(await readDailyPlan()).toBeUndefined();
  expect((await openRecommendedPlan(true))?.id).not.toBe(a!.id);
});
test('production creates no draft activity and exhausted new-card cap permits applied-only draft practice', async () => {
  expect((await openRecommendedPlan(false))?.applied).toBeUndefined();
  await abandonDailyPlan((await readDailyPlan())!.id);
  const daily = await getDailyProgress();
  await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', JSON.stringify({ ...daily, newCount: 10 }));
  const p = await openRecommendedPlan(true);
  expect(p?.phase).toBe('applied');
  expect(p?.review).toBeUndefined();
  expect(p?.applied?.missionId).toBe(DAILY_RESPONSE.id);
});

test('catch-up start uses fresh last-review state and freezes a familiar-only exact queue', async () => {
  jest.useFakeTimers({ now: new Date(2026, 2, 29, 12) });
  try {
    const source = ALL_DECKS.find((d) => d.id === 'deck-business')!;
    const decks = [
      {
        ...source,
        cards: source.cards
          .slice(0, 4)
          .map((c, i) => (i === 0 ? { ...c, reps: 3, interval: 4, due: 0 } : c)),
      },
    ];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 12, lastStudyDate: '2026-03-22', freezes: 1 }),
    );
    await setPrefs({ studyMinutes: 3, learningReason: 'work' });
    const before = await AsyncStorage.getItem('SRS_DECKS_V3');
    const plan = await openRecommendedPlan(false);
    expect(plan?.review?.initialCardIds).toEqual([source.cards[0].id]);
    expect(plan?.review?.session.queue?.limits).toEqual({ cardLimit: 4, newLimit: 0 });
    expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe(before);
    expect((await getDailyProgress()).count).toBe(0);
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ lastStudyDate: '2026-03-29' }),
    );
    await setPrefs({ studyMinutes: 10 });
    expect(await openRecommendedPlan(false)).toEqual(plan);
  } finally {
    jest.useRealTimers();
  }
});

test.each([
  ['SRS_STREAK_V1', { lastStudyDate: '2026-03-01T12:00:00.000Z' }, 1],
  ['SRS_STUDY_STREAK_V1', { lastStudyDate: 'invalid' }, 4],
  ['SRS_STUDY_STREAK_V1', null, 4],
] as const)(
  'last-review history normalizes legacy or unknown state: %s %j',
  async (key, history, count) => {
    jest.useFakeTimers({ now: new Date(2026, 2, 29, 12) });
    try {
      const source = ALL_DECKS.find((d) => d.id === 'deck-business')!;
      await AsyncStorage.setItem(
        'SRS_DECKS_V3',
        JSON.stringify([
          {
            ...source,
            cards: source.cards
              .slice(0, 4)
              .map((c, i) => (i === 0 ? { ...c, reps: 3, interval: 4, due: 0 } : c)),
          },
        ]),
      );
      await AsyncStorage.setItem(key, JSON.stringify(history));
      await setPrefs({ studyMinutes: 3, learningReason: 'work' });
      expect((await openRecommendedPlan(false))?.review?.initialCardIds).toHaveLength(count);
    } finally {
      jest.useRealTimers();
    }
  },
);
