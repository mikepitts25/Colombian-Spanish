import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudyScreen from '../../src/screens/StudyScreen';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { getDailyProgress, getLastStudySession, loadDecks } from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { Deck, FlashCard } from '../../src/types';

let mockParams: Record<string, unknown> = {};
const defaultStorageWrite = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
let releaseHeldWrite: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: jest.fn(),
  useFocusEffect: (callback: any) => require('react').useEffect(callback, [callback]),
  useNavigation: () => ({
    navigate: jest.fn(),
    setParams: (patch: Record<string, unknown>) => Object.assign(mockParams, patch),
  }),
  useRoute: () => ({ params: mockParams }),
}));
jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [] }));

let current: ReturnType<typeof useDeckContext>;
function Probe() {
  const context = useDeckContext();
  React.useLayoutEffect(() => {
    current = context;
  }, [context]);
  return null;
}
function App() {
  return (
    <DeckProvider>
      <Probe />
      <StudyScreen />
    </DeckProvider>
  );
}
function card(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: `phrase ${id}`,
    back: `answer ${id}`,
    createdAt: 0,
    due: 0,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}
beforeEach(async () => {
  await AsyncStorage.clear();
  mockParams = { autoStartDeckId: 'alpha' };
});
afterEach(() => {
  releaseHeldWrite?.();
  releaseHeldWrite = undefined;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(defaultStorageWrite);
  jest.restoreAllMocks();
});

test.each([
  ['Otra vez', 1, 15 * 60 * 1000],
  ['Difícil', 2, 12 * 60 * 60 * 1000],
] as const)(
  '%s becomes due without refilling a saved in-progress queue',
  async (label, quality, delay) => {
    let now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const decks: Deck[] = [{ id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] }];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
    let screen = render(<App />);
    await screen.findByText('phrase first');
    await waitFor(() => expect(screen.getByText(label)).not.toBeDisabled());
    const initial = await getLastStudySession();
    expect(initial?.queue?.cardIds).toEqual(['first', 'second']);
    await act(async () => fireEvent.press(screen.getByText(label)));
    await screen.findByText('phrase second');
    const graded = (await loadDecks())[0].cards[0];
    expect(graded.due).toBe(now + delay);
    expect(current.getStudyBatch().map((c) => c.id)).toEqual(['second']);
    now += delay - 1;
    expect(current.getStudyBatch().map((c) => c.id)).toEqual(['second']);
    now += 1;
    expect(current.getStudyBatch().map((c) => c.id)).toEqual(['first', 'second']);
    expect(screen.getByText('1 restantes')).toBeTruthy();
    const events = await getLearningEvents();
    expect(events).toEqual([expect.objectContaining({ cardId: 'first', quality })]);
    screen.unmount();
    screen = render(<App />);
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('phrase second');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect((await getLastStudySession())?.queue).toEqual({
      ...initial?.queue,
      cardIds: ['second'],
    });
    expect(await getLearningEvents()).toEqual(events);
    expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
    await act(async () => fireEvent.press(screen.getByText('Bien')));
    await screen.findByText('Sesión terminada');
    expect((await getLastStudySession())?.queue?.cardIds).toEqual([]);
    expect((await loadDecks())[0].cards[0]).toEqual(graded);
    expect(await getDailyProgress()).toMatchObject({ count: 2, newCount: 2 });
    expect((await getLearningEvents()).map((e) => e.cardId)).toEqual(['first', 'second']);
  },
);

test('cross-deck new-card cap permits due reviews and later relearning without new credit', async () => {
  let now = Date.now();
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  const betaReview = card('beta-review', { reps: 3, interval: 4 });
  const betaNew = card('beta-new');
  const decks: Deck[] = [
    { id: 'alpha', name: 'Alpha', cards: [card('alpha-new')] },
    { id: 'beta', name: 'Beta', cards: [betaReview, betaNew] },
  ];
  await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 1 }));
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
  const screen = render(<App />);
  await screen.findByText('phrase alpha-new');
  await waitFor(() => expect(screen.getByText('Otra vez')).not.toBeDisabled());
  const alphaSession = (await getLastStudySession())?.queue?.sessionId;
  await act(async () => fireEvent.press(screen.getByText('Otra vez')));
  await screen.findByText('Sesión terminada');
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
  await act(async () => current.setActiveDeckId('beta'));
  await screen.findByText('phrase beta-review');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const betaSession = await getLastStudySession();
  expect(betaSession?.queue?.sessionId).not.toBe(alphaSession);
  expect(betaSession?.queue?.cardIds).toEqual(['beta-review']);
  expect(current.getStudyBatch().map((c) => c.id)).toEqual(['beta-review']);
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  await screen.findByText('Sesión terminada');
  expect(await getDailyProgress()).toMatchObject({ count: 2, newCount: 1 });
  expect((await loadDecks())[1].cards[1]).toEqual(betaNew);
  const betaAfter = (await loadDecks())[1];
  now += 15 * 60 * 1000;
  await act(async () => current.setActiveDeckId('alpha'));
  await screen.findByText('phrase alpha-new');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect((await getLastStudySession())?.queue?.sessionId).not.toBe(alphaSession);
  expect((await getLastStudySession())?.queue?.cardIds).toEqual(['alpha-new']);
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  await screen.findByText('Sesión terminada');
  expect(await getDailyProgress()).toMatchObject({ count: 3, newCount: 1 });
  expect((await loadDecks())[1]).toEqual(betaAfter);
  expect((await getLearningEvents()).map((e) => [e.cardId, e.quality])).toEqual([
    ['alpha-new', 1],
    ['beta-review', 4],
    ['alpha-new', 4],
  ]);
});

