import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudyScreen from '../../src/screens/StudyScreen';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { getDailyProgress, getLastStudySession, loadDecks } from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { restoreBackup } from '../../src/storage/backupRestore';
import { captureBackupSnapshot } from '../../src/storage/backupSnapshot';
import { localDayKey } from '../../src/utils/calendarDay';
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
let currentTheme: ReturnType<typeof useThemeSelection>;
function Probe() {
  const theme = useThemeSelection();
  React.useLayoutEffect(() => {
    currentTheme = theme;
  }, [theme]);
  const context = useDeckContext();
  React.useLayoutEffect(() => {
    current = context;
  }, [context]);
  return null;
}
function App() {
  return (
    <ThemeProvider>
      <DeckProvider>
        <Probe />
        <StudyScreen />
      </DeckProvider>
    </ThemeProvider>
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
    currentTheme.applySelection({ themeId: 'barrio', appearanceMode: 'light' });
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
  expect(screen.getByText('Bien')).toHaveStyle({ color: '#23624E' });
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
  act(() => currentTheme.applySelection({ themeId: 'barrio', appearanceMode: 'dark' }));
  expect(screen.getByText('Intentar guardar de nuevo')).toHaveStyle({ color: '#A7D6B2' });
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

test.each([
  [true, 'interrupted'],
  [false, 'interrupted'],
  [true, 'held'],
  [false, 'held'],
] as const)(
  'deleting the active deck leaves a safe Study boundary (fallback=%s, boundary=%s)',
  async (hasFallback, boundary) => {
    const beta: Deck = {
      id: 'beta',
      name: 'Beta',
      cards: [card('beta-first'), card('beta-second')],
    };
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([
        { id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] },
        ...(hasFallback ? [beta] : []),
      ]),
    );
    let screen = render(<App />);
    await screen.findByText('phrase first');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const alphaSession = (await getLastStudySession())?.queue?.sessionId;
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
    let interrupt = true;
    write.mockImplementation(async (key: string, value: string) => {
      if (
        interrupt &&
        boundary === 'held' &&
        key === 'SRS_WRITE_JOURNAL_V1' &&
        JSON.parse(value).entries.some(
          ([entryKey]: [string, string]) => entryKey === 'SRS_LEARNING_EVENTS_V1',
        )
      ) {
        interrupt = false;
        entered();
        await held;
      } else if (interrupt && boundary === 'interrupted' && key === 'SRS_DECKS_V3') {
        interrupt = false;
        throw new Error('simulated interrupted active-deck grade');
      }
      return originalWrite(key, value);
    });
    if (boundary === 'held') {
      await act(async () => {
        fireEvent.press(screen.getByText('Bien'));
        await started;
        const deleting = current.deleteDeck('alpha');
        release();
        await deleting;
      });
    } else {
      await act(async () => fireEvent.press(screen.getByText('Bien')));
      await screen.findByText(
        'No se pudo guardar. Reintenta la misma respuesta antes de continuar.',
      );
      const journal = JSON.parse((await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1'))!);
      const eventEntry = journal.entries.find(
        ([key]: [string, string]) => key === 'SRS_LEARNING_EVENTS_V1',
      );
      expect(JSON.parse(eventEntry[1]).events).toEqual([
        expect.objectContaining({ cardId: 'first', quality: 4, sessionId: alphaSession }),
      ]);
      await act(async () => current.deleteDeck('alpha'));
    }
    if (hasFallback) {
      await screen.findByText('phrase beta-first');
      await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    } else {
      await screen.findByText('Selecciona un deck');
    }
    expect(screen.queryByText('phrase first')).toBeNull();
    expect(screen.queryByText('phrase second')).toBeNull();
    expect(screen.queryByText('Intentar guardar de nuevo')).toBeNull();
    const stored = await loadDecks();
    expect(stored).toEqual(hasFallback ? [beta] : []);
    expect(current.decks).toEqual(stored);
    expect(current.activeDeck?.id).toBe(hasFallback ? 'beta' : undefined);
    const events = await getLearningEvents();
    expect(events).toEqual([
      expect.objectContaining({ cardId: 'first', quality: 4, sessionId: alphaSession }),
    ]);
    const daily = await getDailyProgress();
    expect(daily).toMatchObject({ count: 1, newCount: 1 });
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    const remaining = await getLastStudySession();
    if (hasFallback) {
      expect(remaining?.deckId).toBe('beta');
      expect(remaining?.queue?.sessionId).not.toBe(alphaSession);
      expect(remaining?.queue?.cardIds).toEqual(['beta-first', 'beta-second']);
    }
    screen.unmount();
    screen = render(<App />);
    if (hasFallback) {
      fireEvent.press(await screen.findByText('Continuar'));
      await screen.findByText('phrase beta-first');
      await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
      expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
    } else {
      await screen.findByText('Selecciona un deck');
      expect(screen.queryByText('Continuar')).toBeNull();
      expect(screen.queryByText('Bien')).toBeNull();
    }
    expect(screen.queryByText('phrase first')).toBeNull();
    expect(screen.queryByText('Intentar guardar de nuevo')).toBeNull();
    expect(await loadDecks()).toEqual(stored);
    expect(await getLearningEvents()).toEqual(events);
    expect(await getDailyProgress()).toEqual(daily);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  },
);

test.each(['reset', 'replace', 'merge-new'] as const)(
  'active-session %s after grade recovery survives original Retry and exact resume',
  async (mutation) => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const alpha: Deck = {
      id: 'alpha',
      name: 'Alpha',
      cards: [card('first'), card('second')],
    };
    const beta: Deck = {
      id: 'beta',
      name: 'Untouched',
      cards: [card('beta-review', { reps: 4, interval: 8 })],
    };
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([alpha, beta]));
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
        throw new Error('simulated grade apply before active reset/restore');
      }
      return originalWrite(key, value);
    });
    await act(async () => fireEvent.press(screen.getByText('Bien')));
    await screen.findByText('No se pudo guardar. Reintenta la misma respuesta antes de continuar.');
    const journal = JSON.parse((await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1'))!);
    const entry = journal.entries.find(
      ([key]: [string, string]) => key === 'SRS_LEARNING_EVENTS_V1',
    );
    expect(JSON.parse(entry[1]).events).toEqual([
      expect.objectContaining({
        cardId: 'first',
        quality: 4,
        sessionId: initial?.queue?.sessionId,
      }),
    ]);
    const deckEntry = journal.entries.find(([key]: [string, string]) => key === 'SRS_DECKS_V3');
    const gradedFirst = (JSON.parse(deckEntry[1]) as Deck[])[0].cards[0];
    expect(gradedFirst).toMatchObject({ id: 'first', reps: 1, back: 'answer first' });
    const replacement: Deck = {
      ...alpha,
      name: 'Restored Alpha',
      cards: [
        { ...alpha.cards[0], back: 'restored answer', reps: 3, interval: 6, due: now + 86400000 },
        alpha.cards[1],
        card('imported-later'),
      ],
    };
    await act(async () => {
      if (mutation === 'reset') await current.resetDeckProgress('alpha');
      else {
        await restoreBackup([replacement, beta], undefined, mutation);
        await current.reload();
      }
    });
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    const recovered = await loadDecks();
    expect(recovered[1]).toEqual(beta);
    if (mutation === 'replace') expect(recovered[0]).toEqual(replacement);
    else if (mutation === 'reset') {
      expect(recovered[0]).toEqual({
        ...alpha,
        cards: alpha.cards.map((c) => ({ ...c, due: now, reps: 0, interval: 0, ease: 2.5 })),
      });
    } else {
      expect(recovered[0]).toEqual({
        ...alpha,
        cards: [gradedFirst, alpha.cards[1], card('imported-later')],
      });
    }
    const events = await getLearningEvents();
    expect(events).toEqual([expect.objectContaining({ cardId: 'first', quality: 4 })]);
    const daily = await getDailyProgress();
    expect(daily).toMatchObject({ count: 1, newCount: 1 });
    const remaining = await getLastStudySession();
    expect(remaining?.queue).toEqual({ ...initial?.queue, cardIds: ['second'] });
    await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
    await screen.findByText('phrase second');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect(screen.queryByText('phrase imported-later')).toBeNull();
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
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect((await getLastStudySession())?.queue).toEqual(remaining?.queue);
    expect(await loadDecks()).toEqual(recovered);
    expect(await getLearningEvents()).toEqual(events);
    expect(await getDailyProgress()).toEqual(daily);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  },
);

