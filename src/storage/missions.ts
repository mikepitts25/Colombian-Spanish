import AsyncStorage, { StorageAccess, withStorageTransaction } from './durableStorage';
import { linkedAppliedPlan, completeAppliedPlan } from './dailyPlans';
import {
  serializeLearningHistoryWrite,
  readLearningEvents,
  mergeEventHistory,
} from './learningEvents';
import { MissionPack, validateMission } from '../missions/schema';
import {
  MissionCommand,
  MissionEnvelope,
  MissionRun,
  startMission,
  transitionMission,
  validateMissionEnvelope,
  validateMissionRun,
} from '../missions/engine';
const KEY = 'SRS_MISSIONS_V1';
async function readRuns(access: StorageAccess): Promise<MissionEnvelope> {
  const raw = await access.getItem(KEY);
  const value = raw === null ? { schemaVersion: 1, runs: [] } : JSON.parse(raw);
  validateMissionEnvelope(value);
  return value;
}
export async function loadMissionRun(
  pack: MissionPack,
  planId?: string,
): Promise<{ run?: MissionRun; contentChanged: boolean; expectedRunId?: string }> {
  const read = async (tx: StorageAccess) => {
    const current = (await readRuns(tx)).runs.find((run) => run.missionId === pack.id);
    if (planId) {
      const plan = await linkedAppliedPlan(
        tx,
        planId,
        pack.id,
        pack.contentVersion,
        undefined,
        true,
      );
      if (current?.id !== plan.applied!.runId)
        return { contentChanged: false, expectedRunId: current?.id };
      validateMissionRun(pack, current);
      if (current.completed && plan.phase === 'applied') await completeAppliedPlan(tx, plan);
    }
    if (!current) return { contentChanged: false };
    const contentChanged = current.contentVersion !== pack.contentVersion;
    if (!contentChanged) validateMissionRun(pack, current);
    return { run: current, contentChanged };
  };
  return planId ? withStorageTransaction(read) : read(AsyncStorage);
}
export function startMissionRun(
  value: MissionPack,
  id: string,
  at: number,
  expectedRunId?: string,
  planId?: string,
): Promise<MissionRun> {
  const pack = validateMission(value);
  const fresh = startMission(pack, id, at);
  return serializeLearningHistoryWrite(() =>
    withStorageTransaction(async (tx) => {
      const envelope = await readRuns(tx),
        current = envelope.runs.find((run) => run.missionId === pack.id);
      const plan = planId
        ? await linkedAppliedPlan(
            tx,
            planId,
            pack.id,
            pack.contentVersion,
            id,
            current?.id === id && current.completed,
          )
        : undefined;
      if (current?.id === id) {
        validateMissionRun(pack, current);
        if (plan && current.completed) await completeAppliedPlan(tx, plan);
        return current;
      }
      if (current?.id !== expectedRunId) throw new Error('Stale mission start');
      if (
        pack.prerequisites.some(
          (id) => !envelope.runs.some((run) => run.missionId === id && run.completed),
        )
      )
        throw new Error('Missing mission prerequisite');
      const runs = [...envelope.runs.filter((run) => run.missionId !== pack.id), fresh];
      validateMissionEnvelope({ schemaVersion: 1, runs });
      await tx.setItem(KEY, JSON.stringify({ schemaVersion: 1, runs }));
      return fresh;
    }),
  );
}
export function applyMissionCommand(
  value: MissionPack,
  input: MissionCommand,
  planId?: string,
): Promise<MissionRun> {
  const pack = validateMission(value),
    command: MissionCommand = JSON.parse(JSON.stringify(input));
  return serializeLearningHistoryWrite(() =>
    withStorageTransaction(async (tx) => {
      const envelope = await readRuns(tx),
        current = envelope.runs.find((run) => run.missionId === pack.id);
      if (!current) throw new Error('No active mission');
      const result = transitionMission(pack, current, command);
      const plan = planId
        ? await linkedAppliedPlan(
            tx,
            planId,
            pack.id,
            pack.contentVersion,
            current.id,
            result.replayed && result.state.completed,
          )
        : undefined;
      if (result.replayed) return result.state;
      if (result.event) {
        const events = mergeEventHistory(await readLearningEvents(tx), [result.event]);
        await tx.setItem('SRS_LEARNING_EVENTS_V1', JSON.stringify({ schemaVersion: 1, events }));
      }
      await tx.setItem(
        KEY,
        JSON.stringify({
          schemaVersion: 1,
          runs: envelope.runs.map((run) => (run.missionId === pack.id ? result.state : run)),
        }),
      );
      if (plan && result.state.completed) await completeAppliedPlan(tx, plan);
      return result.state;
    }),
  );
}