test('edits queued behind an in-flight grade preserve content and the frozen remaining queue', async () => {
  const untouched = card('unrelated', { reps: 3, interval: 5 });
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([
      { id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] },
      { id: 'beta', name: 'Beta', cards: [untouched] },
    ]),
  );
  let screen = render(<App />);
  await screen.findByText('phrase first');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const initial = await getLastStudySession();
  const write = AsyncStorage.setItem as jest.Mock;
  const originalWrite = write.getMockImplementation()!;
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  releaseHeldWrite = release;
  let intercept = true;
  write.mockImplementation(async (key: string, value: string) => {
    if (
      intercept &&
      key === 'SRS_WRITE_JOURNAL_V1' &&
      JSON.parse(value).entries.some(
        ([entryKey]: [string, string]) => entryKey === 'SRS_LEARNING_EVENTS_V1',
      )
    ) {
      intercept = false;
      entered();
      await held;
    }
    return originalWrite(key, value);
  });
  let edits!: Promise<unknown>;
  await act(async () => {
    fireEvent.press(screen.getByText('Bien'));
    await started;
    edits = Promise.all([
      current.renameDeck('alpha', 'Renamed during save'),
      current.updateCardReview('first', { back: 'corrected meaning', flagged: true }),
      current.addCardToDeck('alpha', {
        id: 'added-later',
        front: 'new phrase',
        back: 'new answer',
      }),
    ]);
    release();
    await edits;
  });
  await screen.findByText('phrase second');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const stored = await loadDecks();
  expect(stored[0]).toMatchObject({
    name: 'Renamed during save',
    cards: [
      { id: 'first', reps: 1, back: 'corrected meaning', flagged: true },
      { id: 'second', reps: 0 },
      { id: 'added-later', reps: 0 },
    ],
  });
  expect(current.decks).toEqual(stored);
  expect(stored[1].cards).toEqual([untouched]);
  const remaining = await getLastStudySession();
  expect(remaining?.queue).toEqual({ ...initial?.queue, cardIds: ['second'] });
  const events = await getLearningEvents();
  expect(events).toEqual([expect.objectContaining({ cardId: 'first', quality: 4 })]);
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
  screen.unmount();
  screen = render(<App />);
  fireEvent.press(await screen.findByText('Continuar'));
  await screen.findByText('phrase second');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
  expect(await loadDecks()).toEqual(stored);
  expect(await getLearningEvents()).toEqual(events);
});

test('an editor recovers an interrupted grade and UI retry acknowledges it without losing the edit', async () => {
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([{ id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] }]),
  );
  let screen = render(<App />);
  await screen.findByText('phrase first');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const initial = await getLastStudySession();
  const write = AsyncStorage.setItem as jest.Mock;
  const originalWrite = write.getMockImplementation()!;
  let interrupt = true;
  write.mockImplementation(async (key: string, value: string) => {
    if (interrupt && key === 'SRS_DECKS_V3') {
      interrupt = false;
      throw new Error('simulated interrupted grade apply');
    }
    return originalWrite(key, value);
  });
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  await screen.findByText('No se pudo guardar. Reintenta la misma respuesta antes de continuar.');
  const journal = JSON.parse((await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1'))!);
  const eventWrite = journal.entries.find(
    ([key]: [string, string]) => key === 'SRS_LEARNING_EVENTS_V1',
  );
  expect(JSON.parse(eventWrite[1]).events).toEqual([
    expect.objectContaining({ cardId: 'first', quality: 4 }),
  ]);
  await act(async () => current.updateCardReview('first', { back: 'correction after recovery' }));
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  const recovered = await loadDecks();
  expect(recovered[0].cards[0]).toMatchObject({ reps: 1, back: 'correction after recovery' });
  const events = await getLearningEvents();
  expect(events).toEqual([expect.objectContaining({ cardId: 'first', quality: 4 })]);
  const daily = await getDailyProgress();
  expect(daily).toMatchObject({ count: 1, newCount: 1 });
  const remaining = await getLastStudySession();
  expect(remaining?.queue).toEqual({ ...initial?.queue, cardIds: ['second'] });
  await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
  await screen.findByText('phrase second');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(current.decks).toEqual(recovered);
  expect(await loadDecks()).toEqual(recovered);
  expect(await getLearningEvents()).toEqual(events);
  expect(await getDailyProgress()).toEqual(daily);
  expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
  screen.unmount();
  screen = render(<App />);
  fireEvent.press(await screen.findByText('Continuar'));
  await screen.findByText('phrase second');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
  expect(await loadDecks()).toEqual(recovered);
  expect(await getLearningEvents()).toEqual(events);
  expect(await getDailyProgress()).toEqual(daily);
});

