import type { Deck } from '../types';
import { SHOW_REVIEW_TOOLS } from '../config';
import { AdventureMode, resolveAdventure, definitionFingerprint } from '../adventures/content';
import {
  AdventureRun,
  AdventureState,
  emptyAdventures,
  outcomeKey,
  validateAdventureState,
} from '../adventures/state';
import {
  MissionCommand,
  startMission,
  transitionMission,
  validateMissionRun,
} from '../missions/engine';
import type { MissionStorageAdapter } from '../missions/storageAdapter';
import AsyncStorage, { StorageAccess, withStorageTransaction } from './durableStorage';
import {
  mergeEventHistory,
  readLearningEvents,
  serializeLearningHistoryWrite,
} from './learningEvents';
const KEY = 'SRS_ADVENTURES_V1';
export async function readAdventures(
  access: StorageAccess = AsyncStorage,
): Promise<AdventureState> {
  if (access === AsyncStorage) return withStorageTransaction((tx) => readAdventures(tx));
  const raw = await access.getItem(KEY);
  const state: unknown = raw === null ? emptyAdventures() : JSON.parse(raw);
  validateAdventureState(state);
  return state;
}
async function save(tx: StorageAccess, state: AdventureState) {
  state.runs.sort((a, b) =>
    `${a.mode}:${a.mission.missionId}`.localeCompare(`${b.mode}:${b.mission.missionId}`),
  );
  state.milestones.sort((a, b) =>
    `${a.mode}:${a.missionId}`.localeCompare(`${b.mode}:${b.missionId}`),
  );
  state.outcomes.sort((a, b) => outcomeKey(a).localeCompare(outcomeKey(b)));
  validateAdventureState(state);
  await tx.setItem(KEY, JSON.stringify(state));
}
export function createAdventureAdapter(
  id: string,
  mode: AdventureMode,
  getDecks: () => Deck[],
  expectedFingerprint = resolveAdventure(id, getDecks(), mode)?.fingerprint,
): MissionStorageAdapter {
  const resolve = () => {
    if (mode === 'preview' && !SHOW_REVIEW_TOOLS)
      throw new Error('Draft adventures are unavailable');
    const definition = resolveAdventure(id, getDecks(), mode);
    if (!definition) throw new Error('Adventure content unavailable');
    if (definition.fingerprint !== expectedFingerprint)
      throw new Error('Adventure content changed since display');
    return definition;
  };
  const find = (state: AdventureState) =>
    state.runs.find((r) => r.mode === mode && r.mission.missionId === id);
  const current = (entry: AdventureRun | undefined) => {
    const def = resolve();
    if (
      !entry ||
      entry.fingerprint !== def.fingerprint ||
      entry.definitionFingerprint !== definitionFingerprint(def)
    )
      throw new Error('Adventure content changed');
    validateMissionRun(def.pack, entry.mission);
    if (entry.correctNodeIds.some((n) => !def.requiredNodeIds.includes(n)))
      throw new Error('Invalid adventure evidence');
    return def;
  };
  const write = <T>(operation: (tx: StorageAccess, state: AdventureState) => Promise<T>) =>
    serializeLearningHistoryWrite(() =>
      withStorageTransaction(async (tx) => operation(tx, await readAdventures(tx))),
    );
  return {
    load: () =>
      withStorageTransaction(async (tx) => {
        const def = resolve(),
          entry = find(await readAdventures(tx));
        if (!entry) return { contentChanged: false };
        const changed =
          entry.fingerprint !== def.fingerprint ||
          entry.mission.contentVersion !== def.pack.contentVersion;
        if (!changed) current(entry);
        return { run: entry.mission, expectedRunId: entry.mission.id, contentChanged: changed };
      }),
    start: (runId, at, expectedRunId) =>
      write(async (tx, state) => {
        const def = resolve(),
          previous = find(state);
        if (previous?.mission.id === runId) {
          current(previous);
          return previous.mission;
        }
        if (
          previous?.mission.id !== expectedRunId ||
          state.runs.some((r) => r.mission.id === runId)
        )
          throw new Error('Stale adventure start');
        if (
          def.pack.prerequisites.some(
            (prerequisite) =>
              !state.milestones.some((m) => m.mode === mode && m.missionId === prerequisite),
          )
        )
          throw new Error('Complete the first visit first');
        const mission = startMission(def.pack, runId, at);
        state.runs = state.runs.filter((r) => !(r.mode === mode && r.mission.missionId === id));
        state.runs.push({
          mode,
          fingerprint: def.fingerprint,
          definitionFingerprint: definitionFingerprint(def),
          mission,
          warmupUsed: false,
          correctNodeIds: [],
        });
        await save(tx, state);
        return mission;
      }),
    apply: (input: MissionCommand) => {
      const command: MissionCommand = JSON.parse(JSON.stringify(input));
      return write(async (tx, state) => {
        const entry = find(state),
          def = current(entry);
        const result = transitionMission(def.pack, entry!.mission, command);
        if (result.replayed) return entry!.mission;
        entry!.mission = result.state;
        if (command.type === 'retry') entry!.mission.assisted = true;
        if (result.event) {
          if (entry!.warmupUsed) result.event.assistance = 'model-answer';
          if (
            result.event.outcome === 'correct' &&
            def.requiredNodeIds.includes(command.nodeId) &&
            !entry!.correctNodeIds.includes(command.nodeId)
          )
            entry!.correctNodeIds.push(command.nodeId);
          // Corrections reveal a model even when the learner immediately advances.
          if (result.event.outcome !== 'correct') entry!.mission.assisted = true;
          const events = mergeEventHistory(await readLearningEvents(tx), [result.event]);
          await tx.setItem('SRS_LEARNING_EVENTS_V1', JSON.stringify({ schemaVersion: 1, events }));
        }
        if (result.state.completed) {
          const identity = {
            mode,
            missionId: id,
            contentVersion: def.pack.contentVersion,
            fingerprint: def.fingerprint,
            runId: result.state.id,
          };
          if (!state.milestones.some((m) => m.mode === mode && m.missionId === id))
            state.milestones.push({ ...identity, completedAt: command.at });
          if (def.requiredNodeIds.every((node) => entry!.correctNodeIds.includes(node))) {
            const earned = state.outcomes.find((o) => outcomeKey(o) === outcomeKey(identity));
            const supported = entry!.warmupUsed || result.state.assisted;
            if (earned) earned.supported = earned.supported && supported;
            else state.outcomes.push({ ...identity, earnedAt: command.at, supported });
          }
        }
        await save(tx, state);
        return entry!.mission;
      });
    },
    warmup: (runId) =>
      write(async (tx, state) => {
        const entry = find(state);
        current(entry);
        if (entry!.mission.id !== runId || entry!.mission.completed)
          throw new Error('Warm-up run unavailable');
        if (!entry!.warmupUsed) {
          if (entry!.mission.revision >= 100000) throw new Error('Adventure revision limit');
          entry!.warmupUsed = true;
          entry!.mission.assisted = true;
          entry!.mission.revision++;
          await save(tx, state);
        }
        return entry!.mission;
      }),
  };
}
