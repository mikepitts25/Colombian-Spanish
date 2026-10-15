import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeOnboarding } from '../../src/storage/onboarding';
import { getPrefs } from '../../src/storage/prefs';
import { getDailyProgress } from '../../src/storage/storage';
import { localDayKey } from '../../src/utils/calendarDay';

beforeEach(async () => {
  await AsyncStorage.clear();
});
test('saves one intent preserving counters and unrelated preferences', async () => {
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ autoSpeak: true, newCardsPerDay: 7, uiLanguage: 'en' }),
  );
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ date: localDayKey(), count: 4, newCount: 2, target: 5 }),
  );
  await completeOnboarding({ reason: 'travel', region: 'paisa', target: 20 });
  expect(await getPrefs()).toMatchObject({
    onboardingDone: true,
    learningReason: 'travel',
    homeRegion: 'paisa',
    autoSpeak: true,
    newCardsPerDay: 7,
    uiLanguage: 'en',
  });
  expect(await getDailyProgress()).toMatchObject({ target: 20, count: 4, newCount: 2 });
});
test('a partial write replays both settings before subsequent reads and retry is safe', async () => {
  const setItem = AsyncStorage.setItem as jest.Mock;
  const actual = setItem.getMockImplementation()!;
  setItem
    .mockImplementationOnce(actual)
    .mockImplementationOnce(actual)
    .mockRejectedValueOnce(new Error('partial write'));
  await expect(completeOnboarding({ reason: 'work', region: 'rolo', target: 5 })).rejects.toThrow(
    'partial write',
  );
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
  expect(await getPrefs()).toMatchObject({
    onboardingDone: true,
    learningReason: 'work',
    homeRegion: 'rolo',
  });
  expect(await getDailyProgress()).toMatchObject({ target: 5, count: 0, newCount: 0 });
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  await completeOnboarding({ reason: 'work', region: 'rolo', target: 5 });
  expect(await getDailyProgress()).toMatchObject({ target: 5, count: 0, newCount: 0 });
});
test.each([
  { reason: 'invalid' },
  { region: 'invalid' },
  { target: NaN },
  { target: 0 },
  { target: 1.5 },
  { target: 101 },
])('rejects invalid onboarding intent before any write %j', async (patch) => {
  await expect(
    completeOnboarding({ reason: 'travel', region: 'all', target: 10, ...patch } as any),
  ).rejects.toThrow();
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});
