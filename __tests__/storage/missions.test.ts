import AsyncStorage from '@react-native-async-storage/async-storage';
import { pack } from '../../testFixtures/mission';
import { startMissionRun, loadMissionRun, applyMissionCommand } from '../../src/storage/missions';
import { getLearningEvents, appendLearningEvent } from '../../src/storage/learningEvents';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
const advance = {
  id: 'advance',
  runId: 'run',
  nodeId: 'intro',
  expectedRevision: 0,
  at: 1000,
  type: 'advance' as const,
};
const answer = {
  id: 'answer',
  runId: 'run',
  nodeId: 'greet',
  expectedRevision: 1,
  at: 1001,
  type: 'answer' as const,
  answer: 'hola',
  durationMs: 100,
};
beforeEach(async () => {
  await AsyncStorage.clear();
});
test('persists exact feedback with one assessed event and unchanged SRS/daily state', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', '[]');
  await startMissionRun(pack, 'run', 1000);
  await applyMissionCommand(pack, advance);
  const current = await applyMissionCommand(pack, answer);
  expect((await loadMissionRun(pack)).run).toEqual(current);
  expect(await applyMissionCommand(pack, answer)).toEqual(current);
  expect(await getLearningEvents()).toHaveLength(1);
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe('[]');
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).not.toContain('hola');
});
test('recovers event and state together after an interrupted commit and retries once', async () => {
  await startMissionRun(pack, 'run', 1000);
  await applyMissionCommand(pack, advance);
  const write = AsyncStorage.setItem as jest.Mock,
    original = write.getMockImplementation()!;
  let fail = true;
  write.mockImplementation(async (key, value) => {
    if (key === 'SRS_MISSIONS_V1' && fail) {
      fail = false;
      throw new Error('interrupted');
    }
    return original(key, value);
  });
  try {
    await expect(applyMissionCommand(pack, answer)).rejects.toThrow('interrupted');
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
    const result = await applyMissionCommand(pack, answer);
    expect(result.feedback?.status).toBe('correct');
    expect(await getLearningEvents()).toHaveLength(1);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  } finally {
    write.mockImplementation(original);
  }
});
test('guards overlapping starts and stale revisions; snapshots queued input', async () => {
  const starts = await Promise.allSettled([
    startMissionRun(pack, 'run', 1000),
    startMissionRun(pack, 'other', 1000),
  ]);
  expect(starts.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  await applyMissionCommand(pack, advance);
  const snapshot = { ...answer };
  const pending = applyMissionCommand(pack, snapshot);
  snapshot.answer = 'wrong';
  expect((await pending).feedback?.status).toBe('correct');
  await expect(applyMissionCommand(pack, { ...answer, id: 'stale' })).rejects.toThrow('Stale');
});
test('serializes ordinary appends with mission observations without lost events', async () => {
  await startMissionRun(pack, 'run', 1000);
  await applyMissionCommand(pack, advance);
  const ordinary = {
    schemaVersion: 1 as const,
    id: 'ordinary',
    sessionId: 'quiz',
    cardId: 'c2',
    deckId: 'd1',
    modality: 'recognition' as const,
    evidence: 'answer-checked' as const,
    outcome: 'correct' as const,
    occurredAt: 999,
    hintsUsed: 0,
    durationMs: 1,
  };
  await Promise.all([applyMissionCommand(pack, answer), appendLearningEvent(ordinary)]);
  expect(await getLearningEvents()).toHaveLength(2);
});
test('reports content-version changes and preserves corrupt state rather than overwriting', async () => {
  await startMissionRun(pack, 'run', 1000);
  expect((await loadMissionRun({ ...pack, contentVersion: 2 })).contentChanged).toBe(true);
  await expect(startMissionRun(pack, 'new', 1000, 'wrong-old-id')).rejects.toThrow();
  await AsyncStorage.setItem('SRS_MISSIONS_V1', 'broken');
  await expect(loadMissionRun(pack)).rejects.toThrow();
  await expect(startMissionRun(pack, 'new', 1000)).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBe('broken');
});
test('backup preserves mission progress and legacy full-state restore clears absent missions', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', '[]');
  await startMissionRun(pack, 'run', 1000);
  await applyMissionCommand(pack, advance);
  const snapshot = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
  expect(snapshot.applicationState?.missions).toBeDefined();
  await AsyncStorage.clear();
  await restoreBackup(
    snapshot.decks,
    snapshot.learningEvents,
    'replace-state',
    snapshot.applicationState,
  );
  expect((await loadMissionRun(pack)).run?.nodeId).toBe('greet');
  const legacy = JSON.parse(JSON.stringify(snapshot));
  delete legacy.applicationState.missions;
  expect(() => parseBackupText(JSON.stringify(legacy))).not.toThrow();
  await restoreBackup(
    legacy.decks,
    legacy.learningEvents,
    'replace-state',
    legacy.applicationState,
  );
  expect((await loadMissionRun(pack)).run).toBeUndefined();
});

test('enforces declared completion prerequisites before starting another mission', async () => {
  await expect(startMissionRun({ ...pack, prerequisites: ['other'] }, 'run', 1000)).rejects.toThrow(
    'prerequisite',
  );
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
});

test('listening transcript and playback evidence survive atomic state/event backup round trip', async () => {
  const { listeningPack } = require('../../testFixtures/listening');
  await AsyncStorage.setItem('SRS_DECKS_V3', '[]');
  await startMissionRun(listeningPack, 'listen', 1000);
  const command = { runId: 'listen', nodeId: 'listen', at: 1000 };
  await applyMissionCommand(listeningPack, {
    ...command,
    id: 'transcript',
    type: 'transcript',
    expectedRevision: 0,
  });
  await applyMissionCommand(listeningPack, {
    ...command,
    id: 'play',
    type: 'playback',
    expectedRevision: 1,
  });
  await applyMissionCommand(listeningPack, {
    ...command,
    id: 'answer',
    type: 'answer',
    expectedRevision: 2,
    choiceId: 'hello',
    durationMs: 5,
  });
  const backup = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
  await AsyncStorage.clear();
  await restoreBackup(
    backup.decks,
    backup.learningEvents,
    'replace-state',
    backup.applicationState,
  );
  expect((await loadMissionRun(listeningPack)).run).toMatchObject({
    transcriptRevealed: true,
    audioPlayed: true,
    feedback: { status: 'correct' },
  });
  expect((await getLearningEvents())[0]).toMatchObject({
    modality: 'listening',
    transcriptAssisted: true,
    audio: { mediaId: 'audio-c1' },
  });
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).not.toContain('hola');
});
