import type { Deck } from '../types';
import type { DailyPlan } from '../storage/dailyPlanSchema';
import type { MissionPack } from '../missions/schema';
import type { recommendDailyReview } from './dailyReview';
import { localDayKey } from './calendarDay';

export type DailyReviewRecommendation = NonNullable<ReturnType<typeof recommendDailyReview>>;
export type HomePhase = {
  kind: 'review' | 'reply';
  current: boolean;
  finished: boolean;
  unavailable: boolean;
};
export type HomePresentationInput = {
  ready: boolean;
  loaded: boolean;
  readError: boolean;
  now: number;
  plan?: DailyPlan;
  response?: Pick<MissionPack, 'id' | 'contentVersion'>;
  recommendation?: DailyReviewRecommendation;
  recommendedDeck?: Pick<Deck, 'id'>;
  totalCards: number;
  totalNew: number;
  newAvailableToday: number;
  starting: boolean;
  startError: boolean;
};
export type HomePresentation = {
  pending: boolean;
  startError: boolean;
  managePlanId?: string;
  phases: HomePhase[];
} & (
  | { kind: 'loading'; action: 'none' }
  | { kind: 'readError'; action: 'retryRead' }
  | { kind: 'reviewResume'; action: 'existingStart'; remainingCards: number }
  | {
      kind: 'appliedResume' | 'unavailablePlan' | 'completedToday' | 'appliedOnly';
      action: 'existingStart';
    }
  | { kind: 'recommendation'; action: 'existingStart'; suggestion: DailyReviewRecommendation }
  | { kind: 'browse'; action: 'browse'; reason: 'empty' | 'cap' | 'noDue' }
);

/** Present already-read facts; only the existing Home controller may start/retry a plan. */
export function deriveHomePresentation(input: HomePresentationInput): HomePresentation {
  const status = { pending: input.starting, startError: input.startError && !input.starting };
  if (!input.ready || (!input.loaded && !input.readError))
    return { ...status, startError: false, kind: 'loading', action: 'none', phases: [] };
  if (input.readError)
    return { ...status, startError: false, kind: 'readError', action: 'retryRead', phases: [] };

  const { plan, response, recommendation } = input;
  if (plan && (plan.phase !== 'complete' || plan.day === localDayKey(new Date(input.now)))) {
    const available =
      !!response &&
      plan.applied?.missionId === response.id &&
      plan.applied.contentVersion === response.contentVersion;
    const phases: HomePhase[] = [];
    if (plan.review)
      phases.push({
        kind: 'review',
        current: plan.phase === 'review',
        finished: plan.review.session.queue!.cardIds.length === 0,
        unavailable: false,
      });
    if (plan.applied)
      phases.push({
        kind: 'reply',
        current: plan.phase === 'applied' && available,
        finished: plan.phase === 'complete',
        unavailable: plan.phase !== 'complete' && !available,
      });
    if (plan.phase === 'review')
      return {
        ...status,
        kind: 'reviewResume',
        action: 'existingStart',
        phases,
        managePlanId: plan.id,
        remainingCards: plan.review!.session.queue!.cardIds.length,
      };
    if (plan.phase === 'applied')
      return {
        ...status,
        kind: available ? 'appliedResume' : 'unavailablePlan',
        action: 'existingStart',
        phases,
        managePlanId: plan.id,
      };
    return { ...status, kind: 'completedToday', action: 'existingStart', phases };
  }
  if (
    recommendation &&
    input.recommendedDeck?.id === recommendation.deckId &&
    recommendation.cardCount > 0
  )
    return {
      ...status,
      kind: 'recommendation',
      action: 'existingStart',
      suggestion: recommendation,
      phases: [
        { kind: 'review', current: false, finished: false, unavailable: false },
        ...(response
          ? [{ kind: 'reply' as const, current: false, finished: false, unavailable: false }]
          : []),
      ],
    };
  if (response)
    return {
      ...status,
      kind: 'appliedOnly',
      action: 'existingStart',
      phases: [{ kind: 'reply', current: false, finished: false, unavailable: false }],
    };
  return {
    ...status,
    kind: 'browse',
    action: 'browse',
    phases: [],
    reason:
      input.totalCards === 0
        ? 'empty'
        : input.totalNew > 0 && input.newAvailableToday === 0
          ? 'cap'
          : 'noDue',
  };
}
