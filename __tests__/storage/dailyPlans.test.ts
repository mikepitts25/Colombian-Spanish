import AsyncStorage from '@react-native-async-storage/async-storage';
import { readDailyPlan, startDailyPlan } from '../../src/storage/dailyPlans';
import { DailyPlan, validateDailyPlanEnvelope } from '../../src/storage/dailyPlanSchema';
import { commitFlashcardAnswer } from '../../src/storage/flashcardAnswer';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
import { getDailyProgress, loadDecks } from '../../src/storage/storage';

const key = 'SRS_DAILY_PLAN_V1';
const at = Date.now();
const applied = { missionId: 'authored-response', contentVersion: 1, runId: 'applied-run' };
const plan = (): DailyPlan => ({
  id: 'plan-one',
  day: '2026-10-17',
  minutes: 3,
  createdAt: at,
  phase: 'review',
  applied,
  review: {
    initialCardIds: ['c1', 'c2'],
    session: {
      deckId: 'd',
      cardId: 'c1',
      updatedAt: at,
      queue: {
        schemaVersion: 1,
        cardIds: ['c1', 'c2'],
        region: 'all',
        sessionId: 'review-run',
        limits: { cardLimit: 2, newLimit: 1 },
      },
    },
  },
});
const deck = {
  id: 'd',
  name: 'Test',
  cards: ['c1', 'c2'].map((id) => ({
    id,
    front: id,
    back: id,
    createdAt: 0,
    due: 0,
    reps: 2,
    interval: 1,
    ease: 2.5,
  })),
};
const grade = (p: DailyPlan, cardId = 'c1', ids = ['c2']) => ({
  attemptId: `grade-${cardId}`,
  sessionId: 'review-run',
  planId: p.id,
  cardId,
  quality: 4 as const,
  nextSession: {
    deckId: 'd',
    ...(ids[0] ? { cardId: ids[0] } : {}),
    queue: {
      ...p.review!.session.queue!,
      limits: { ...p.review!.session.queue!.limits! },
      cardIds: ids,
    },
  },
});
const originalSet = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
beforeEach(async () => {
  (AsyncStorage.setItem as jest.Mock).mockImplementation(originalSet);
  await AsyncStorage.clear();
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([deck]));
});

