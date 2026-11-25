import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  acknowledgeOnboardingHandoff,
  completeOnboarding,
  readOnboardingLaunch,
} from '../../src/storage/onboarding';
import { getPrefs } from '../../src/storage/prefs';
import { getDailyProgress, saveLastStudySession } from '../../src/storage/storage';
import { localDayKey } from '../../src/utils/calendarDay';

beforeEach(async () => {
  await AsyncStorage.clear();
});
const intent = { reason: 'travel', region: 'all', target: 10 } as const;
const handoff = {
  id: 'starting-practice',
  savedAt: 100,
  intent,
  destination: { kind: 'study', id: 'deck-travel' },
} as const;

test('a partial completion preserves the exact pending practice until delivery', async () => {
  const setItem = AsyncStorage.setItem as jest.Mock;
  const actual = setItem.getMockImplementation()!;
  setItem
    .mockImplementationOnce(actual)
    .mockImplementationOnce(actual)
    .mockRejectedValueOnce(new Error('partial save'));
  await expect(completeOnboarding(intent, handoff)).rejects.toThrow('partial save');
  expect(await readOnboardingLaunch()).toEqual({ onboarded: true, handoff });
  await completeOnboarding(intent, handoff);
  await acknowledgeOnboardingHandoff('different-delivery');
  expect(await readOnboardingLaunch()).toEqual({ onboarded: true, handoff });
  await acknowledgeOnboardingHandoff(handoff.id);
  expect(await readOnboardingLaunch()).toEqual({ onboarded: true });
});

test('an already-started review takes precedence over uncleared onboarding recovery', async () => {
  await completeOnboarding(intent, handoff);
  await saveLastStudySession({ deckId: 'different-deck', cardId: 'card' });
  expect(await readOnboardingLaunch()).toEqual({ onboarded: true });
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
