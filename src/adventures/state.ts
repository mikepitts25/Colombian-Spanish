import { MissionRun, validateMissionEnvelope, validateMissionRun } from '../missions/engine';
import { only, record, text } from '../missions/schema';
import { ADVENTURES, AdventureMode, definitionFingerprint } from './content';
export interface AdventureRun {
  mode: AdventureMode;
  fingerprint: string;
  definitionFingerprint: string;
  mission: MissionRun;
  warmupUsed: boolean;
  correctNodeIds: string[];
}
export interface StoryMilestone {
  mode: AdventureMode;
  missionId: string;
  contentVersion: number;
  fingerprint: string;
  runId: string;
  completedAt: number;
}
export interface PracticeOutcome extends Omit<StoryMilestone, 'completedAt'> {
  earnedAt: number;
  supported: boolean;
}
export interface AdventureState {
  schemaVersion: 1;
  runs: AdventureRun[];
  milestones: StoryMilestone[];
  outcomes: PracticeOutcome[];
}
export const emptyAdventures = (): AdventureState => ({
  schemaVersion: 1,
  runs: [],
  milestones: [],
  outcomes: [],
});
export const outcomeKey = (
  r: Pick<PracticeOutcome, 'mode' | 'missionId' | 'contentVersion' | 'fingerprint'>,
) => JSON.stringify([r.mode, r.missionId, r.contentVersion, r.fingerprint]);
const mode = (v: unknown) => v === 'preview' || v === 'accepted';
const hash = (v: unknown) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const time = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export function validateAdventureState(value: unknown): asserts value is AdventureState {
  const fail = () => {
    throw new Error('Invalid adventure progress');
  };
  if (
    !record(value) ||
    !only(value, ['schemaVersion', 'runs', 'milestones', 'outcomes']) ||
    value.schemaVersion !== 1
  )
    fail();
  const state = value as AdventureState;
  for (const [rows, max] of [
    [state.runs, 50],
    [state.milestones, 50],
    [state.outcomes, 200],
  ] as const)
    if (!Array.isArray(rows) || rows.length > max || (rows as unknown[]).some((r) => !record(r)))
      fail();
  const slots = new Set(),
    ids = new Set();
  for (const run of state.runs) {
    if (
      !only(run, [
        'mode',
        'fingerprint',
        'definitionFingerprint',
        'mission',
        'warmupUsed',
        'correctNodeIds',
      ]) ||
      !mode(run.mode) ||
      !hash(run.fingerprint) ||
      !hash(run.definitionFingerprint) ||
      typeof run.warmupUsed !== 'boolean' ||
      !Array.isArray(run.correctNodeIds) ||
      run.correctNodeIds.length > 50 ||
      !Array.from(run.correctNodeIds).every((v) => text(v)) ||
      new Set(run.correctNodeIds).size !== run.correctNodeIds.length
    )
      fail();
    validateMissionEnvelope({ schemaVersion: 1, runs: [run.mission] });
    if (run.warmupUsed && !run.mission.assisted) fail();
    const known = ADVENTURES.find(
      (d) =>
        d.pack.id === run.mission.missionId && d.pack.contentVersion === run.mission.contentVersion,
    );
    if (known && run.definitionFingerprint === definitionFingerprint(known)) {
      validateMissionRun(known.pack, run.mission);
      if (run.correctNodeIds.some((id) => !known.requiredNodeIds.includes(id))) fail();
    }
    const key = JSON.stringify([run.mode, run.mission.missionId]);
    if (slots.has(key) || ids.has(run.mission.id)) fail();
    slots.add(key);
    ids.add(run.mission.id);
  }
  for (const [rows, outcome] of [
    [state.milestones, false],
    [state.outcomes, true],
  ] as const) {
    const seen = new Set();
    for (const row of rows) {
      if (
        !only(row, [
          'mode',
          'missionId',
          'contentVersion',
          'fingerprint',
          'runId',
          ...(outcome ? ['earnedAt', 'supported'] : ['completedAt']),
        ]) ||
        !mode(row.mode) ||
        !text(row.missionId) ||
        !text(row.runId) ||
        !Number.isSafeInteger(row.contentVersion) ||
        row.contentVersion < 1 ||
        !hash(row.fingerprint)
      )
        fail();
      if (
        outcome
          ? !time((row as PracticeOutcome).earnedAt) ||
            typeof (row as PracticeOutcome).supported !== 'boolean'
          : !time((row as StoryMilestone).completedAt)
      )
        fail();
      const key = outcome ? outcomeKey(row) : JSON.stringify([row.mode, row.missionId]);
      if (seen.has(key)) fail();
      seen.add(key);
    }
  }
}
