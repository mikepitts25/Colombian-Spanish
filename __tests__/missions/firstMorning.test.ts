import { ALL_DECKS } from '../../src/data/decks';
import { FIRST_MORNING } from '../../src/missions/firstMorning';
import { validateMission } from '../../src/missions/schema';
import { startMission, transitionMission, MissionCommand } from '../../src/missions/engine';

test('draft source references resolve in the bundled library and every reply path can complete', () => {
  expect(
    validateMission(FIRST_MORNING, {
      cards: new Map(
        ALL_DECKS.flatMap((d) => d.cards.map((c) => [c.id, d.id] as [string, string])),
      ),
      mediaIds: new Set(),
      missionIds: new Set(),
    }),
  ).toEqual(FIRST_MORNING);
  for (const assisted of [false, true]) {
    let run = startMission(FIRST_MORNING, 'run', 1000);
    for (let step = 0; step < 30 && !run.completed; step++) {
      const node = FIRST_MORNING.nodes.find((n) => n.id === run.nodeId)!;
      const send = (type: MissionCommand['type'], extra: Partial<MissionCommand> = {}) => {
        run = transitionMission(FIRST_MORNING, run, {
          id: `operation-${run.revision}`,
          runId: run.id,
          nodeId: run.nodeId,
          expectedRevision: run.revision,
          at: 1000 + step,
          type,
          ...extra,
        }).state;
      };
      if (node.kind === 'scene' || run.feedback) send('advance');
      else if (node.kind === 'production')
        send('answer', {
          answer: assisted ? 'wrong' : node.exercise.acceptedAnswers[0],
          durationMs: 10,
        });
      else if (node.kind === 'choice')
        send('answer', {
          choiceId: node.options.find((o) => o.correct !== assisted)!.id,
          durationMs: 10,
        });
    }
    expect(run.completed).toBe(true);
    expect(run.assisted).toBe(assisted);
    expect(run.reviewCardIds.length).toBe(assisted ? 4 : 0);
  }
});

test('editorial handoff matches the exact draft and four bundled source cards', () => {
  const packet = require('../../docs/editorial/first-morning-mission-draft.json');
  const crypto = require('crypto');
  expect(packet.status).toBe('unreviewed-draft');
  expect(packet.mission).toEqual(FIRST_MORNING);
  expect(packet.missionSha256).toBe(
    crypto.createHash('sha256').update(JSON.stringify(FIRST_MORNING)).digest('hex'),
  );
  expect(packet.sourceCards).toEqual(
    ALL_DECKS.flatMap((d) =>
      d.cards
        .filter((c) => ['0010', '0024', '0025', '1148'].includes(c.id))
        .map((card) => ({ deckId: d.id, card })),
    ),
  );
});
