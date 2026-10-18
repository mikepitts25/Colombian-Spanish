import { deriveHomePresentation, HomePresentationInput } from '../../src/utils/homePresentation';
import { DailyPlan, validateDailyPlanEnvelope } from '../../src/storage/dailyPlanSchema';
import { translate, translations } from '../../src/i18n/translations';

const now = new Date(2032, 0, 8, 12).getTime();
const response = { id: 'greeting', contentVersion: 2 };
const suggestion = {
  deckId: 'd',
  catchUp: false,
  preferredRegion: 'all' as const,
  estimatedMinutes: 5 as const,
  secondsPerCard: 35,
  cardLimit: 9,
  newLimit: 2,
  cardCount: 9,
  dueCount: 7,
  newCount: 2,
};
const base: HomePresentationInput = {
  ready: true,
  loaded: true,
  readError: false,
  now,
  recommendation: suggestion,
  recommendedDeck: { id: 'd' },
  totalCards: 20,
  totalNew: 10,
  newAvailableToday: 4,
  starting: false,
  startError: false,
};
function plan(phase: DailyPlan['phase'] = 'review'): DailyPlan {
  const remaining = phase === 'review' ? ['b', 'c'] : [];
  const value: DailyPlan = {
    id: 'retained',
    day: '2032-01-07',
    minutes: 3,
    createdAt: now - 86400000,
    phase,
    review: {
      initialCardIds: ['a', 'b', 'c'],
      session: {
        deckId: 'd',
        ...(remaining[0] ? { cardId: remaining[0] } : {}),
        updatedAt: now,
        queue: {
          schemaVersion: 1,
          cardIds: remaining,
          sessionId: 'exact-review',
          region: 'all',
          limits: { cardLimit: 3, newLimit: 1 },
        },
      },
    },
    applied: { missionId: 'greeting', contentVersion: 2, runId: 'exact-reply' },
  };
  validateDailyPlanEnvelope({ schemaVersion: 1, current: value });
  return value;
}

test('old retained review wins over a fresh suggestion and counts only its remaining queue', () => {
  const stored = plan();
  const original = JSON.stringify(stored);
  Object.freeze(stored.review!.session.queue!.cardIds);
  Object.freeze(stored);
  const view = deriveHomePresentation(Object.freeze({ ...base, plan: stored, response }));
  expect(view).toMatchObject({
    kind: 'reviewResume',
    action: 'existingStart',
    remainingCards: 2,
    managePlanId: 'retained',
  });
  expect(view.phases).toEqual([
    { kind: 'review', current: true, finished: false, unavailable: false },
    { kind: 'reply', current: false, finished: false, unavailable: false },
  ]);
  expect(JSON.stringify(stored)).toBe(original);
});

test('a failed foreground read hides old plan assertions and retries only the read', () => {
  expect(
    deriveHomePresentation({ ...base, plan: plan(), readError: true, startError: true }),
  ).toEqual({
    kind: 'readError',
    action: 'retryRead',
    pending: false,
    startError: false,
    phases: [],
  });
  expect(deriveHomePresentation({ ...base, loaded: false }).kind).toBe('loading');
  expect(deriveHomePresentation({ ...base, ready: false }).action).toBe('none');
});

test('content ID and version both gate a retained reply without replacing its identity', () => {
  for (const available of [
    undefined,
    { id: 'other', contentVersion: 2 },
    { id: 'greeting', contentVersion: 3 },
  ]) {
    const result = deriveHomePresentation({ ...base, plan: plan('applied'), response: available });
    expect(result).toMatchObject({
      kind: 'unavailablePlan',
      action: 'existingStart',
      managePlanId: 'retained',
    });
    expect(result.phases[1]).toEqual({
      kind: 'reply',
      current: false,
      finished: false,
      unavailable: true,
    });
  }
  const result = deriveHomePresentation({ ...base, plan: plan('applied'), response });
  expect(result.kind).toBe('appliedResume');
  expect(result.phases[0].finished).toBe(true);
});

test('applied-only has no fictional completed review; missing production content is browse', () => {
  const stored = plan('applied');
  delete stored.review;
  validateDailyPlanEnvelope({ schemaVersion: 1, current: stored });
  expect(deriveHomePresentation({ ...base, plan: stored, response }).phases).toEqual([
    { kind: 'reply', current: true, finished: false, unavailable: false },
  ]);
  const noReview = { ...base, recommendation: undefined, recommendedDeck: undefined };
  expect(deriveHomePresentation({ ...noReview, response }).kind).toBe('appliedOnly');
  expect(deriveHomePresentation(noReview).kind).toBe('browse');
});

test('completion is based on injected local day; yesterday permits a fresh recommendation', () => {
  const stored = { ...plan('complete'), day: '2032-01-08' };
  expect(deriveHomePresentation({ ...base, plan: stored }).kind).toBe('completedToday');
  expect(deriveHomePresentation({ ...base, plan: { ...stored, day: '2032-01-07' } }).kind).toBe(
    'recommendation',
  );
});

test.each([
  [{ totalCards: 0, totalNew: 0, newAvailableToday: 0 }, 'empty'],
  [{ totalCards: 10, totalNew: 10, newAvailableToday: 0 }, 'cap'],
  [{ totalCards: 10, totalNew: 0, newAvailableToday: 0 }, 'noDue'],
])('browsing distinguishes actual unavailable workload: %j', (facts, reason) => {
  expect(deriveHomePresentation({ ...base, ...facts, recommendation: undefined })).toMatchObject({
    kind: 'browse',
    action: 'browse',
    reason,
  });
});

test('a stale or missing deck cannot advertise an actionable recommendation', () => {
  expect(deriveHomePresentation({ ...base, recommendedDeck: undefined }).kind).toBe('browse');
  expect(deriveHomePresentation({ ...base, recommendedDeck: { id: 'deleted' } }).kind).toBe(
    'browse',
  );
  const result = deriveHomePresentation({ ...base, starting: true, startError: true });
  expect(result).toMatchObject({ kind: 'recommendation', pending: true, startError: false });
});

test('a retained future reply is explicitly unavailable in a production review checkpoint', () => {
  const result = deriveHomePresentation({ ...base, plan: plan() });
  expect(result.kind).toBe('reviewResume');
  expect(result.phases[1].unavailable).toBe(true);
});

test('Home translation consumers have both languages and interpolate honest remaining/estimate labels', () => {
  const es = Object.keys(translations.es).filter((key) => key.startsWith('home.barrio.'));
  const en = Object.keys(translations.en).filter((key) => key.startsWith('home.barrio.'));
  expect(es.length).toBeGreaterThan(0);
  expect(en.sort()).toEqual(es.sort());
  expect(translate('en', 'home.barrio.remainingMany', { count: 2 })).toBe('2 cards remaining');
  expect(translate('es', 'home.barrio.reviewOne', { minutes: 1 })).toBe(
    '1 tarjeta · aprox. 1 min de repaso',
  );
  expect(translate('es', 'home.barrio.newOne')).toBe('Incluye 1 tarjeta nueva');
  expect(translate('en', 'home.barrio.unavailableAction')).toBe('Open saved plan');
  expect(translate('en', 'home.barrio.readErrorBody')).toBe(
    'Try loading your plan again before starting practice.',
  );
});
