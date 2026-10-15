import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrefs, setPrefs } from '../../src/storage/prefs';
import { saveLearningProfile, isTripDate } from '../../src/storage/learningProfile';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
const profile = {
  learningReason: 'travel' as const,
  homeRegion: 'paisa' as const,
  learningLevel: 'basic' as const,
  studyMinutes: 5 as const,
  tripDate: '2027-02-28',
};
beforeEach(async () => {
  await AsyncStorage.clear();
});
test('legacy profiles get editable planning defaults without changing saved purpose or region', async () => {
  await setPrefs({ learningReason: 'work', homeRegion: 'rolo' });
  expect(await getPrefs()).toMatchObject({
    learningReason: 'work',
    homeRegion: 'rolo',
    learningLevel: 'beginner',
    studyMinutes: 5,
    tripDate: null,
  });
});
test.each(['2028-02-29', '2026-01-01', '2000-02-29'])(
  'accepts a real calendar trip date %s',
  (date) => {
    expect(isTripDate(date)).toBe(true);
  },
);
test.each([
  '2027-02-29',
  '2026-02-30',
  '2026-13-01',
  '2026-1-1',
  '2026-01-01T00:00:00Z',
  'not-date',
])('rejects a malformed trip date %s', (date) => {
  expect(isTripDate(date)).toBe(false);
});
test('saves only learning fields, preserving audio, language, cap, onboarding and daily state', async () => {
  await setPrefs({ autoSpeak: true, uiLanguage: 'en', newCardsPerDay: 7, onboardingDone: true });
  await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', 'untouched');
  await saveLearningProfile(profile);
  expect(await getPrefs()).toMatchObject({
    ...profile,
    autoSpeak: true,
    uiLanguage: 'en',
    newCardsPerDay: 7,
    onboardingDone: true,
  });
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBe('untouched');
  await saveLearningProfile({ ...profile, tripDate: null });
  expect((await getPrefs()).tripDate).toBeNull();
});
test.each([
  { learningReason: 'wrong' },
  { homeRegion: 'wrong' },
  { learningLevel: 'expert' },
  { studyMinutes: 4 },
  { tripDate: '2027-02-29' },
])('rejects an invalid profile before writes %j', async (patch) => {
  await expect(saveLearningProfile({ ...profile, ...patch } as any)).rejects.toThrow();
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});
test('normalizes corrupt planning fields to safe defaults', async () => {
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ learningLevel: 'fake', studyMinutes: -1, tripDate: '2027-02-29' }),
  );
  expect(await getPrefs()).toMatchObject({
    learningLevel: 'beginner',
    studyMinutes: 5,
    tripDate: null,
  });
});
test('profile survives version-3 capture, strict parse and app-state restore', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', '[]');
  await saveLearningProfile(profile);
  const snapshot = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
  expect(snapshot.applicationState!.prefs).toMatchObject(profile);
  await AsyncStorage.clear();
  await restoreBackup(
    snapshot.decks,
    snapshot.learningEvents,
    'replace-state',
    snapshot.applicationState,
  );
  expect(await getPrefs()).toMatchObject(profile);
  const invalid = {
    ...snapshot,
    applicationState: {
      ...snapshot.applicationState,
      prefs: { ...profile, tripDate: '2027-02-29' },
    },
  };
  expect(() => parseBackupText(JSON.stringify(invalid))).toThrow();
});
