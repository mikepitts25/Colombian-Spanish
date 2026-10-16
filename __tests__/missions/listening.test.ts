import { listeningPack as pack } from '../../testFixtures/listening';
import { validateMission } from '../../src/missions/schema';
import { startMission, transitionMission, validateMissionRun } from '../../src/missions/engine';
import { normalizeEvent } from '../../src/storage/learningEventSchema';
const registry = {
  cards: new Map([['c1', 'd1']]),
  mediaIds: new Set(['c1']),
  missionIds: new Set<string>(),
  transcripts: new Map([['c1', 'hola']]),
};
const send = (run: any, type: any, extra: any = {}) => ({
  id: `operation-${run.revision}`,
  runId: run.id,
  nodeId: run.nodeId,
  expectedRevision: run.revision,
  at: 1000 + run.revision,
  type,
  ...extra,
});
test('validates listening audio, source and exact transcript references', () => {
  expect(validateMission(pack, registry)).toEqual(pack);
  for (const change of [
    (p: any) => delete p.nodes[0].mediaId,
    (p: any) => (p.nodes[0].mediaId = 'missing'),
    (p: any) => (p.media[0].cardId = 'other'),
    (p: any) => (p.nodes[0].transcript = 'different'),
    (p: any) => delete p.nodes[0].transcript,
    (p: any) => (p.nodes[0].transcript = ''),
  ]) {
    const p = JSON.parse(JSON.stringify(pack));
    change(p);
    expect(() => validateMission(p, registry)).toThrow();
  }
});
test('requires recorded playback and produces distinct listening evidence without raw transcript', () => {
  let run = startMission(pack, 'listen-run', 1000);
  expect(() =>
    transitionMission(pack, run, send(run, 'answer', { choiceId: 'hello', durationMs: 10 })),
  ).toThrow('playback');
  run = transitionMission(pack, run, send(run, 'playback')).state;
  const result = transitionMission(
    pack,
    run,
    send(run, 'answer', { choiceId: 'hello', durationMs: 10 }),
  );
  expect(result.event).toMatchObject({
    modality: 'listening',
    transcriptAssisted: false,
    audio: {
      kind: 'generated',
      evidence: 'playback-started',
      mediaId: 'audio-c1',
      contentVersion: 1,
    },
    outcome: 'correct',
  });
  expect(JSON.stringify(result.state)).not.toContain('hola');
  expect(result.state.assisted).toBe(false);
  expect(normalizeEvent(result.event)).toEqual(result.event);
});
test('retains transcript and model assistance separately through retry and clears step evidence on advance', () => {
  let run = startMission(pack, 'listen-run', 1000);
  run = transitionMission(pack, run, send(run, 'transcript')).state;
  expect(run).toMatchObject({ transcriptRevealed: true, assisted: true });
  run = transitionMission(pack, run, send(run, 'playback')).state;
  const wrong = transitionMission(
    pack,
    run,
    send(run, 'answer', { choiceId: 'water', durationMs: 10 }),
  );
  expect(wrong.event).toMatchObject({ transcriptAssisted: true, outcome: 'incorrect' });
  run = transitionMission(pack, wrong.state, send(wrong.state, 'retry')).state;
  const correct = transitionMission(
    pack,
    run,
    send(run, 'answer', { choiceId: 'hello', durationMs: 10 }),
  );
  expect(correct.event).toMatchObject({
    transcriptAssisted: true,
    assistance: 'model-answer',
    outcome: 'correct',
  });
  run = transitionMission(pack, correct.state, send(correct.state, 'advance')).state;
  expect(run.completed).toBe(true);
  expect(run.transcriptRevealed).toBeUndefined();
  expect(run.audioPlayed).toBeUndefined();
  expect(() => validateMissionRun(pack, run)).not.toThrow();
});
test('transcript/playback commands are idempotent and cannot mutate other node kinds or answered steps', () => {
  let run = startMission(pack, 'run', 1000);
  const cmd = send(run, 'playback');
  run = transitionMission(pack, run, cmd).state;
  expect(transitionMission(pack, run, cmd).replayed).toBe(true);
  const answer = transitionMission(
    pack,
    run,
    send(run, 'answer', { choiceId: 'hello', durationMs: 1 }),
  ).state;
  expect(() => transitionMission(pack, answer, send(answer, 'transcript'))).toThrow();
  const end = transitionMission(pack, answer, send(answer, 'advance')).state;
  expect(() => transitionMission(pack, end, send(end, 'playback'))).toThrow();
});
test('rejects malformed audio/transcript observations while preserving legacy events', () => {
  let run = startMission(pack, 'run', 1000);
  run = transitionMission(pack, run, send(run, 'playback')).state;
  const event = transitionMission(
    pack,
    run,
    send(run, 'answer', { choiceId: 'hello', durationMs: 1 }),
  ).event!;
  for (const patch of [
    { transcriptAssisted: 'true' },
    { modality: 'recall' },
    { audio: { ...event.audio, kind: 'human' } },
    { audio: { ...event.audio, contentVersion: 0 } },
    { audio: { ...event.audio, rawTranscript: 'hola' } },
  ])
    expect(() => normalizeEvent({ ...event, ...patch })).toThrow();
  const { audio, transcriptAssisted, ...legacy } = event;
  expect(() => normalizeEvent(legacy)).not.toThrow();
});

test('draft handoff matches the compiled listening pack and actual bundled sources', () => {
  const { LISTENING_BASICS } = require('../../src/missions/listeningBasics');
  const { ALL_DECKS } = require('../../src/data/decks');
  const { pronunciationAudio } = require('../../src/data/audioManifest');
  const packet = require('../../docs/editorial/listening-basics-draft.json');
  expect(
    validateMission(LISTENING_BASICS, {
      cards: new Map(ALL_DECKS.flatMap((d: any) => d.cards.map((c: any) => [c.id, d.id]))),
      transcripts: new Map(ALL_DECKS.flatMap((d: any) => d.cards.map((c: any) => [c.id, c.front]))),
      mediaIds: new Set(Object.keys(pronunciationAudio)),
      missionIds: new Set(),
    }),
  ).toEqual(LISTENING_BASICS);
  expect(packet.status).toBe('unreviewed-draft');
  expect(packet.mission).toEqual(LISTENING_BASICS);
  expect(packet.missionSha256).toBe(
    require('crypto').createHash('sha256').update(JSON.stringify(LISTENING_BASICS)).digest('hex'),
  );
  expect(packet.sourceCards).toEqual(
    ALL_DECKS.flatMap((d: any) =>
      d.cards
        .filter((c: any) => ['0010', '0024', '0025'].includes(c.id))
        .map((card: any) => ({ deckId: d.id, card })),
    ),
  );
});
