import storage, { StorageAccess, withStorageTransaction } from './durableStorage';
import { DailyPlan, dailyPlanDefinition, validateDailyPlanEnvelope } from './dailyPlanSchema';
import { isValidStudySession } from './studySession';
import type { AnswerAttempt } from './flashcardAnswer';

const KEY = 'SRS_DAILY_PLAN_V1';
export async function readDailyPlan(
  access: StorageAccess = storage,
): Promise<DailyPlan | undefined> {
  const raw = await access.getItem(KEY);
  if (raw === null) return undefined;
  const envelope: unknown = JSON.parse(raw);
  validateDailyPlanEnvelope(envelope);
  return envelope.current ?? undefined;
}
export function startDailyPlan(value: DailyPlan, access?: StorageAccess): Promise<DailyPlan> {
  validateDailyPlanEnvelope({ schemaVersion: 1, current: value });
  const input: DailyPlan = JSON.parse(JSON.stringify(value));
  if (
    input.phase !== (input.review ? 'review' : 'applied') ||
    (input.review &&
      JSON.stringify(input.review.initialCardIds) !==
        JSON.stringify(input.review.session.queue!.cardIds))
  )
    throw new Error('A daily plan must start at its first activity');
  const start = async (tx: StorageAccess) => {
    const current = await readDailyPlan(tx);
    if (current?.id === input.id) {
      if (dailyPlanDefinition(current) !== dailyPlanDefinition(input))
        throw new Error('Daily plan ID conflict');
      return current;
    }
    if (current && current.phase !== 'complete') throw new Error('Unfinished daily plan');
    await tx.setItem(KEY, JSON.stringify({ schemaVersion: 1, current: input }));
    return input;
  };
  return access ? start(access) : withStorageTransaction(start);
}

/** Explicitly end an intent, retaining every grade, observation and schedule. */
export function abandonDailyPlan(id: string): Promise<void> {
  return withStorageTransaction(async (tx) => {
    const current = await readDailyPlan(tx);
    if (!current) return;
    if (current.id !== id) throw new Error('Stale daily plan');
    await tx.setItem(KEY, JSON.stringify({ schemaVersion: 1, current: null }));
  });
}

export async function linkedAppliedPlan(
  tx: StorageAccess,
  planId: string,
  missionId: string,
  contentVersion: number,
  runId?: string,
  allowComplete = false,
): Promise<DailyPlan> {
  const plan = await readDailyPlan(tx);
  if (
    !plan ||
    plan.id !== planId ||
    (plan.phase !== 'applied' && !(allowComplete && plan.phase === 'complete')) ||
    plan.applied?.missionId !== missionId ||
    plan.applied.contentVersion !== contentVersion ||
    (runId !== undefined && plan.applied.runId !== runId)
  )
    throw new Error('Stale applied plan');
  return plan;
}
export async function completeAppliedPlan(tx: StorageAccess, plan: DailyPlan): Promise<void> {
  const next = { ...plan, phase: 'complete' as const };
  validateDailyPlanEnvelope({ schemaVersion: 1, current: next });
  await tx.setItem(KEY, JSON.stringify({ schemaVersion: 1, current: next }));
}

/** Called only within the grading transaction after a real card and budget are validated. */
export async function advancePlanReview(tx: StorageAccess, attempt: AnswerAttempt): Promise<void> {
  if (attempt.planId === undefined) return;
  const plan = await readDailyPlan(tx);
  const current = plan?.review?.session;
  const queue = current?.queue;
  const next = attempt.nextSession;
  const candidate = next ? { ...next, updatedAt: Date.now() } : undefined;
  if (
    !plan ||
    plan.id !== attempt.planId ||
    plan.phase !== 'review' ||
    !current ||
    !queue ||
    current.cardId !== attempt.cardId ||
    queue.sessionId !== attempt.sessionId ||
    !isValidStudySession(candidate) ||
    candidate.deckId !== current.deckId ||
    candidate.queue?.sessionId !== queue.sessionId ||
    candidate.queue.region !== queue.region ||
    candidate.queue.limits?.cardLimit !== queue.limits!.cardLimit ||
    candidate.queue.limits?.newLimit !== queue.limits!.newLimit ||
    JSON.stringify(candidate.queue.cardIds) !== JSON.stringify(queue.cardIds.slice(1))
  )
    throw new Error('Stale daily plan grade');
  const updated: DailyPlan = {
    ...plan,
    review: { ...plan.review!, session: candidate },
    phase: candidate.queue!.cardIds.length ? 'review' : plan.applied ? 'applied' : 'complete',
  };
  validateDailyPlanEnvelope({ schemaVersion: 1, current: updated });
  await tx.setItem(KEY, JSON.stringify({ schemaVersion: 1, current: updated }));
}