test.each([
  ['held', 'removed'],
  ['interrupted', 'removed'],
  ['held', 'edited'],
  ['interrupted', 'edited'],
  ['held', 'moved'],
  ['interrupted', 'moved'],
] as const)(
  'full-state restore %s behind a grade with its card %s retains imported records through retry and restart',
  async (ordering, target) => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const beta: Deck = { id: 'beta', name: 'Unrelated Beta', cards: [card('beta-stable')] };
    const decks: Deck[] = [
      { id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] },
      beta,
    ];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
    let screen = render(<App />);
    await screen.findByText('phrase first');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const backup = await captureBackupSnapshot();
    const replacement = card('first', {
      front: 'restored prompt',
      back: 'restored correction',
      example: 'restored example',
      tags: ['restored'],
      flagged: true,
      reps: 7,
      interval: 18,
      ease: 2.1,
      due: now + 18 * 86400000,
    });
    const restoredDecks: Deck[] = [
      {
        ...decks[0],
        name: 'Restored Alpha',
        cards: [
          ...(target === 'edited' ? [replacement] : []),
          card('second'),
          card('restored-next'),
        ],
      },
      { ...beta, cards: [...beta.cards, ...(target === 'moved' ? [replacement] : [])] },
    ];
    const restoredSession = {
      deckId: 'alpha',
      cardId: 'restored-next',
      updatedAt: now - 1000,
      queue: {
        schemaVersion: 1 as const,
        cardIds: ['restored-next'],
        region: 'all',
        sessionId: 'restored-session',
      },
    };
    const restoredState = {
      ...backup.applicationState!,
      prefs: { uiLanguage: 'es', newCardsPerDay: 10, speechRate: 0.9 },
      daily: { date: localDayKey(new Date(now)), count: 7, target: 12, newCount: 3 },
      streak: { streak: 4, freezes: 1, lastStudyDate: new Date(now).toISOString() },
      seenWords: [],
      quizHistory: [],
      lastSession: restoredSession,
      notificationPrefs: { masterOn: false },
      missions: { schemaVersion: 1, runs: [] },
      dailyPlan: { schemaVersion: 1, current: null },
    };
    const write = AsyncStorage.setItem as jest.Mock;
    const originalWrite = write.getMockImplementation()!;
    let intercepted = false;
    write.mockImplementation(async (key: string, value: string) => {
      if (!intercepted && key === (ordering === 'held' ? 'SRS_WRITE_JOURNAL_V1' : 'SRS_DECKS_V3')) {
        intercepted = true;
        if (ordering === 'held')
          await new Promise<void>((resolve) => {
            releaseHeldWrite = resolve;
          });
        else throw new Error('simulated interrupted grade before full-state restore');
      }
      return originalWrite(key, value);
    });
    let restoring!: Promise<void>;
    if (ordering === 'held') {
      act(() => {
        fireEvent.press(screen.getByText('Bien'));
      });
      await waitFor(() => expect(intercepted).toBe(true));
    } else {
      await act(async () => fireEvent.press(screen.getByText('Bien')));
      await screen.findByText('Intentar guardar de nuevo');
    }
    await act(async () => {
      let restoreSettled = false;
      restoring = restoreBackup(restoredDecks, [], 'replace-state', restoredState).then(() => {
        restoreSettled = true;
      });
      if (ordering === 'held') {
        await Promise.resolve();
        expect(restoreSettled).toBe(false);
        expect(JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)).toEqual(decks);
      }
      releaseHeldWrite?.();
      releaseHeldWrite = undefined;
      await restoring;
      await current.reload();
    });
    const expectedRecords = {
      SRS_PREFS_V1: restoredState.prefs,
      SRS_DAILY_PROGRESS_V1: restoredState.daily,
      SRS_STUDY_STREAK_V1: restoredState.streak,
      SRS_SEEN_WORDS_V1: [],
      SRS_QUIZ_HISTORY_V1: [],
      SRS_LAST_STUDY_SESSION_V1: restoredSession,
      SRS_NOTIFICATION_PREFS_V1: restoredState.notificationPrefs,
      SRS_MISSIONS_V1: restoredState.missions,
      SRS_DAILY_PLAN_V1: restoredState.dailyPlan,
    };
    const assertRestored = async (resumed = false) => {
      expect(await loadDecks()).toEqual(restoredDecks);
      expect(current.decks).toEqual(restoredDecks);
      for (const [key, value] of Object.entries(expectedRecords))
        expect(JSON.parse((await AsyncStorage.getItem(key))!)).toEqual(
          resumed && key === 'SRS_LAST_STUDY_SESSION_V1'
            ? { ...restoredSession, updatedAt: now }
            : value,
        );
      expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    };
    await assertRestored();
    const events = await getLearningEvents();
    expect(events).toEqual([
      expect.objectContaining({
        cardId: 'first',
        deckId: 'alpha',
        quality: 4,
        modality: 'recall',
        evidence: 'self-rated',
        occurredAt: now,
      }),
    ]);
    // The retained event describes the pre-restore answer, even if that ID is
    // now edited or belongs to Beta. Retrying must not grade its replacement.
    if (ordering === 'interrupted') {
      await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
      await waitFor(() => expect(screen.queryByText('Intentar guardar de nuevo')).toBeNull());
      await screen.findByText('phrase second');
      await assertRestored();
      expect(await getLearningEvents()).toEqual(events);
    }
    screen.unmount();
    mockParams = {};
    screen = render(<App />);
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('phrase restored-next');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect(screen.queryByText('phrase first')).toBeNull();
    expect(screen.queryByText('phrase second')).toBeNull();
    await assertRestored(true);
    expect(await getLearningEvents()).toEqual(events);
  },
);

