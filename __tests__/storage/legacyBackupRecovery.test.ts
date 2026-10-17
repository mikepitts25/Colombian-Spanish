import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
import { loadDecks } from '../../src/storage/storage';
import { LearningEvent } from '../../src/storage/learningEvents';

const DECKS = 'SRS_DECKS_V3';
const EVENTS = 'SRS_LEARNING_EVENTS_V1';
const JOURNAL = 'SRS_WRITE_JOURNAL_V1';
const STREAK = 'SRS_STUDY_STREAK_V1';
const card = {
  id: 'custom-card',
  front: 'mi frase',
  back: 'my phrase',
  createdAt: 1,
  due: 9000,
  reps: 3,
  interval: 4,
  ease: 2.5,
  favorite: true,
};
const source = {
  kind: 'colombian-spanish-backup',
  version: 3,
  exportedAt: '2026-10-18T00:00:00.000Z',
  decks: [{ id: 'custom-deck', name: 'My phrases', cards: [card] }],
  learningEvents: [] as LearningEvent[],
  // Legacy version-3 files predate optional mission and daily-plan fields.
  applicationState: {
    prefs: { uiLanguage: 'es', newCardsPerDay: 4 },
    daily: { date: '2026-10-18', count: 3, target: 5, newCount: 2 },
    streak: { streak: 8, freezes: 1, lastStudyDate: '2026-10-18' },
    seenWords: [],
    quizHistory: [],
    lastSession: {},
    notificationPrefs: {},
  },
};
const localEvent: LearningEvent = {
  schemaVersion: 1,
  id: 'newer-local-event',
  cardId: card.id,
  deckId: 'custom-deck',
  sessionId: 'local-session',
  modality: 'recall',
  outcome: 'correct',
  evidence: 'self-rated',
  occurredAt: 1792275000000,
  quality: 4,
  hintsUsed: null,
  durationMs: 4000,
};
const write = AsyncStorage.setItem as jest.Mock;
const originalWrite = write.getMockImplementation()!;
beforeEach(async () => {
  write.mockImplementation(originalWrite);
  await AsyncStorage.clear();
});
afterEach(() => write.mockImplementation(originalWrite));
async function rawState() {
  const keys = [...(await AsyncStorage.getAllKeys())].sort();
  return Object.fromEntries(await AsyncStorage.multiGet(keys));
}
async function seedLocal() {
  await restoreBackup(source.decks, [localEvent], 'replace-state', source.applicationState);
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ uiLanguage: 'en', newCardsPerDay: 9 }),
  );
  await AsyncStorage.setItem(STREAK, JSON.stringify({ streak: 42, freezes: 0 }));
  await AsyncStorage.setItem('SRS_STREAK_V1', JSON.stringify({ streak: 99, freezes: 2 }));
}

it('replays a failed legacy full-state migration before reads without duplicate history or legacy streak resurrection', async () => {
  await seedLocal();
  const sourceText = JSON.stringify(source);
  const backup = parseBackupText(sourceText);
  const previousStreak = await AsyncStorage.getItem(STREAK);
  let blocked = true;
  write.mockImplementation(async (key, value) => {
    if (key === STREAK && blocked) throw new Error('migration write unavailable');
    return originalWrite(key, value);
  });
  await expect(
    restoreBackup(backup.decks, backup.learningEvents, 'replace-state', backup.applicationState),
  ).rejects.toThrow('migration write unavailable');
  const journal = await AsyncStorage.getItem(JOURNAL);
  expect(journal).not.toBeNull();
  expect(JSON.parse(journal!).entries).toHaveLength(11);
  // Preferences were written before the failure, but the remaining after-images must still replay.
  expect(JSON.parse((await AsyncStorage.getItem('SRS_PREFS_V1'))!)).toEqual(
    source.applicationState.prefs,
  );
  expect(await AsyncStorage.getItem(STREAK)).toBe(previousStreak);
  const partial = await rawState();
  await expect(loadDecks()).rejects.toThrow('migration write unavailable');
  expect(await rawState()).toEqual(partial);
  blocked = false;
  const recovered = await captureBackupSnapshot();
  expect(recovered.decks).toEqual(source.decks);
  expect(recovered.learningEvents).toEqual([localEvent]);
  expect(recovered.applicationState).toEqual({
    ...source.applicationState,
    dailyPlan: { schemaVersion: 1, current: null },
    missions: { schemaVersion: 1, runs: [] },
  });
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
  // Stale legacy streak remains present but cannot override the restored canonical value.
  expect(JSON.parse((await AsyncStorage.getItem('SRS_STREAK_V1'))!).streak).toBe(99);
  await restoreBackup(
    backup.decks,
    backup.learningEvents,
    'replace-state',
    backup.applicationState,
  );
  expect((await captureBackupSnapshot()).applicationState).toEqual(recovered.applicationState);
  expect((await captureBackupSnapshot()).learningEvents).toEqual([localEvent]);
  expect(JSON.stringify(source)).toBe(sourceText);
});

it.each(['{broken', JSON.stringify({ schemaVersion: 99, events: [] })])(
  'refuses replacement against corrupt local history without changing any stored key: %s',
  async (corruptHistory) => {
    await seedLocal();
    await AsyncStorage.setItem(EVENTS, corruptHistory);
    const before = await rawState();
    const replacement = [{ ...source.decks[0], name: 'Incoming', cards: [{ ...card, reps: 0 }] }];
    await expect(
      restoreBackup(replacement, [], 'replace-state', source.applicationState),
    ).rejects.toThrow();
    expect(await rawState()).toEqual(before);
    expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem(DECKS))!)[0].cards[0]).toEqual(card);
  },
);
