import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadDailyGoalSettings, saveDailyGoalSettings } from '../../src/storage/dailyGoalSettings';
import { getDailyProgress } from '../../src/storage/storage';
import { getPrefs } from '../../src/storage/prefs';
import { commitFlashcardAnswer } from '../../src/storage/flashcardAnswer';
import { getLearningEvents } from '../../src/storage/learningEvents';
const grade = () =>
  commitFlashcardAnswer({
    cardId: 'goal-review',
    quality: 4,
    attemptId: 'goal-grade',
    sessionId: 'goal-session',
  });
const write = AsyncStorage.setItem as jest.Mock;
const implementation = write.getMockImplementation()!;
beforeEach(async () => {
  write.mockImplementation(implementation);
  await AsyncStorage.clear();
  const daily = await getDailyProgress();
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ ...daily, count: 3, newCount: 2, target: 5 }),
  );
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ newCardsPerDay: 10, autoSpeak: true, uiLanguage: 'en' }),
  );
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([
      {
        id: 'goal-deck',
        name: 'Goal fixture',
        cards: [
          {
            id: 'goal-review',
            front: 'hola',
            back: 'hello',
            createdAt: 0,
            due: 0,
            reps: 0,
            interval: 0,
            ease: 2.5,
          },
        ],
      },
    ]),
  );
  write.mockClear();
});
afterEach(() => write.mockImplementation(implementation));
it.each(['settings-first', 'grade-first'])(
  'preserves a real grade, new introduction and unrelated preferences: %s',
  async (order) => {
    expect(await loadDailyGoalSettings()).toEqual({ target: 5, newCardsPerDay: 10 });
    const save = () => saveDailyGoalSettings({ target: 20, newCardsPerDay: 15 });
    await Promise.all(order === 'settings-first' ? [save(), grade()] : [grade(), save()]);
    expect(await getDailyProgress()).toMatchObject({ target: 20, count: 4, newCount: 3 });
    expect(await getPrefs()).toMatchObject({
      newCardsPerDay: 15,
      autoSpeak: true,
      uiLanguage: 'en',
    });
    expect(await getLearningEvents()).toEqual([
      expect.objectContaining({ id: 'goal-grade', cardId: 'goal-review' }),
    ]);
  },
);
it.each(['SRS_WRITE_JOURNAL_V1', 'SRS_PREFS_V1'])(
  'recovers a failed %s write and retries the same values without losing later review credit',
  async (failureKey) => {
    const beforeDaily = await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1');
    const beforePrefs = await AsyncStorage.getItem('SRS_PREFS_V1');
    let failed = false;
    write.mockImplementation(async (key: string, value: string) => {
      if (key === failureKey && !failed) {
        failed = true;
        throw new Error('disk full');
      }
      return implementation(key, value);
    });
    await expect(saveDailyGoalSettings({ target: 20, newCardsPerDay: 15 })).rejects.toThrow(
      'disk full',
    );
    if (failureKey === 'SRS_WRITE_JOURNAL_V1') {
      expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBe(beforeDaily);
      expect(await AsyncStorage.getItem('SRS_PREFS_V1')).toBe(beforePrefs);
      expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    } else {
      const journal = JSON.parse((await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1'))!);
      expect(journal.entries.map(([key]: [string]) => key)).toEqual([
        'SRS_DAILY_PROGRESS_V1',
        'SRS_PREFS_V1',
      ]);
      expect(JSON.parse((await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1'))!).target).toBe(20);
      expect(await AsyncStorage.getItem('SRS_PREFS_V1')).toBe(beforePrefs);
      expect(await loadDailyGoalSettings()).toEqual({ target: 20, newCardsPerDay: 15 });
    }
    await grade();
    await saveDailyGoalSettings({ target: 20, newCardsPerDay: 15 });
    expect(await getDailyProgress()).toMatchObject({ target: 20, count: 4, newCount: 3 });
    expect(await getPrefs()).toMatchObject({
      newCardsPerDay: 15,
      autoSpeak: true,
      uiLanguage: 'en',
    });
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    expect(await getLearningEvents()).toHaveLength(1);
  },
);
it.each([
  { target: 0, newCardsPerDay: 10 },
  { target: 10, newCardsPerDay: 101 },
  { target: 2.5, newCardsPerDay: 10 },
])('rejects invalid settings before writing: %j', async (input) => {
  await expect(saveDailyGoalSettings(input)).rejects.toThrow();
  expect(write).not.toHaveBeenCalled();
});

it('preserves a supported imported target above preset sizes when editing only the new-card limit', async () => {
  const daily = await getDailyProgress();
  await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', JSON.stringify({ ...daily, target: 125 }));
  const loaded = await loadDailyGoalSettings();
  expect(loaded).toEqual({ target: 125, newCardsPerDay: 10 });
  await saveDailyGoalSettings({ ...loaded, newCardsPerDay: 15 });
  expect(await getDailyProgress()).toMatchObject({ target: 125, count: 3, newCount: 2 });
  expect(await getPrefs()).toMatchObject({ newCardsPerDay: 15, autoSpeak: true, uiLanguage: 'en' });
});
