import AsyncStorage from '@react-native-async-storage/async-storage';
import { startDailyPlan, readDailyPlan } from '../../src/storage/dailyPlans';
import { startMissionRun, applyMissionCommand, loadMissionRun } from '../../src/storage/missions';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
import { getLearningEvents } from '../../src/storage/learningEvents';
const applied = {
  missionId: DAILY_RESPONSE.id,
  contentVersion: DAILY_RESPONSE.contentVersion,
  runId: 'planned-run',
};
beforeEach(async () => {
  await AsyncStorage.clear();
  await startDailyPlan({
    id: 'plan',
    day: '2026-10-17',
    minutes: 3,
    createdAt: 1000,
    phase: 'applied',
    applied,
  });
});
test('only the linked actual applied run completes the plan atomically, without SRS/daily inflation', async () => {
  const run = await startMissionRun(DAILY_RESPONSE, applied.runId, 1000, undefined, 'plan');
  const answer = {
    id: 'answer',
    runId: run.id,
    nodeId: run.nodeId,
    expectedRevision: 0,
    type: 'answer' as const,
    at: 2000,
    durationMs: 1000,
    answer: 'Buenos días',
  };
  const checked = await applyMissionCommand(DAILY_RESPONSE, answer, 'plan');
  expect((await readDailyPlan())?.phase).toBe('applied');
  const finish = {
    id: 'finish',
    runId: run.id,
    nodeId: checked.nodeId,
    expectedRevision: checked.revision,
    type: 'advance' as const,
    at: 3000,
  };
  await applyMissionCommand(DAILY_RESPONSE, finish, 'plan');
  await applyMissionCommand(DAILY_RESPONSE, finish, 'plan');
  expect((await readDailyPlan())?.phase).toBe('complete');
  expect(await getLearningEvents()).toHaveLength(1);
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBeNull();
});
test('rejects another run or stale plan identity before mission writes', async () => {
  await expect(
    startMissionRun(DAILY_RESPONSE, 'wrong-run', 1000, undefined, 'plan'),
  ).rejects.toThrow();
  await expect(
    startMissionRun(DAILY_RESPONSE, applied.runId, 1000, undefined, 'other'),
  ).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
});
test('recovers an interrupted final plan write and replays completion without duplicate evidence', async () => {
  const run = await startMissionRun(DAILY_RESPONSE, applied.runId, 1000, undefined, 'plan');
  const checked = await applyMissionCommand(
    DAILY_RESPONSE,
    {
      id: 'answer',
      runId: run.id,
      nodeId: run.nodeId,
      expectedRevision: 0,
      type: 'answer',
      at: 2000,
      durationMs: 1000,
      answer: 'Buenos días',
    },
    'plan',
  );
  const finish = {
    id: 'finish',
    runId: run.id,
    nodeId: checked.nodeId,
    expectedRevision: checked.revision,
    type: 'advance' as const,
    at: 3000,
  };
  const write = AsyncStorage.setItem as jest.Mock;
  const original = write.getMockImplementation()!;
  let interrupted = false;
  write.mockImplementation(async (key, value) => {
    if (key === 'SRS_DAILY_PLAN_V1' && !interrupted) {
      interrupted = true;
      throw new Error('interrupted final plan write');
    }
    return original(key, value);
  });
  try {
    await expect(applyMissionCommand(DAILY_RESPONSE, finish, 'plan')).rejects.toThrow(
      'interrupted',
    );
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
    await applyMissionCommand(DAILY_RESPONSE, finish, 'plan');
    expect((await readDailyPlan())?.phase).toBe('complete');
    expect((await loadMissionRun(DAILY_RESPONSE, 'plan')).run?.completed).toBe(true);
    expect(await getLearningEvents()).toHaveLength(1);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
    expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBeNull();
  } finally {
    write.mockImplementation(original);
  }
});
test('a new plan does not display a previous daily response run as its own', async () => {
  await startMissionRun(DAILY_RESPONSE, 'old-independent', 1000);
  const loaded = await loadMissionRun(DAILY_RESPONSE, 'plan');
  expect(loaded.run).toBeUndefined();
  expect(loaded.expectedRunId).toBe('old-independent');
  const started = await startMissionRun(
    DAILY_RESPONSE,
    applied.runId,
    2000,
    loaded.expectedRunId,
    'plan',
  );
  expect(started.id).toBe(applied.runId);
});
