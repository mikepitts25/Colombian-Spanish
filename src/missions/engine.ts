import { ActivityTimingSample, isTimedResponse, validateActivityTimings } from './activeTiming';
import { assessProductionAnswer, createProductionObservation } from '../exercises/production';
import type { LearningEvent } from '../storage/learningEventSchema';
import { MissionPack, MissionNode, record, text, only, validateMission } from './schema';
export interface MissionRun {
  schemaVersion: 1;
  id: string;
  missionId: string;
  contentVersion: number;
  nodeId: string;
  revision: number;
  hintsUsed: number;
  assisted: boolean;
  modelAnswerRevealed: boolean;
  completed: boolean;
  audioPlayed?: boolean;
  transcriptRevealed?: boolean;
  reviewCardIds: string[];
  updatedAt: number;
  feedback?: {
    status: 'correct' | 'incorrect' | 'accent';
    optionId?: string;
    answerIndex?: number;
  };
  activeTiming?: { durationMs: number | null };
  lastOperation?: { id: string; key: string };
}
export interface MissionEnvelope {
  schemaVersion: 1;
  runs: MissionRun[];
  timings?: ActivityTimingSample[];
}
export interface MissionCommand {
  id: string;
  runId: string;
  nodeId: string;
  expectedRevision: number;
  at: number;
  type: 'advance' | 'hint' | 'retry' | 'answer' | 'playback' | 'transcript';
  answer?: string;
  choiceId?: string;
  durationMs?: number;
  activeDurationMs?: number | null;
}
const integer = (v: unknown, max = 100000): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= max;
export function validateMissionEnvelope(value: unknown): asserts value is MissionEnvelope {
  const fail = () => {
    throw new Error('Invalid saved mission state');
  };
  if (
    !record(value) ||
    !only(value, ['schemaVersion', 'runs', 'timings']) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.runs) ||
    value.runs.length > 50
  )
    fail();
  if ((value as MissionEnvelope).timings !== undefined)
    validateActivityTimings((value as MissionEnvelope).timings);
  const ids = new Set();
  for (const run of (value as MissionEnvelope).runs) {
    if (
      !record(run) ||
      !only(run, [
        'schemaVersion',
        'id',
        'missionId',
        'contentVersion',
        'nodeId',
        'revision',
        'hintsUsed',
        'assisted',
        'modelAnswerRevealed',
        'completed',
        'audioPlayed',
        'transcriptRevealed',
        'reviewCardIds',
        'updatedAt',
        'feedback',
        'lastOperation',
        'activeTiming',
      ]) ||
      run.schemaVersion !== 1 ||
      ![run.id, run.missionId, run.nodeId].every((v) => text(v)) ||
      !integer(run.contentVersion) ||
      !run.contentVersion ||
      !integer(run.revision) ||
      !integer(run.hintsUsed, 5) ||
      typeof run.assisted !== 'boolean' ||
      typeof run.modelAnswerRevealed !== 'boolean' ||
      typeof run.completed !== 'boolean' ||
      (run.audioPlayed !== undefined && typeof run.audioPlayed !== 'boolean') ||
      (run.transcriptRevealed !== undefined && typeof run.transcriptRevealed !== 'boolean') ||
      typeof run.updatedAt !== 'number' ||
      !Number.isFinite(run.updatedAt) ||
      run.updatedAt < 0 ||
      !Array.isArray(run.reviewCardIds) ||
      run.reviewCardIds.length > 50 ||
      !Array.from(run.reviewCardIds).every((v) => text(v)) ||
      new Set(run.reviewCardIds).size !== run.reviewCardIds.length ||
      ids.has(run.missionId)
    )
      fail();
    if (
      run.activeTiming !== undefined &&
      (!record(run.activeTiming) ||
        !only(run.activeTiming, ['durationMs']) ||
        !(run.activeTiming.durationMs === null || integer(run.activeTiming.durationMs, 86400000)))
    )
      fail();
    if (
      run.feedback !== undefined &&
      (!record(run.feedback) ||
        !only(run.feedback, ['status', 'optionId', 'answerIndex']) ||
        !['correct', 'incorrect', 'accent'].includes(run.feedback.status) ||
        (run.feedback.optionId !== undefined && !text(run.feedback.optionId)) ||
        (run.feedback.answerIndex !== undefined && !integer(run.feedback.answerIndex, 19)))
    )
      fail();
    if (
      run.lastOperation !== undefined &&
      (!record(run.lastOperation) ||
        !only(run.lastOperation, ['id', 'key']) ||
        !text(run.lastOperation.id) ||
        !text(run.lastOperation.key, 2000))
    )
      fail();
    ids.add(run.missionId);
  }
}
export function validateMissionRun(pack: MissionPack, run: MissionRun): MissionNode {
  validateMissionEnvelope({ schemaVersion: 1, runs: [run] });
  const node = pack.nodes.find((n) => n.id === run.nodeId);
  if (
    run.missionId !== pack.id ||
    run.contentVersion !== pack.contentVersion ||
    !node ||
    run.completed !== (node?.kind === 'complete') ||
    run.hintsUsed > node.hints.length ||
    ((run.transcriptRevealed ||
      run.modelAnswerRevealed ||
      run.hintsUsed > 0 ||
      run.reviewCardIds.length > 0) &&
      !run.assisted)
  )
    throw new Error('Mission content changed or saved state is inconsistent');
  if (
    node.kind === 'listening'
      ? typeof run.audioPlayed !== 'boolean' || typeof run.transcriptRevealed !== 'boolean'
      : run.audioPlayed !== undefined || run.transcriptRevealed !== undefined
  )
    throw new Error('Invalid saved listening evidence');
  if (run.feedback) {
    if (node.kind === 'listening' && !run.audioPlayed)
      throw new Error('Invalid saved playback evidence');
    if (node.kind === 'choice' || node.kind === 'listening') {
      const option = node.options.find((o) => o.id === run.feedback!.optionId);
      if (
        !option ||
        run.feedback.answerIndex !== undefined ||
        run.feedback.status !== (option.correct ? 'correct' : 'incorrect')
      )
        throw new Error('Invalid saved choice feedback');
    } else if (node.kind === 'production') {
      if (
        run.feedback.optionId !== undefined ||
        run.feedback.answerIndex === undefined ||
        run.feedback.answerIndex >= node.exercise.acceptedAnswers.length
      )
        throw new Error('Invalid saved answer feedback');
    } else throw new Error('Unexpected saved mission feedback');
    if (run.feedback.status !== 'correct' && !run.assisted)
      throw new Error('Invalid mission assistance');
  }
  return node;
}
export function startMission(pack: MissionPack, id: string, at: number): MissionRun {
  validateMission(pack);
  const run: MissionRun = {
    schemaVersion: 1,
    ...(pack.nodes.find((n) => n.id === pack.entry)?.kind === 'listening'
      ? { audioPlayed: false, transcriptRevealed: false }
      : {}),
    id,
    missionId: pack.id,
    contentVersion: pack.contentVersion,
    nodeId: pack.entry,
    revision: 0,
    hintsUsed: 0,
    assisted: false,
    modelAnswerRevealed: false,
    completed: false,
    ...(isTimedResponse(pack) ? { activeTiming: { durationMs: 0 } } : {}),
    reviewCardIds: [],
    updatedAt: at,
  };
  validateMissionRun(pack, run);
  return run;
}
export function transitionMission(
  pack: MissionPack,
  current: MissionRun,
  command: MissionCommand,
): { state: MissionRun; event?: LearningEvent; replayed?: boolean } {
  const node = validateMissionRun(pack, current);
  if (
    !text(command.id) ||
    !text(command.runId) ||
    !text(command.nodeId) ||
    !integer(command.expectedRevision) ||
    !Number.isFinite(command.at) ||
    command.at < 0 ||
    !['advance', 'hint', 'retry', 'answer', 'playback', 'transcript'].includes(command.type) ||
    (command.activeDurationMs !== undefined &&
      command.activeDurationMs !== null &&
      !integer(command.activeDurationMs, 86400000))
  )
    throw new Error('Invalid mission command');
  const source = pack.nodes.find((n) => n.id === command.nodeId);
  let status: string | undefined;
  if (command.type === 'answer' && source?.kind === 'production')
    status = assessProductionAnswer(source.exercise, command.answer as string, 0).status;
  const key = JSON.stringify([
    command.runId,
    command.nodeId,
    command.expectedRevision,
    command.type,
    command.choiceId ?? status ?? null,
    ...(command.activeDurationMs === undefined ? [] : [command.activeDurationMs]),
  ]);
  if (current.lastOperation?.id === command.id) {
    if (current.lastOperation.key !== key) throw new Error('Mission operation ID conflict');
    return { state: current, replayed: true };
  }
  if (
    command.runId !== current.id ||
    command.expectedRevision !== current.revision ||
    command.nodeId !== current.nodeId ||
    current.revision >= 100000
  )
    throw new Error('Stale mission revision');
  const state: MissionRun = JSON.parse(JSON.stringify(current));
  let event: LearningEvent | undefined;
  if (command.type === 'playback' || command.type === 'transcript') {
    if (node.kind !== 'listening' || state.feedback)
      throw new Error('Listening step is not available');
    if (command.type === 'playback') {
      if (state.audioPlayed) throw new Error('Playback already recorded');
      state.audioPlayed = true;
    } else {
      if (state.transcriptRevealed) throw new Error('Transcript already revealed');
      state.transcriptRevealed = true;
      state.assisted = true;
    }
  } else if (command.type === 'hint') {
    if (state.feedback || state.hintsUsed >= node.hints.length)
      throw new Error('No mission hint available');
    state.hintsUsed++;
    state.assisted = true;
  } else if (command.type === 'retry') {
    if (!state.feedback) throw new Error('No mission answer to retry');
    delete state.feedback;
    state.modelAnswerRevealed = true;
    state.assisted = true;
  } else if (command.type === 'advance') {
    let next: string;
    if (node.kind === 'scene') next = node.next;
    else if (node.kind === 'production' && state.feedback) next = node.next;
    else if ((node.kind === 'choice' || node.kind === 'listening') && state.feedback)
      next = node.options.find((o) => o.correct)!.next!;
    else throw new Error('Mission step is not ready to advance');
    const nextNode = pack.nodes.find((n) => n.id === next);
    if (nextNode?.kind === 'listening') {
      state.audioPlayed = false;
      state.transcriptRevealed = false;
    } else {
      delete state.audioPlayed;
      delete state.transcriptRevealed;
    }
    state.nodeId = next;
    state.completed = pack.nodes.find((n) => n.id === next)?.kind === 'complete';
    state.hintsUsed = 0;
    state.modelAnswerRevealed = false;
    delete state.feedback;
  } else {
    if (
      state.feedback ||
      typeof command.durationMs !== 'number' ||
      !Number.isFinite(command.durationMs) ||
      command.durationMs < 0
    )
      throw new Error('Invalid mission answer timing/state');
    if (node.kind === 'production') {
      const result = assessProductionAnswer(
        node.exercise,
        command.answer as string,
        state.hintsUsed,
      );
      if (result.status === 'empty') throw new Error('Unanswered mission exercise');
      state.feedback = {
        status: result.status,
        answerIndex: node.exercise.acceptedAnswers.indexOf(result.correctAnswer),
      };
      event = {
        ...createProductionObservation(node.exercise, {
          sessionId: state.id,
          attempt: state.revision,
          answer: command.answer!,
          hintsUsed: state.hintsUsed,
          modelAnswerRevealed: state.modelAnswerRevealed,
          occurredAt: command.at,
          durationMs: command.durationMs,
        }),
        missionId: pack.id,
      };
    } else if (node.kind === 'choice' || node.kind === 'listening') {
      if (node.kind === 'listening' && !state.audioPlayed)
        throw new Error('Listening answer requires playback');
      const option = node.options.find((o) => o.id === command.choiceId);
      if (!option) throw new Error('Invalid mission choice');
      state.feedback = { status: option.correct ? 'correct' : 'incorrect', optionId: option.id };
      event = {
        schemaVersion: 1,
        id: `mission:${JSON.stringify([state.id, state.revision])}`,
        sessionId: state.id,
        missionId: pack.id,
        cardId: node.cardId,
        deckId: node.deckId,
        modality: node.kind === 'listening' ? 'listening' : 'recognition',
        ...(node.kind === 'listening'
          ? {
              transcriptAssisted: state.transcriptRevealed!,
              audio: {
                kind: 'generated' as const,
                evidence: 'playback-started' as const,
                mediaId: node.mediaId,
                contentVersion: pack.contentVersion,
              },
            }
          : {}),
        ...(state.modelAnswerRevealed ? { assistance: 'model-answer' as const } : {}),
        evidence: 'answer-checked',
        outcome: option.correct ? 'correct' : 'incorrect',
        occurredAt: command.at,
        hintsUsed: state.hintsUsed,
        durationMs: command.durationMs,
      };
    } else throw new Error('Mission step has no answer');
    if (event.outcome === 'incorrect') {
      state.assisted = true;
      state.reviewCardIds = [...new Set([...state.reviewCardIds, event.cardId])];
    }
  }
  if (state.activeTiming && ['hint', 'answer'].includes(command.type)) {
    const prior = state.activeTiming.durationMs,
      segment = command.activeDurationMs;
    state.activeTiming.durationMs =
      prior !== null && typeof segment === 'number' && prior + segment <= 86400000
        ? prior + segment
        : null;
  }
  state.revision++;
  state.updatedAt = command.at;
  state.lastOperation = { id: command.id, key };
  validateMissionRun(pack, state);
  return { state, event };
}
