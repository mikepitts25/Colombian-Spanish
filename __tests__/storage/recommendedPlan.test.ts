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