// Restore must win before the stale screen's grade is evaluated. These cases
// intentionally do not reload the provider until after the old UI submits.
test.each([
  ['removed', 'held'],
  ['removed', 'interrupted'],
  ['capped', 'held'],
  ['capped', 'interrupted'],
  ['edited', 'held'],
  ['edited', 'interrupted'],
  ['moved', 'held'],
  ['moved', 'interrupted'],
  ['replaced-deck', 'held'],
] as const)(
  'a %s card after a %s restore cannot earn stale Study credit',
  async (target, boundary) => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const originalDecks: Deck[] = [
      { id: 'alpha', name: 'Alpha', cards: [card('first'), card('second')] },
    ];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(originalDecks));
    let screen = render(<App />);
    await screen.findByText('phrase first');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const backup = await captureBackupSnapshot();
    const replacement = card('first', {
      front: 'restored prompt',
      back: 'restored answer',
      reps: 7,
      interval: 18,
      ease: 2.1,
      due: now + 18 * 86400000,
    });
    const restoredDeckId = target === 'replaced-deck' ? 'restored-alpha' : 'alpha';
    const restoredDecks: Deck[] = [
      {
        id: restoredDeckId,
        name: 'Restored Alpha',
        cards: [
          ...(target === 'capped' ? [card('first')] : []),
          ...(['edited', 'replaced-deck'].includes(target) ? [replacement] : []),
          card('restored-next'),
        ],
      },
      ...(target === 'moved' ? [{ id: 'beta', name: 'Restored Beta', cards: [replacement] }] : []),
    ];
    const restoredSession = {
      deckId: restoredDeckId,
      cardId: 'restored-next',
      updatedAt: now - 1000,
      queue: {
        schemaVersion: 1 as const,
        cardIds: ['restored-next'],
        region: 'all',
        sessionId: 'restore-before-grade-session',
      },
    };
    const restoredState = {
      ...backup.applicationState!,
      prefs: { uiLanguage: 'es', newCardsPerDay: 3, speechRate: 0.85 },
      daily: { date: localDayKey(new Date(now)), count: 7, target: 12, newCount: 3 },
      streak: { streak: 4, freezes: 1, lastStudyDate: new Date(now).toISOString() },
      seenWords: [],
      quizHistory: [],
      lastSession: restoredSession,
      notificationPrefs: { masterOn: false },
      missions: { schemaVersion: 1, runs: [] },
      dailyPlan: { schemaVersion: 1, current: null },
    };
    const write = AsyncStorage.setItem as jest.Mock;
    let intercepted = false;
    write.mockImplementation(async (key: string, value: string) => {
      if (!intercepted && key === (boundary === 'held' ? 'SRS_WRITE_JOURNAL_V1' : 'SRS_DECKS_V3')) {
        intercepted = true;
        if (boundary === 'held')
          await new Promise<void>((resolve) => {
            releaseHeldWrite = resolve;
          });
        else throw new Error('simulated interrupted restore before old Study submission');
      }
      return defaultStorageWrite(key, value);
    });
    let restoring!: Promise<void>;
    let restoreSettled = false;
    if (boundary === 'held') {
      restoring = restoreBackup(restoredDecks, [], 'replace-state', restoredState).then(() => {
        restoreSettled = true;
      });
      await waitFor(() => expect(intercepted).toBe(true));
      expect(restoreSettled).toBe(false);
      expect(JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)).toEqual(originalDecks);
    } else {
      await expect(
        restoreBackup(restoredDecks, [], 'replace-state', restoredState),
      ).rejects.toThrow('simulated interrupted restore');
      expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
      expect(JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)).toEqual(originalDecks);
    }
    expect(current.decks).toEqual(originalDecks);
    expect(screen.getByText('phrase first')).toBeTruthy();
    expect(screen.queryByText('restored prompt')).toBeNull();
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
      if (boundary === 'held') {
        await Promise.resolve();
        expect(restoreSettled).toBe(false);
        expect(JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)).toEqual(originalDecks);
        releaseHeldWrite!();
        releaseHeldWrite = undefined;
        await restoring;
      }
    });
    if (target === 'capped')
      await screen.findByText(
        'Alcanzaste el límite diario de tarjetas nuevas. Vuelve a los decks para repasar tarjetas estudiadas.',
      );
    else if (target === 'removed') await screen.findByText('phrase second');
    else
      await screen.findByText(
        'La tarjeta o la sesión cambió. Recarga las tarjetas antes de continuar.',
      );
    const assertRestored = async (resumed = false) => {
      const snapshot = await captureBackupSnapshot();
      expect(snapshot.learningEvents).toEqual([]);
      expect(snapshot.decks).toEqual(restoredDecks);
      expect(snapshot.applicationState).toEqual({
        ...restoredState,
        lastSession: resumed ? { ...restoredSession, updatedAt: now } : restoredSession,
      });
      expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    };
    await assertRestored();
    if (target === 'edited' || target === 'moved' || target === 'replaced-deck') {
      expect(screen.queryByText('Intentar guardar de nuevo')).toBeNull();
      if ((target === 'edited' || target === 'replaced-deck') && boundary === 'held') {
        const read = AsyncStorage.getItem as jest.Mock;
        const originalRead = read.getMockImplementation()!;
        let fail = true;
        read.mockImplementation(async (key: string) => {
          if (fail && key === 'SRS_PREFS_V1') {
            fail = false;
            throw new Error('reload read failed');
          }
          return originalRead(key);
        });
        try {
          await act(async () => {
            fireEvent.press(screen.getByText('Recargar tarjetas'));
          });
          await assertRestored();
          expect(screen.getByText('Recargar tarjetas')).not.toBeDisabled();
          expect(screen.getByText('Bien')).toBeDisabled();
        } finally {
          read.mockImplementation(originalRead);
        }
      }
      await act(async () => {
        fireEvent.press(screen.getByText('Recargar tarjetas'));
      });
      await screen.findByText('Continuar');
    } else await act(async () => current.reload());
    expect(current.decks).toEqual(restoredDecks);
    await assertRestored();
    screen.unmount();
    mockParams = {};
    screen = render(<App />);
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('phrase restored-next');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect(screen.queryByText('phrase first')).toBeNull();
    expect(screen.queryByText('phrase second')).toBeNull();
    await assertRestored(true);
  },
);