test('missing state stays empty; malformed state is retained and surfaced', async () => {
  expect(await readDailyPlan()).toBeUndefined();
  expect(await AsyncStorage.getItem(key)).toBeNull();
  await AsyncStorage.setItem(key, '{broken');
  await expect(readDailyPlan()).rejects.toThrow();
  expect(await AsyncStorage.getItem(key)).toBe('{broken');
});
test('validates exact queue/phase/identity instead of accepting ambiguous imported state', () => {
  expect(() => validateDailyPlanEnvelope({ schemaVersion: 1, current: plan() })).not.toThrow();
  for (const patch of [
    { id: '' },
    { day: '2026-02-30' },
    { minutes: 7 },
    { createdAt: NaN },
    { phase: 'applied' },
    { phase: 'complete' },
    { extra: true },
    { applied: { ...applied, contentVersion: 0 } },
    { review: undefined, applied: undefined },
  ])
    expect(() =>
      validateDailyPlanEnvelope({ schemaVersion: 1, current: { ...plan(), ...patch } }),
    ).toThrow();
  const invalid = plan();
  invalid.review!.initialCardIds = ['c1'];
  expect(() => validateDailyPlanEnvelope({ schemaVersion: 1, current: invalid })).toThrow();
});
test('competing starts cannot replace unfinished work and replay returns copied current state', async () => {
  const initial = plan();
  const result = await Promise.allSettled([
    startDailyPlan(initial),
    startDailyPlan({ ...plan(), id: 'other', day: '2026-10-18' }),
  ]);
  expect(result.map((v) => v.status)).toEqual(['fulfilled', 'rejected']);
  initial.review!.session.queue!.cardIds.length = 0;
  expect((await readDailyPlan())?.review?.session.queue?.cardIds).toEqual(['c1', 'c2']);
  await expect(startDailyPlan({ ...plan(), minutes: 5 })).rejects.toThrow('conflict');
});
test('copies a start while it waits behind another storage operation', async () => {
  const input = plan();
  const pending = startDailyPlan(input);
  input.review!.initialCardIds[0] = 'mutated';
  input.applied!.runId = 'mutated';
  expect((await pending).review?.initialCardIds).toEqual(['c1', 'c2']);
  expect((await readDailyPlan())?.applied?.runId).toBe('applied-run');
});
test('linked grades advance the exact remaining queue atomically and replay never restarts it', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  const first = grade(initial);
  await commitFlashcardAnswer(first);
  expect(await readDailyPlan()).toMatchObject({
    phase: 'review',
    review: { initialCardIds: ['c1', 'c2'], session: { cardId: 'c2', queue: { cardIds: ['c2'] } } },
  });
  expect((await startDailyPlan(initial)).review?.session.queue?.cardIds).toEqual(['c2']);
  await commitFlashcardAnswer(first);
  expect((await getDailyProgress()).count).toBe(1);
  expect((await getLearningEvents())[0]).toMatchObject({ planId: initial.id });
  await commitFlashcardAnswer(grade(initial, 'c2', []));
  expect(await readDailyPlan()).toMatchObject({
    phase: 'applied',
    review: { session: { queue: { cardIds: [] } } },
  });
});
test.each(['plan', 'card', 'session', 'region', 'limit', 'suffix'])(
  'rejects stale %s linkage before changing progress',
  async (field) => {
    const initial = plan();
    await startDailyPlan(initial);
    const input = grade(initial);
    if (field === 'plan') input.planId = 'other';
    if (field === 'card') input.cardId = 'c2';
    if (field === 'session') input.sessionId = 'other';
    if (field === 'region') input.nextSession.queue.region = 'paisa';
    if (field === 'limit') input.nextSession.queue.limits!.cardLimit = 3;
    if (field === 'suffix') input.nextSession.queue.cardIds = ['c1'];
    await expect(commitFlashcardAnswer(input)).rejects.toThrow();
    expect(await getLearningEvents()).toHaveLength(0);
    expect((await loadDecks())[0].cards[0].reps).toBe(2);
    expect(await readDailyPlan()).toEqual(initial);
  },
);
test('unlinked practice leaves the plan intact and cannot replay as a linked grade', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  const { planId: _, ...manual } = grade(initial);
  await commitFlashcardAnswer(manual);
  expect(await readDailyPlan()).toEqual(initial);
  await expect(commitFlashcardAnswer(grade(initial))).rejects.toThrow('conflict');
});
test('review-only completion permits a new plan but a retained old grade cannot advance it', async () => {
  const initial = plan();
  delete initial.applied;
  await startDailyPlan(initial);
  await commitFlashcardAnswer(grade(initial));
  await commitFlashcardAnswer(grade(initial, 'c2', []));
  expect((await readDailyPlan())?.phase).toBe('complete');
  const next = { ...plan(), id: 'next' };
  await startDailyPlan(next);
  await commitFlashcardAnswer(grade(initial));
  expect(await readDailyPlan()).toEqual(next);
});
test('recovers a partial plan/grade write exactly once after disk failure', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  let failed = false;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => {
    if (key === 'SRS_LEARNING_EVENTS_V1' && !failed) {
      failed = true;
      throw new Error('disk');
    }
    return originalSet(key, value);
  });
  await expect(commitFlashcardAnswer(grade(initial))).rejects.toThrow('disk');
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
  await commitFlashcardAnswer(grade(initial));
  expect((await readDailyPlan())?.review?.session.queue?.cardIds).toEqual(['c2']);
  expect((await getDailyProgress()).count).toBe(1);
  expect(await getLearningEvents()).toHaveLength(1);
});
test('backup roundtrip carries the exact plan; old full-state restore resets it and deck-only preserves it', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  const snapshot = parseBackupText(JSON.stringify(await captureBackupSnapshot()));
  expect(snapshot.applicationState?.dailyPlan).toEqual({ schemaVersion: 1, current: initial });
  await commitFlashcardAnswer(grade(initial));
  await restoreBackup(
    snapshot.decks,
    snapshot.learningEvents,
    'replace',
    snapshot.applicationState,
  );
  expect((await readDailyPlan())?.review?.session.cardId).toBe('c2');
  await restoreBackup(
    snapshot.decks,
    snapshot.learningEvents,
    'replace-state',
    snapshot.applicationState,
  );
  expect(await readDailyPlan()).toEqual(initial);
  const legacy = { ...snapshot.applicationState! };
  delete legacy.dailyPlan;
  await restoreBackup(snapshot.decks, snapshot.learningEvents, 'replace-state', legacy);
  expect(await readDailyPlan()).toBeUndefined();
  const broken = JSON.parse(JSON.stringify(snapshot));
  broken.applicationState.dailyPlan.current.phase = 'complete';
  expect(() => parseBackupText(JSON.stringify(broken))).toThrow();
});

test('does not grade a planned card moved to a different stored deck', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([
      { ...deck, cards: [deck.cards[1]] },
      { id: 'other', name: 'Other', cards: [deck.cards[0]] },
    ]),
  );
  await expect(commitFlashcardAnswer(grade(initial))).rejects.toThrow();
  expect(await getLearningEvents()).toHaveLength(0);
  expect((await readDailyPlan())?.review?.session.cardId).toBe('c1');
});

test('two different attempts for the same planned first card cannot double-grade it', async () => {
  const initial = plan();
  await startDailyPlan(initial);
  const input = grade(initial);
  const results = await Promise.allSettled([
    commitFlashcardAnswer(input),
    commitFlashcardAnswer({ ...input, attemptId: 'competing' }),
  ]);
  expect(results.map((v) => v.status)).toEqual(['fulfilled', 'rejected']);
  expect((await getDailyProgress()).count).toBe(1);
  expect(await getLearningEvents()).toHaveLength(1);
  expect((await readDailyPlan())?.review?.session.cardId).toBe('c2');
});
test('an applied-only start is durable without inventing a review queue', async () => {
  const input: DailyPlan = {
    id: 'applied-only',
    day: '2026-10-17',
    minutes: 3,
    createdAt: at,
    phase: 'applied',
    applied,
  };
  expect(await startDailyPlan(input)).toEqual(input);
  expect(await readDailyPlan()).toEqual(input);
  await expect(commitFlashcardAnswer({ ...grade(plan()), planId: input.id })).rejects.toThrow();
  expect(await getLearningEvents()).toHaveLength(0);
});
