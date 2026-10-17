import AsyncStorage from '@react-native-async-storage/async-storage';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
import {
  startMissionRun,
  applyMissionCommand,
  readActivityTimings,
} from '../../src/storage/missions';
import { openRecommendedPlan } from '../../src/storage/recommendedPlan';
import { abandonDailyPlan } from '../../src/storage/dailyPlans';
import { ALL_DECKS } from '../../src/data/decks';
import {
  readPortableState,
  writePortableState,
  validatePortableState,
} from '../../src/storage/portableState';
import { setPrefs } from '../../src/storage/prefs';
const pack = DAILY_RESPONSE;
beforeEach(async () => {
  await AsyncStorage.clear();
});
async function answer(id: string, prior?: string) {
  const run = await startMissionRun(pack, id, 1000, prior);
  return applyMissionCommand(pack, {
    id: `a${id}`,
    runId: id,
    nodeId: run.nodeId,
    expectedRevision: 0,
    at: 2000,
    type: 'answer',
    answer: 'Buenos días',
    durationMs: 999999,
    activeDurationMs: 20000,
  });
}
test('records once on actual completion, atomically recovers sample/mission, retains across replacement and roundtrips backup', async () => {
  const checked = await answer('run');
  expect(await readActivityTimings()).toEqual([]);
  const command = {
    id: 'complete',
    runId: 'run',
    nodeId: checked.nodeId,
    expectedRevision: 1,
    at: 3000,
    type: 'advance' as const,
  };
  const write = AsyncStorage.setItem as jest.Mock;
  const original = write.getMockImplementation()!;
  let failed = false;
  write.mockImplementation(async (key, value) => {
    if (key === 'SRS_MISSIONS_V1' && !failed) {
      failed = true;
      throw new Error('interrupted');
    }
    return original(key, value);
  });
  try {
    await expect(applyMissionCommand(pack, command)).rejects.toThrow('interrupted');
    await applyMissionCommand(pack, command);
    await applyMissionCommand(pack, command);
    expect(await readActivityTimings()).toEqual([
      { runId: 'run', missionId: pack.id, contentVersion: 1, occurredAt: 3000, durationMs: 20000 },
    ]);
    await answer('new', 'run');
    expect(await readActivityTimings()).toHaveLength(1);
    const state = await readPortableState(AsyncStorage);
    await AsyncStorage.clear();
    await writePortableState(AsyncStorage, state);
    expect(await readActivityTimings()).toHaveLength(1);
    expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).not.toContain('"count":1');
    expect(() =>
      validatePortableState({
        ...state,
        missions: { schemaVersion: 1, runs: [], timings: [{ runId: 'bad' }] },
      }),
    ).toThrow();
  } finally {
    write.mockImplementation(original);
  }
});
test('only fresh plans use matching completed samples; saved plans stay frozen and production reserves no reply', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(ALL_DECKS));
  await setPrefs({ studyMinutes: 3, learningLevel: 'beginner' });
  const initial = await openRecommendedPlan(true);
  expect(initial?.review?.session.queue?.limits?.cardLimit).toBe(2);
  const now = Date.now();
  await AsyncStorage.setItem(
    'SRS_MISSIONS_V1',
    JSON.stringify({
      schemaVersion: 1,
      runs: [],
      timings: Array.from({ length: 5 }, (_, i) => ({
        runId: `r${i}`,
        missionId: pack.id,
        contentVersion: 1,
        occurredAt: now - i,
        durationMs: 20000,
      })),
    }),
  );
  expect(await openRecommendedPlan(true)).toEqual(initial);
  await abandonDailyPlan(initial!.id);
  expect((await openRecommendedPlan(true))?.review?.session.queue?.limits?.cardLimit).toBe(3);
  await abandonDailyPlan((await openRecommendedPlan(true))!.id);
  expect((await openRecommendedPlan(false))?.review?.session.queue?.limits?.cardLimit).toBe(4);
});

test('rejects nonfinite active input before JSON snapshot can disguise it as unknown', async () => {
  const run = await startMissionRun(pack, 'bad-input', 1000);
  const before = await AsyncStorage.getItem('SRS_MISSIONS_V1');
  await expect(
    applyMissionCommand(pack, {
      id: 'a',
      runId: run.id,
      nodeId: run.nodeId,
      expectedRevision: 0,
      at: 2000,
      type: 'answer',
      answer: 'Buenos días',
      durationMs: 2000,
      activeDurationMs: NaN,
    }),
  ).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBe(before);
});