// These are provider-level mutations of an unrelated deck, not confirmations
// through the management screen. Keep native/UI destructive flows separate.
test.each([
  ['reset', 'held'],
  ['delete', 'held'],
  ['reset', 'interrupted'],
  ['delete', 'interrupted'],
] as const)(
  '%s of another deck during a %s grade preserves exactly-once progress',
  async (mutation, boundary) => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const betaCard = card('beta-review', {
      reps: 4,
      interval: 8,
      ease: 2.8,
      due: now + 86400000,
      favorite: true,
      flagged: true,
      reviewStatus: 'reviewed',
    });
    const gamma: Deck = { id: 'gamma', name: 'Untouched', cards: [card('gamma-new')] };
    const alpha: Deck = { id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] };
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([alpha, { id: 'beta', name: 'Beta', cards: [betaCard] }, gamma]),
    );
    let screen = render(<App />);
    await screen.findByText('phrase first');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const initial = await getLastStudySession();
    const write = AsyncStorage.setItem as jest.Mock;
    const originalWrite = write.getMockImplementation()!;
    let release!: () => void;
    let entered!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    releaseHeldWrite = release;
    let intercept = true;
    write.mockImplementation(async (key: string, value: string) => {
      if (
        intercept &&
        boundary === 'held' &&
        key === 'SRS_WRITE_JOURNAL_V1' &&
        JSON.parse(value).entries.some(
          ([entryKey]: [string, string]) => entryKey === 'SRS_LEARNING_EVENTS_V1',
        )
      ) {
        intercept = false;
        entered();
        await held;
      } else if (intercept && boundary === 'interrupted' && key === 'SRS_DECKS_V3') {
        intercept = false;
        throw new Error('simulated interrupted grade before unrelated mutation');
      }
      return originalWrite(key, value);
    });
    const mutate = () =>
      mutation === 'reset' ? current.resetDeckProgress('beta') : current.deleteDeck('beta');
    if (boundary === 'held') {
      await act(async () => {
        fireEvent.press(screen.getByText('Bien'));
        await started;
        const pendingMutation = mutate();
        release();
        await pendingMutation;
      });
    } else {
      await act(async () => fireEvent.press(screen.getByText('Bien')));
      await screen.findByText(
        'No se pudo guardar. Reintenta la misma respuesta antes de continuar.',
      );
      const journal = JSON.parse((await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1'))!);
      const entry = journal.entries.find(
        ([key]: [string, string]) => key === 'SRS_LEARNING_EVENTS_V1',
      );
      expect(JSON.parse(entry[1]).events).toEqual([
        expect.objectContaining({ cardId: 'first', quality: 4 }),
      ]);
      await act(async () => mutate());
      const recoveredDecks = await loadDecks();
      const recoveredEvents = await getLearningEvents();
      const recoveredDaily = await getDailyProgress();
      expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
      await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
      await screen.findByText('phrase second');
      expect(await loadDecks()).toEqual(recoveredDecks);
      expect(await getLearningEvents()).toEqual(recoveredEvents);
      expect(await getDailyProgress()).toEqual(recoveredDaily);
    }
    await screen.findByText('phrase second');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const stored = await loadDecks();
    expect(current.activeDeck?.id).toBe('alpha');
    expect(current.decks).toEqual(stored);
    expect(stored.find((d) => d.id === 'gamma')).toEqual(gamma);
    expect(stored.find((d) => d.id === 'alpha')).toEqual({
      ...alpha,
      cards: [expect.objectContaining({ id: 'first', reps: 1 }), alpha.cards[1]],
    });
    if (mutation === 'delete') {
      expect(stored.map((d) => d.id)).toEqual(['alpha', 'gamma']);
    } else {
      expect(stored.map((d) => d.id)).toEqual(['alpha', 'beta', 'gamma']);
      expect(stored[1]).toEqual({
        id: 'beta',
        name: 'Beta',
        cards: [
          {
            ...betaCard,
            due: now,
            reps: 0,
            interval: 0,
            ease: 2.5,
          },
        ],
      });
    }
    const remaining = await getLastStudySession();
    expect(remaining?.queue).toEqual({ ...initial?.queue, cardIds: ['second'] });
    const events = await getLearningEvents();
    expect(events).toEqual([expect.objectContaining({ cardId: 'first', quality: 4 })]);
    const daily = await getDailyProgress();
    expect(daily).toMatchObject({ count: 1, newCount: 1 });
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    screen.unmount();
    screen = render(<App />);
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('phrase second');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
    expect(await loadDecks()).toEqual(stored);
    expect(await getLearningEvents()).toEqual(events);
    expect(await getDailyProgress()).toEqual(daily);
  },
);
