import { validateMission } from '../../src/missions/schema';
import {
  startMission,
  transitionMission,
  validateMissionEnvelope,
} from '../../src/missions/engine';
import { pack } from '../../testFixtures/mission';

const registry = {
  cards: new Map([
    ['c1', 'd1'],
    ['c2', 'd1'],
  ]),
  mediaIds: new Set<string>(),
  missionIds: new Set<string>(),
};
const clone = () => JSON.parse(JSON.stringify(pack));
const command = (state: any, type: string, extra: any = {}) => ({
  id: `op-${state.revision}`,
  runId: state.id,
  nodeId: state.nodeId,
  expectedRevision: state.revision,
  at: 1000 + state.revision,
  type,
  ...extra,
});
test('validates a finite reachable mission against source/media/prerequisite registries', () => {
  expect(validateMission(pack, registry)).toEqual(pack);
  for (const change of [
    (p: any) => (p.nodes[0].next = 'missing'),
    (p: any) => (p.nodes[0].next = 'intro'),
    (p: any) => p.nodes.push({ ...p.nodes[0], id: 'orphan' }),
    (p: any) => (p.nodes[1].exercise.cardId = 'missing'),
    (p: any) => p.prerequisites.push('missing'),
    (p: any) => (p.nodes[0].mediaId = 'missing'),
  ]) {
    const p = clone();
    change(p);
    expect(() => validateMission(p, registry)).toThrow();
  }
});
test.each([
  (p: any) => p.nodes.push(p.nodes[0]),
  (p: any) => (p.nodes[2].options[1].id = 'water'),
  (p: any) => (p.nodes[2].options[1].correct = true),
  (p: any) => (p.nodes[1].hints = []),
  (p: any) => (p.nodes[0].text = { en: 'x' }),
  (p: any) => (p.schemaVersion = 99),
  (p: any) => (p.nodes = Array(2)),
])('rejects malformed mission schema %s', (change) => {
  const p = clone();
  change(p);
  expect(() => validateMission(p, registry)).toThrow();
});
test('finishes deterministically with separate assessed recall/recognition and no raw answers', () => {
  let s = startMission(pack, 'run', 1000);
  s = transitionMission(pack, s, command(s, 'advance')).state;
  let result = transitionMission(
    pack,
    s,
    command(s, 'answer', { answer: ' HOLA! ', durationMs: 500 }),
  );
  expect(result.event).toMatchObject({
    missionId: 'morning',
    modality: 'recall',
    evidence: 'answer-checked',
    hintsUsed: 0,
    outcome: 'correct',
  });
  expect(JSON.stringify(result.state)).not.toContain('HOLA');
  s = transitionMission(pack, result.state, command(result.state, 'advance')).state;
  result = transitionMission(pack, s, command(s, 'answer', { choiceId: 'water', durationMs: 400 }));
  expect(result.event).toMatchObject({ modality: 'recognition', outcome: 'correct' });
  s = transitionMission(pack, result.state, command(result.state, 'advance')).state;
  expect(s).toMatchObject({ nodeId: 'end', assisted: false, reviewCardIds: [] });
  expect(() => transitionMission(pack, s, command(s, 'advance'))).toThrow();
});
test('hints and wrong attempts preserve assistance; retries do not penalize SRS', () => {
  let s = transitionMission(pack, startMission(pack, 'run', 1000), {
    id: 'intro',
    runId: 'run',
    nodeId: 'intro',
    expectedRevision: 0,
    type: 'advance',
    at: 1000,
  }).state;
  s = transitionMission(pack, s, command(s, 'hint')).state;
  const wrong = transitionMission(
    pack,
    s,
    command(s, 'answer', { answer: 'adios', durationMs: 5 }),
  );
  expect(wrong.state).toMatchObject({ assisted: true, reviewCardIds: ['c1'], hintsUsed: 1 });
  s = transitionMission(pack, wrong.state, command(wrong.state, 'retry')).state;
  const correct = transitionMission(
    pack,
    s,
    command(s, 'answer', { answer: 'hola', durationMs: 5 }),
  );
  expect(correct.event).toMatchObject({ outcome: 'correct', hintsUsed: 1 });
  expect(correct.state.reviewCardIds).toEqual(['c1']);
  expect(() => transitionMission(pack, correct.state, command(correct.state, 'hint'))).toThrow();
});
test('deduplicates the retained intent, rejects changed IDs/stale revisions and version mismatch', () => {
  const s = startMission(pack, 'run', 1000),
    c = command(s, 'advance');
  const first = transitionMission(pack, s, c);
  expect(transitionMission(pack, first.state, c)).toMatchObject({
    state: first.state,
    replayed: true,
  });
  expect(() => transitionMission(pack, first.state, { ...c, type: 'hint' })).toThrow();
  expect(() => transitionMission(pack, first.state, { ...c, id: 'another' })).toThrow();
  expect(() =>
    transitionMission({ ...pack, contentVersion: 2 }, first.state, command(first.state, 'hint')),
  ).toThrow();
});
test('rejects empty responses, invalid timings, invalid choices and impossible stored states', () => {
  let s = transitionMission(pack, startMission(pack, 'run', 1000), {
    id: 'intro',
    runId: 'run',
    nodeId: 'intro',
    expectedRevision: 0,
    type: 'advance',
    at: 1000,
  }).state;
  for (const extra of [
    { answer: '' },
    { answer: 'hola', durationMs: -1 },
    { answer: 'hola', durationMs: null },
  ])
    expect(() => transitionMission(pack, s, command(s, 'answer', extra))).toThrow();
  const envelope = { schemaVersion: 1, runs: [s] };
  expect(() => validateMissionEnvelope(envelope)).not.toThrow();
  for (const patch of [
    { revision: -1 },
    { hintsUsed: 0.5 },
    { assisted: 'yes' },
    { modelAnswerRevealed: 'yes' },
    { reviewCardIds: ['c1', 'c1'] },
    { unexpected: true },
  ])
    expect(() =>
      validateMissionEnvelope({ schemaVersion: 1, runs: [{ ...s, ...patch }] }),
    ).toThrow();
  expect(() => validateMissionEnvelope({ schemaVersion: 1, runs: [s, s] })).toThrow();
  s = transitionMission(pack, s, command(s, 'answer', { answer: 'hola', durationMs: 1 })).state;
  s = transitionMission(pack, s, command(s, 'advance')).state;
  expect(() =>
    transitionMission(pack, s, command(s, 'answer', { choiceId: 'invalid', durationMs: 1 })),
  ).toThrow();
});

test('records model exposure on retries even without requested hints', () => {
  let s = startMission(pack, 'model-run', 1000);
  s = transitionMission(pack, s, command(s, 'advance')).state;
  s = transitionMission(pack, s, command(s, 'answer', { answer: 'adios', durationMs: 1 })).state;
  s = transitionMission(pack, s, command(s, 'retry')).state;
  const result = transitionMission(
    pack,
    s,
    command(s, 'answer', { answer: 'hola', durationMs: 1 }),
  );
  expect(result.event).toMatchObject({
    hintsUsed: 0,
    assistance: 'model-answer',
    outcome: 'correct',
  });
  expect(result.state.assisted).toBe(true);
});
