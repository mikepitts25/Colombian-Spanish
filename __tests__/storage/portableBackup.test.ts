import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
const key = 'SRS_PREFS_V1';
const state = {
  prefs: { uiLanguage: 'en', newCardsPerDay: 4 },
  daily: { date: '2026-10-15T00:00:00.000Z', count: 3, newCount: 2, target: 5 },
  streak: { streak: 8, freezes: 1, lastStudyDate: '2026-10-15T00:00:00.000Z' },
  seenWords: [
    {
      cardId: 'c1',
      deckId: 'd1',
      front: 'hola',
      back: 'hello',
      spanish: 'hola',
      english: 'hello',
      lastSeen: 4,
      correctCount: 1,
      incorrectCount: 0,
    },
  ],
  quizHistory: [{ id: 'q1', createdAt: 4, score: 1, total: 1, missedCardIds: [], region: 'all' }],
  lastSession: { deckId: 'd1', cardId: 'c1', updatedAt: 4 },
  notificationPrefs: {
    masterOn: false,
    morningOn: false,
    nightOn: false,
    streakOn: false,
    achieveOn: false,
  },
};
const envelope = {
  kind: 'colombian-spanish-backup',
  version: 3,
  exportedAt: '2026-10-15T00:00:00.000Z',
  decks: [],
  learningEvents: [],
  applicationState: state,
};
const write = AsyncStorage.setItem as jest.Mock;
const original = write.getMockImplementation()!;
beforeEach(async () => {
  write.mockImplementation(original);
  await AsyncStorage.clear();
});
afterEach(() => write.mockImplementation(original));
it('captures version 3 with exact portable state and canonical legacy streak', async () => {
  await AsyncStorage.setItem(key, JSON.stringify(state.prefs));
  await AsyncStorage.setItem('SRS_STREAK_V1', JSON.stringify(state.streak));
  const backup = await captureBackupSnapshot();
  expect(backup).toMatchObject({
    version: 3,
    applicationState: { prefs: state.prefs, streak: state.streak, seenWords: null },
  });
  expect(parseBackupText(JSON.stringify(backup))).toEqual(backup);
});
it('restores validated supplemental state only with explicit replace-state mode', async () => {
  const backup = parseBackupText(JSON.stringify(envelope));
  await AsyncStorage.setItem(key, JSON.stringify({ uiLanguage: 'es' }));
  await restoreBackup(backup.decks, backup.learningEvents, 'replace');
  expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual({ uiLanguage: 'es' });
  await (restoreBackup as any)(
    backup.decks,
    backup.learningEvents,
    'replace-state',
    (backup as any).applicationState,
  );
  expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual(state.prefs);
  expect(JSON.parse((await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1'))!)).toEqual(state.daily);
  expect(JSON.parse((await AsyncStorage.getItem('SRS_SEEN_WORDS_V1'))!)).toEqual(state.seenWords);
});
it.each([
  { ...state, prefs: { uiLanguage: 'xx' } },
  { ...state, daily: { ...state.daily, count: -1 } },
  { ...state, streak: { ...state.streak, freezes: 10 } },
  { ...state, seenWords: [{ ...state.seenWords[0], correctCount: '1' }] },
  { ...state, quizHistory: [{ ...state.quizHistory[0], score: 2 }] },
  { ...state, lastSession: { ...state.lastSession, updatedAt: -1 } },
  { ...state, notificationPrefs: { masterOn: 'true' } },
  { ...state, injectedStorageKey: {} },
])('rejects malformed portable state before writes', async (applicationState) => {
  expect(() => parseBackupText(JSON.stringify({ ...envelope, applicationState }))).toThrow();
  await expect((restoreBackup as any)([], [], 'replace-state', applicationState)).rejects.toThrow();
  expect(await AsyncStorage.getItem(key)).toBeNull();
});
it('resets absent source state to safe defaults and prevents legacy streak resurrection', async () => {
  const backup = await captureBackupSnapshot();
  await AsyncStorage.setItem(key, JSON.stringify(state.prefs));
  await AsyncStorage.setItem('SRS_STREAK_V1', JSON.stringify(state.streak));
  await (restoreBackup as any)(
    backup.decks,
    backup.learningEvents,
    'replace-state',
    (backup as any).applicationState,
  );
  expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual({});
  expect(JSON.parse((await AsyncStorage.getItem('SRS_STUDY_STREAK_V1'))!)).toEqual({
    streak: 0,
    freezes: 0,
  });
  expect(JSON.parse((await AsyncStorage.getItem('SRS_SEEN_WORDS_V1'))!)).toEqual([]);
});
it('recovers all state after a partial restore before the next application read', async () => {
  let fail = true;
  write.mockImplementation(async (k, value) => {
    if (k === key && fail) {
      fail = false;
      throw new Error('disk full');
    }
    return original(k, value);
  });
  await expect((restoreBackup as any)([], [], 'replace-state', state)).rejects.toThrow('disk full');
  const backup = await captureBackupSnapshot();
  expect((backup as any).applicationState).toEqual({
    ...state,
    dailyPlan: { schemaVersion: 1, current: null },
    missions: { schemaVersion: 1, runs: [] },
  });
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
});
it('refuses a snapshot when stored supplemental state is corrupt', async () => {
  await AsyncStorage.setItem(key, '{broken');
  await expect(captureBackupSnapshot()).rejects.toThrow();
  expect(await AsyncStorage.getItem(key)).toBe('{broken');
});

it.each(['classic', 'barrio'] as const)(
  'exports and restores a valid %s selection without losing remembered appearance',
  async (themeId) => {
    const prefs = { ...state.prefs, themeId, appearanceMode: 'light' };
    await AsyncStorage.setItem(key, JSON.stringify(prefs));
    const backup = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
    expect(backup.applicationState?.prefs).toEqual(prefs);
    await AsyncStorage.setItem(key, JSON.stringify({ themeId: 'classic', appearanceMode: 'dark' }));
    await restoreBackup(
      backup.decks,
      backup.learningEvents,
      'replace-state',
      backup.applicationState,
    );
    expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual(prefs);
  },
);
it.each([
  { themeId: 'future', appearanceMode: 'light' },
  { themeId: 'barrio', appearanceMode: 'future' },
  { themeId: null },
  { appearanceMode: false },
])('rejects an unsupported imported selection before any write: %p', async (selection) => {
  const raw = JSON.stringify(state.prefs);
  await AsyncStorage.setItem(key, raw);
  const applicationState = { ...state, prefs: { ...state.prefs, ...selection } };
  const before = write.mock.calls.length;
  expect(() => parseBackupText(JSON.stringify({ ...envelope, applicationState }))).toThrow();
  await expect(restoreBackup([], [], 'replace-state', applicationState)).rejects.toThrow();
  expect(write.mock.calls.slice(before)).toEqual([]);
  expect(await AsyncStorage.getItem(key)).toBe(raw);
});
it.each([1, 2] as const)(
  'legacy version %s deck restore leaves the local selection unchanged',
  async (version) => {
    const prefs = { ...state.prefs, themeId: 'barrio', appearanceMode: 'dark' };
    await AsyncStorage.setItem(key, JSON.stringify(prefs));
    const backup = parseBackupText(JSON.stringify({ ...envelope, version }));
    expect(backup.applicationState).toBeUndefined();
    await restoreBackup(backup.decks, backup.learningEvents);
    expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual(prefs);
  },
);
