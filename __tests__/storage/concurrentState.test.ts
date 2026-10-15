import { withStorageTransaction } from '../../src/storage/durableStorage';
import { recordStudySession, getStreakState } from '../../src/storage/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrefs, setPrefs } from '../../src/storage/prefs';
import {
  getDailyProgress,
  incrementDailyProgress,
  incrementDailyNewCount,
  setDailyTarget,
  recordSeenWord,
  getSeenWords,
  recordQuizResult,
  getQuizHistory,
} from '../../src/storage/storage';
beforeEach(async () => {
  await AsyncStorage.clear();
});
it('preserves independent simultaneous preference changes', async () => {
  await Promise.all([setPrefs({ uiLanguage: 'en' }), setPrefs({ autoSpeak: true })]);
  expect(await getPrefs()).toMatchObject({ uiLanguage: 'en', autoSpeak: true });
});
it('preserves parallel daily totals, fresh counts and target changes', async () => {
  await Promise.all([incrementDailyProgress(), incrementDailyNewCount(), setDailyTarget(5)]);
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1, target: 5 });
});
it('retains seen words from parallel learning actions', async () => {
  await Promise.all(
    ['c1', 'c2'].map((cardId) =>
      recordSeenWord({ cardId, deckId: 'd1', front: 'hola', back: 'hello', correct: true }),
    ),
  );
  expect((await getSeenWords()).map((word) => word.cardId).sort()).toEqual(['c1', 'c2']);
});
it('retains parallel quiz rounds and deduplicates a shared round ID', async () => {
  const round = { score: 1, total: 1, missedCardIds: [], region: 'all' };
  await Promise.all([
    recordQuizResult({ ...round, id: 'q1' }),
    recordQuizResult({ ...round, id: 'q2' }),
  ]);
  expect((await getQuizHistory()).map((r) => r.id).sort()).toEqual(['q1', 'q2']);
  await Promise.all([
    recordQuizResult({ ...round, id: 'q3' }),
    recordQuizResult({ ...round, id: 'q3' }),
  ]);
  expect((await getQuizHistory()).filter((r) => r.id === 'q3')).toHaveLength(1);
});
it('migrates legacy midnight progress without losing same-day count, target or new allowance', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  try {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    await AsyncStorage.setItem(
      'SRS_DAILY_PROGRESS_V1',
      JSON.stringify({ date: midnight.toISOString(), count: 7, newCount: 3, target: 20 }),
    );
    expect(await getDailyProgress()).toEqual({
      date: '2026-10-15',
      count: 7,
      newCount: 3,
      target: 20,
    });
    expect(JSON.parse((await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1'))!).date).toBe(
      '2026-10-15',
    );
  } finally {
    jest.useRealTimers();
  }
});
it('keeps local day counts across the same calendar date rather than midnight offset identity', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 2, 29, 12));
  try {
    await AsyncStorage.setItem(
      'SRS_DAILY_PROGRESS_V1',
      JSON.stringify({ date: '2026-03-29', count: 4, newCount: 2, target: 5 }),
    );
    expect(await getDailyProgress()).toMatchObject({ count: 4, newCount: 2 });
    jest.setSystemTime(new Date(2026, 2, 30, 0, 1));
    expect(await getDailyProgress()).toEqual({
      date: '2026-03-30',
      count: 0,
      newCount: 0,
      target: 5,
    });
  } finally {
    jest.useRealTimers();
  }
});
it('does not advance preferences when the initial journal write fails', async () => {
  await setPrefs({ uiLanguage: 'en' });
  const write = AsyncStorage.setItem as jest.Mock;
  write.mockRejectedValueOnce(new Error('disk full'));
  await expect(setPrefs({ autoSpeak: true })).rejects.toThrow('disk full');
  expect(await getPrefs()).toMatchObject({ uiLanguage: 'en', autoSpeak: false });
});
it('generates distinct quiz IDs even when two rounds finish at the same clock time', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  try {
    const round = { score: 1, total: 1, missedCardIds: [], region: 'all' };
    await Promise.all([recordQuizResult(round), recordQuizResult(round)]);
    const history = await getQuizHistory();
    expect(history).toHaveLength(2);
    expect(new Set(history.map((item) => item.id)).size).toBe(2);
  } finally {
    jest.useRealTimers();
  }
});
it('snapshots mutable caller patches and quiz arrays before waiting for storage', async () => {
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const hold = withStorageTransaction(async () => {
    entered();
    await blocked;
  });
  await started;
  const patch = { uiLanguage: 'en' as 'en' | 'es' };
  const round = { id: 'snapshot-round', score: 0, total: 1, missedCardIds: ['c1'], region: 'all' };
  const saving = Promise.all([setPrefs(patch), recordQuizResult(round)]);
  patch.uiLanguage = 'es';
  round.missedCardIds.push('c2');
  release();
  await Promise.all([hold, saving]);
  expect((await getPrefs()).uiLanguage).toBe('en');
  expect((await getQuizHistory())[0].missedCardIds).toEqual(['c1']);
});
it('earns a streak freeze only once across concurrent sessions on the same local day', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  try {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 6, freezes: 0, lastStudyDate: '2026-10-14' }),
    );
    await Promise.all([recordStudySession(), recordStudySession()]);
    expect(await getStreakState()).toEqual({ streak: 7, freezes: 1 });
  } finally {
    jest.useRealTimers();
  }
});
