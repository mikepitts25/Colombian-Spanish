import { storedDayKey } from '../utils/calendarDay';
import { isValidStudySession, LastStudySession } from './studySession';

export interface DailyPlan {
  id: string;
  day: string;
  minutes: 3 | 5 | 10;
  createdAt: number;
  phase: 'review' | 'applied' | 'complete';
  review?: { initialCardIds: string[]; session: LastStudySession };
  applied?: { missionId: string; contentVersion: number; runId: string };
}
export interface DailyPlanEnvelope {
  schemaVersion: 1;
  current: DailyPlan | null;
}
const record = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const only = (value: object, keys: string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
const text = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 200;

export function validateDailyPlanEnvelope(value: unknown): asserts value is DailyPlanEnvelope {
  const fail = () => {
    throw new Error('Invalid daily plan state');
  };
  if (
    !record(value) ||
    !only(value, ['schemaVersion', 'current']) ||
    value.schemaVersion !== 1 ||
    value.current === undefined
  )
    fail();
  if ((value as DailyPlanEnvelope).current === null) return;
  const plan = (value as DailyPlanEnvelope).current!;
  if (
    !record(plan) ||
    !only(plan, ['id', 'day', 'minutes', 'createdAt', 'phase', 'review', 'applied']) ||
    !text(plan.id) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(plan.day) ||
    storedDayKey(plan.day) !== plan.day ||
    ![3, 5, 10].includes(plan.minutes) ||
    !Number.isSafeInteger(plan.createdAt) ||
    plan.createdAt < 0 ||
    !['review', 'applied', 'complete'].includes(plan.phase) ||
    (!plan.review && !plan.applied)
  )
    fail();
  if (
    plan.applied !== undefined &&
    (!record(plan.applied) ||
      !only(plan.applied, ['missionId', 'contentVersion', 'runId']) ||
      !text(plan.applied.missionId) ||
      !text(plan.applied.runId) ||
      !Number.isSafeInteger(plan.applied.contentVersion) ||
      plan.applied.contentVersion < 1)
  )
    fail();
  if (plan.review !== undefined) {
    const review = plan.review;
    if (
      !record(review) ||
      !only(review, ['initialCardIds', 'session']) ||
      !Array.isArray(review.initialCardIds) ||
      !review.initialCardIds.length ||
      review.initialCardIds.length > 15 ||
      !review.initialCardIds.every(text) ||
      new Set(review.initialCardIds).size !== review.initialCardIds.length ||
      !isValidStudySession(review.session) ||
      !review.session.queue?.limits ||
      review.initialCardIds.length > review.session.queue.limits.cardLimit
    )
      fail();
    const remaining = review.session.queue!.cardIds;
    const suffix = review.initialCardIds.slice(review.initialCardIds.length - remaining.length);
    if (
      remaining.length > review.initialCardIds.length ||
      JSON.stringify(remaining) !== JSON.stringify(suffix)
    )
      fail();
  }
  const remaining = plan.review?.session.queue?.cardIds.length ?? 0;
  if (
    (plan.phase === 'review' ? remaining === 0 : remaining > 0) ||
    (plan.phase === 'applied' && !plan.applied)
  )
    fail();
}

/** Immutable start identity, independent of progressed phase, remaining cards or checkpoint date. */
export function dailyPlanDefinition(plan: DailyPlan): string {
  const queue = plan.review?.session.queue;
  return JSON.stringify({
    id: plan.id,
    day: plan.day,
    minutes: plan.minutes,
    createdAt: plan.createdAt,
    review: plan.review
      ? {
          deckId: plan.review.session.deckId,
          ids: plan.review.initialCardIds,
          sessionId: queue!.sessionId,
          region: queue!.region,
          cardLimit: queue!.limits!.cardLimit,
          newLimit: queue!.limits!.newLimit,
        }
      : null,
    applied: plan.applied
      ? {
          missionId: plan.applied.missionId,
          contentVersion: plan.applied.contentVersion,
          runId: plan.applied.runId,
        }
      : null,
  });
}
