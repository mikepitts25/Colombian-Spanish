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
import { summarizePracticeEvidence } from '../../src/utils/practiceEvidence';
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
  expect((await createAdventureAdapter(id, 'preview', () => decks).load()).contentChanged).toBe(
    true,
  );
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
test('a first start cannot silently bind to teaching content changed after display', async () => {
  const decks = JSON.parse(JSON.stringify(ALL_DECKS));
  const a = createAdventureAdapter(id, 'preview', () => decks);
  decks.flatMap((d: any) => d.cards).find((c: any) => c.id === '0010').front =
    'Changed before start';
  await expect(a.start('stale-first-start', 200)).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_ADVENTURES_V1')).toBeNull();
});
test.each(['active-node', 'outcome-node'])(
  'malformed known-episode evidence is rejected before backup writes: %s',
  async (kind) => {
    await finish();
    const backup = await captureBackupSnapshot();
    const portable = JSON.parse(JSON.stringify((backup as any).applicationState));
    if (kind === 'active-node') portable.adventures.runs[0].mission.nodeId = 'invented';
    else portable.adventures.runs[0].correctNodeIds.push('invented');
    const saved = await AsyncStorage.getItem('SRS_ADVENTURES_V1');
    await expect(
      withStorageTransaction((tx) => writePortableState(tx, portable)),
    ).rejects.toThrow();
    expect(await AsyncStorage.getItem('SRS_ADVENTURES_V1')).toBe(saved);
  },
);
test('warm-up models remain supported evidence in learning history, while direct recall stays unassisted', async () => {
  await finish({ warmup: true });
  const supported = await getLearningEvents();
  expect(supported.every((event) => event.assistance === 'model-answer')).toBe(true);
  expect(
    summarizePracticeEvidence(supported).find((row) => row.modality === 'recall')?.assisted,
  ).toBe(3);
  await AsyncStorage.clear();
  await finish();
  expect((await getLearningEvents()).every((event) => !event.assistance)).toBe(true);
});
test('preview and accepted slots coexist without changing each other or the legacy mission store', async () => {
  const content = require('../../src/adventures/content');
  const realResolve = content.resolveAdventure;
  // Synthetic eligibility only for this test; no checked-in human acceptance record.
  const resolver = jest
    .spyOn(content, 'resolveAdventure')
    .mockImplementation((missionId: any, decks: any, mode: any) => {
      const def = realResolve(missionId, decks, 'preview');
      return def && { ...def, mode };
    });
  try {
    await AsyncStorage.setItem('SRS_MISSIONS_V1', JSON.stringify({ schemaVersion: 1, runs: [] }));
    const preview = createAdventureAdapter(id, 'preview', () => ALL_DECKS);
    const accepted = createAdventureAdapter(id, 'accepted', () => ALL_DECKS);
    const p = await preview.start('preview-slot', 100);
    const a = await accepted.start('accepted-slot', 100);
    await preview.warmup!(p.id);
    expect((await accepted.load()).run).toEqual(a);
    expect((await readAdventures()).runs).toHaveLength(2);
    expect(JSON.parse((await AsyncStorage.getItem('SRS_MISSIONS_V1'))!).runs).toEqual([]);
  } finally {
    resolver.mockRestore();
  }
});
test('uncertain final completion commits exactly one outcome and milestone', async () => {
  const a = adapter();
  let run = await a.start('completion-fault', 100);
  run = await a.apply(command(run, 'advance'));
  for (const node of ADVENTURES[0].pack.nodes.filter(
    (n) => n.kind === 'production' || n.kind === 'choice',
  )) {
    run = await a.apply(
      command(
        run,
        'answer',
        node.kind === 'production'
          ? { answer: node.exercise.acceptedAnswers[0], durationMs: 5 }
          : { choiceId: node.options.find((o) => o.correct)!.id, durationMs: 5 },
      ),
    );
    const next = command(run, 'advance');
    if (node.id !== 'thanks') {
      run = await a.apply(next);
      continue;
    }
    const original = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
    let failed = false;
    (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
      if (key === 'SRS_ADVENTURES_V1' && !failed) {
        failed = true;
        throw new Error('final write interrupted');
      }
      return original(key, value);
    });
    try {
      await expect(a.apply(next)).rejects.toThrow('final write interrupted');
    } finally {
      (AsyncStorage.setItem as jest.Mock).mockImplementation(original);
    }
    run = await a.apply(next);
  }
  expect(run.completed).toBe(true);
  const state = await readAdventures();
  expect(state.outcomes).toHaveLength(1);
  expect(state.milestones).toHaveLength(1);
  expect(await getLearningEvents()).toHaveLength(4);
});
test('a legitimate historical structure remains readable after a same-version node rename', async () => {
  await finish();
  const before = await readAdventures();
  const def = ADVENTURES[0];
  const original = def.pack.nodes[def.pack.nodes.length - 1].id;
  try {
    def.pack.nodes[def.pack.nodes.length - 1].id = 'renamed-completion';
    expect(await readAdventures()).toEqual(before);
  } finally {
    def.pack.nodes[def.pack.nodes.length - 1].id = original;
  }
});

test('all eight visits earn persistent stamps, survive backup and do not duplicate on replay', async () => {
  expect(ADVENTURES).toHaveLength(8);
  async function completeVisit(index: number, supported = false) {
    const def = ADVENTURES[index];
    const a = createAdventureAdapter(def.pack.id, 'preview', () => ALL_DECKS);
    const old = await a.load();
    let run = await a.start(`tour-${++sequence}`, 100, old.run?.id);
    if (supported) run = await a.warmup!(run.id);
    while (!run.completed) {
      const node = def.pack.nodes.find((n) => n.id === run.nodeId)!;
      if (node.kind === 'production' || node.kind === 'choice') {
        run = await a.apply(
          command(
            run,
            'answer',
            node.kind === 'production'
              ? { answer: node.exercise.acceptedAnswers[0], durationMs: 5 }
              : { choiceId: node.options.find((o) => o.correct)!.id, durationMs: 5 },
          ),
        );
      }
      run = await a.apply(command(run, 'advance'));
    }
  }
  for (let index = 0; index < ADVENTURES.length; index++) {
    if (index) {
      await expect(
        createAdventureAdapter(ADVENTURES[index].pack.id, 'accepted', () => ALL_DECKS).start(
          `accepted-${index}`,
          100,
        ),
      ).rejects.toThrow();
    }
    if (index + 1 < ADVENTURES.length) {
      await expect(
        createAdventureAdapter(ADVENTURES[index + 1].pack.id, 'preview', () => ALL_DECKS).start(
          `locked-${index}`,
          100,
        ),
      ).rejects.toThrow();
    }
    await completeVisit(index, index % 2 === 1);
    expect((await readAdventures()).outcomes).toHaveLength(index + 1);
  }
  const state = await readAdventures();
  for (let index = 0; index < ADVENTURES.length; index++) {
    expect(state.outcomes.find((o) => o.missionId === ADVENTURES[index].pack.id)?.supported).toBe(
      index % 2 === 1,
    );
    await completeVisit(index, true);
  }
  expect(await readAdventures()).toMatchObject({
    outcomes: state.outcomes,
    milestones: state.milestones,
  });
  const snapshot = await captureBackupSnapshot();
  await AsyncStorage.clear();
  await withStorageTransaction((tx) => writePortableState(tx, snapshot.applicationState!));
  expect((await readAdventures()).outcomes).toEqual(state.outcomes);
});
