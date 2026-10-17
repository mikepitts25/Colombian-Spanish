import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
import {
  startMission,
  transitionMission,
  validateMissionEnvelope,
} from '../../src/missions/engine';
import { calibratedActivitySeconds, ActivityTimingSample } from '../../src/missions/activeTiming';
const pack = DAILY_RESPONSE;
const now = 10000000000;
const sample = (i: number, durationMs = 20000): ActivityTimingSample => ({
  runId: `r${i}`,
  missionId: pack.id,
  contentVersion: pack.contentVersion,
  occurredAt: now - i,
  durationMs,
});
test('requires five completed distinct current-version recent samples, bounded median and no invented legacy timing', () => {
  const five = Array.from({ length: 5 }, (_, i) => sample(i));
  expect(calibratedActivitySeconds(five.slice(1), pack, now)).toBeUndefined();
  expect(calibratedActivitySeconds(Array(5).fill(sample(1)), pack, now)).toBeUndefined();
  expect(calibratedActivitySeconds(five, pack, now)).toBe(20);
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, contentVersion: 2 })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, occurredAt: now + 1 })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, occurredAt: 0 })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, missionId: 'other' })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, durationMs: 1000 })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, durationMs: 180001 })),
      pack,
      now,
    ),
  ).toBeUndefined();
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, durationMs: 2000 })),
      pack,
      now,
    ),
  ).toBe(15);
  expect(
    calibratedActivitySeconds(
      five.map((x) => ({ ...x, durationMs: 180000 })),
      pack,
      now,
    ),
  ).toBe(90);
  expect(
    calibratedActivitySeconds(
      [
        ...Array.from({ length: 30 }, (_, i) => sample(i, 30000)),
        ...Array.from({ length: 30 }, (_, i) => sample(i + 30, 150000)),
      ],
      pack,
      now,
    ),
  ).toBe(30);
});
test('accumulates actionable hint and answer segments; retry preserves total and timing identity', () => {
  const initial = startMission(pack, 'r', 1000);
  expect(initial.activeTiming).toEqual({ durationMs: 0 });
  const hint = {
    id: 'h',
    runId: 'r',
    nodeId: pack.entry,
    expectedRevision: 0,
    at: 2000,
    type: 'hint' as const,
    activeDurationMs: 3000,
  };
  const hinted = transitionMission(pack, initial, hint).state;
  const answer = {
    id: 'a',
    runId: 'r',
    nodeId: pack.entry,
    expectedRevision: 1,
    at: 3000,
    type: 'answer' as const,
    answer: 'Buenos días',
    durationMs: 999999,
    activeDurationMs: 5000,
  };
  const checked = transitionMission(pack, hinted, answer).state;
  expect(checked.activeTiming).toEqual({ durationMs: 8000 });
  expect(transitionMission(pack, checked, answer).replayed).toBe(true);
  expect(() => transitionMission(pack, checked, { ...answer, activeDurationMs: 9000 })).toThrow(
    'conflict',
  );
  const retry = transitionMission(pack, checked, {
    id: 'r',
    runId: 'r',
    nodeId: pack.entry,
    expectedRevision: 2,
    at: 4000,
    type: 'retry',
  }).state;
  expect(retry.activeTiming).toEqual({ durationMs: 8000 });
  const unknown = transitionMission(pack, retry, {
    ...answer,
    id: 'a2',
    expectedRevision: 3,
    activeDurationMs: null,
  }).state;
  expect(unknown.activeTiming).toEqual({ durationMs: null });
});
test('legacy runs and missing active segments remain unknown; reject malformed timing without erasing old envelopes', () => {
  const initial = startMission(pack, 'r', 1000);
  const legacy = { ...initial };
  delete legacy.activeTiming;
  expect(() => validateMissionEnvelope({ schemaVersion: 1, runs: [legacy] })).not.toThrow();
  const command = {
    id: 'a',
    runId: 'r',
    nodeId: pack.entry,
    expectedRevision: 0,
    at: 2000,
    type: 'answer' as const,
    answer: 'Buenos días',
    durationMs: 5000,
  };
  expect(transitionMission(pack, initial, command).state.activeTiming).toEqual({
    durationMs: null,
  });
  expect(
    transitionMission(pack, legacy, { ...command, activeDurationMs: 5000 }).state.activeTiming,
  ).toBeUndefined();
  for (const activeTiming of [
    { durationMs: -1 },
    { durationMs: NaN },
    { durationMs: 0, extra: true },
  ])
    expect(() =>
      validateMissionEnvelope({ schemaVersion: 1, runs: [{ ...initial, activeTiming }] }),
    ).toThrow();
  for (const timings of [
    [{ ...sample(1), durationMs: -1 }],
    [sample(1), sample(1)],
    Array(101).fill(sample(1)),
    [{ ...sample(1), extra: true }],
  ])
    expect(() => validateMissionEnvelope({ schemaVersion: 1, runs: [], timings })).toThrow();
});
