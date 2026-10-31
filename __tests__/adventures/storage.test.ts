import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_DECKS } from '../../src/data/decks';
import { ADVENTURES } from '../../src/adventures/content';
import { createAdventureAdapter, readAdventures } from '../../src/storage/adventures';
import { validateAdventureState } from '../../src/adventures/state';
import { MissionCommand, MissionRun } from '../../src/missions/engine';
import { captureBackupSnapshot } from '../../src/storage/backupSnapshot';
import { writePortableState } from '../../src/storage/portableState';
import { withStorageTransaction } from '../../src/storage/durableStorage';
import { getLearningEvents } from '../../src/storage/learningEvents';
const id = ADVENTURES[0].pack.id;
const adapter = () => createAdventureAdapter(id, 'preview', () => ALL_DECKS);
let sequence = 0;
const command = (run: MissionRun, type: MissionCommand['type'], extra = {}): MissionCommand => ({
  id: `op-${++sequence}`,
  runId: run.id,
  nodeId: run.nodeId,
  expectedRevision: run.revision,
  type,
  at: 100 + sequence,
  ...extra,
});
async function finish(
  options: { warmup?: boolean; skip?: boolean; retry?: boolean; accent?: boolean } = {},
) {
  const a = adapter();
  const old = await a.load();
  let run = await a.start(`run-${++sequence}`, 100, old.run?.id);
  if (options.warmup) run = await a.warmup!(run.id);
  run = await a.apply(command(run, 'advance'));
  if (options.skip || options.retry || options.accent) {
    run = await a.apply(
      command(run, 'answer', { answer: options.accent ? 'Buenos dias' : 'wrong', durationMs: 5 }),
    );
    if (options.retry || options.accent) run = await a.apply(command(run, 'retry'));
    else run = await a.apply(command(run, 'advance'));
  }
  for (const node of ADVENTURES[0].pack.nodes.filter(
    (n) => n.kind === 'production' || n.kind === 'choice',
  )) {
    if (run.nodeId !== node.id) continue;
    run = await a.apply(
      command(
        run,
        'answer',
        node.kind === 'production'
          ? { answer: node.exercise.acceptedAnswers[0], durationMs: 5 }
          : { choiceId: node.options.find((o) => o.correct)!.id, durationMs: 5 },
      ),
    );
    run = await a.apply(command(run, 'advance'));
  }
  return run;
}
beforeEach(async () => {
  await AsyncStorage.clear();
});
test('qualifying completion atomically earns one stamp and unlocks visit two without daily/SRS credit', async () => {
  const run = await finish();
  expect(run.completed).toBe(true);
  const state = await readAdventures();
  expect(state.outcomes).toHaveLength(1);
  expect(state.outcomes[0].supported).toBe(false);
  expect(state.milestones).toHaveLength(1);
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
  expect(await getLearningEvents()).toHaveLength(4);
  await expect(
    createAdventureAdapter(ADVENTURES[1].pack.id, 'preview', () => ALL_DECKS).start('second', 200),
  ).resolves.toMatchObject({ nodeId: 'return' });
});
test.each([{ warmup: true }, { retry: true }, { accent: true }])(
  'support remains sticky across advancement and cold reads: %p',
  async (options) => {
    await finish(options);
    expect((await readAdventures()).outcomes[0].supported).toBe(true);
  },
);
test('skipped incorrect node completes story but cannot earn a stamp', async () => {
  await finish({ skip: true });
  const state = await readAdventures();
  expect(state.milestones).toHaveLength(1);
  expect(state.outcomes).toHaveLength(0);
});
test('replay preserves earned stamp and story unlock and cannot downgrade help status', async () => {
  await finish();
  const earned = (await readAdventures()).outcomes[0];
  await finish({ warmup: true });
  const state = await readAdventures();
  expect(state.outcomes).toEqual([earned]);
  expect(state.milestones).toHaveLength(1);
});
test('second visit is locked before a same-mode milestone and accepted mode denies drafts', async () => {
  await expect(
    createAdventureAdapter(ADVENTURES[1].pack.id, 'preview', () => ALL_DECKS).start('second', 200),
  ).rejects.toThrow();
  await expect(
    createAdventureAdapter(id, 'accepted', () => ALL_DECKS).start('real', 200),
  ).rejects.toThrow();
});
test('changed teaching text between render and command rejects before writes', async () => {
  const decks = JSON.parse(JSON.stringify(ALL_DECKS));
  const a = createAdventureAdapter(id, 'preview', () => decks);
  const run = await a.start('changing', 200);
  const saved = await AsyncStorage.getItem('SRS_ADVENTURES_V1');
  decks.flatMap((d: any) => d.cards).find((c: any) => c.id === '0010').front = 'Changed';
  await expect(a.apply(command(run, 'advance'))).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_ADVENTURES_V1')).toBe(saved);
  expect((await a.load()).contentChanged).toBe(true);
});
test('uncertain committed answer retry recovers once without a duplicated event', async () => {
  const a = adapter();
  let run = await a.start('fault', 200);
  run = await a.apply(command(run, 'advance'));
  const intent = command(run, 'answer', { answer: 'Buenos días', durationMs: 5 });
  const original = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
  let failed = false;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
    if (key === 'SRS_ADVENTURES_V1' && !failed) {
      failed = true;
      throw new Error('injected failure');
    }
    return original(key, value);
  });
  await expect(a.apply(intent)).rejects.toThrow('injected failure');
  (AsyncStorage.setItem as jest.Mock).mockImplementation(original);
  const recovered = await a.apply(intent);
  expect(recovered.feedback?.status).toBe('correct');
  expect(await getLearningEvents()).toHaveLength(1);
});
test('strict state rejects duplicate identities, excessive rows and wrong modes', async () => {
  await finish();
  const state = await readAdventures();
  expect(() =>
    validateAdventureState({ ...state, outcomes: [...state.outcomes, ...state.outcomes] }),
  ).toThrow();
  expect(() =>
    validateAdventureState({ ...state, outcomes: [{ ...state.outcomes[0], mode: 'invalid' }] }),
  ).toThrow();
  expect(() => validateAdventureState({ ...state, runs: Array(51).fill(state.runs[0]) })).toThrow();
});
test('backup round trip includes adventures; old replacement backup clears them', async () => {
  await finish();
  const backup = await captureBackupSnapshot();
  expect((backup as any).applicationState.adventures.outcomes).toHaveLength(1);
  const old = { ...(backup as any).applicationState };
  delete old.adventures;
  await withStorageTransaction((tx) => writePortableState(tx, old));
  expect((await readAdventures()).outcomes).toHaveLength(0);
});
