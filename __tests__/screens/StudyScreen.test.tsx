import { renderWithTheme } from '../../testFixtures/renderWithTheme';
import ThemeIcon from '../../src/components/ThemeIcon';
import '@testing-library/jest-native/extend-expect';
import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import StudyScreen from '../../src/screens/StudyScreen';
import { FlashCard, Deck } from '../../src/types';

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockRouteParams: Record<string, unknown> | undefined;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) => require('react').useEffect(cb, [cb]),
  useNavigation: () => ({ navigate: mockNavigate, setParams: mockSetParams }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
  DeckProvider: ({ children }: any) => children,
}));

jest.mock('../../src/storage/storage', () => ({
  saveResumedStudySession: jest.fn((session) =>
    require('../../src/storage/storage').saveLastStudySession(session),
  ),
  getDailyProgress: jest.fn().mockResolvedValue({ count: 3, target: 10 }),
  incrementDailyProgress: jest.fn().mockResolvedValue({ count: 4, target: 10 }),
  getLastStudySession: jest.fn().mockResolvedValue(undefined),
  saveLastStudySession: jest.fn().mockResolvedValue({
    deckId: 'deck-greetings',
    cardId: 'c1',
    updatedAt: 1000,
  }),
}));

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
  stop: jest.fn(),
}));

import { useDeck } from '../../src/hooks/useDeck';
import {
  getDailyProgress,
  getLastStudySession,
  incrementDailyProgress,
  saveLastStudySession,
  saveResumedStudySession,
} from '../../src/storage/storage';

const mockUseDeck = useDeck as jest.Mock;
const mockGetDailyProgress = getDailyProgress as jest.Mock;
const mockIncrementDailyProgress = incrementDailyProgress as jest.Mock;
const mockGetLastStudySession = getLastStudySession as jest.Mock;
const mockSaveLastStudySession = saveLastStudySession as jest.Mock;

const NOW = Date.now();

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: `front-${id}`,
    back: `back-${id}`,
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const GREETING_CARDS = [
  makeCard('c1', { front: 'hola', back: 'hello', tags: ['greeting'] }),
  makeCard('c2', { front: 'adios', back: 'goodbye', tags: ['greeting'] }),
  makeCard('c3', { front: 'como vas', back: 'how is it going', tags: ['greeting'] }),
];

const MIXED_REGION_CARDS = [
  makeCard('general', { front: 'general-card', tags: ['greeting'] }),
  makeCard('paisa', { front: 'que hubo', tags: ['paisa', 'Medellin'] }),
];

const GREETINGS_DECK: Deck = {
  id: 'deck-greetings',
  name: 'Saludos',
  cards: GREETING_CARDS,
};

const TECH_DECK: Deck = {
  id: 'deck-technology',
  name: 'Tecnologia',
  cards: [makeCard('tech-1', { front: 'celular', back: 'cell phone', tags: ['tech'] })],
};

const FOOD_DECK: Deck = {
  id: 'deck-food',
  name: 'Comida',
  cards: [makeCard('food-1', { front: 'arepa', back: 'corn cake', tags: ['food'] })],
};

const DEFAULT_DECKS = [GREETINGS_DECK, TECH_DECK, FOOD_DECK];

function renderStudyScreen(ctxOverrides: Record<string, any> = {}) {
  let activeDeckId = ctxOverrides.activeDeckId ?? GREETINGS_DECK.id;
  const decks = ctxOverrides.decks ?? DEFAULT_DECKS;
  const setActiveDeckId = jest.fn((deckId: string) => {
    activeDeckId = deckId;
  });
  const recordAnswer = jest.fn().mockResolvedValue(undefined);
  const toggleFavorite = jest.fn().mockResolvedValue(undefined);
  const getStudyBatch = jest.fn((size?: number) => {
    if (ctxOverrides.getStudyBatch) return ctxOverrides.getStudyBatch(size);
    return decks.find((deck: Deck) => deck.id === activeDeckId)?.cards ?? [];
  });

  mockUseDeck.mockImplementation(() => {
    const computedActiveDeck = decks.find((deck: Deck) => deck.id === activeDeckId);

    return {
      ready: true,
      activeDeck: computedActiveDeck,
      activeDeckId,
      decks,
      getStudyBatch,
      recordAnswer,
      toggleFavorite,
      setActiveDeckId,
      createDeck: jest.fn(),
      deleteDeck: jest.fn(),
      renameDeck: jest.fn(),
      resetDeckProgress: jest.fn(),
      resetAllDecksProgress: jest.fn(),
      reload: jest.fn(),
      addCardToDeck: jest.fn(),
      ...ctxOverrides,
    };
  });

  return {
    ...render(<StudyScreen />),
    getStudyBatch,
    recordAnswer: ctxOverrides.recordAnswer ?? recordAnswer,
    setActiveDeckId: ctxOverrides.setActiveDeckId ?? setActiveDeckId,
    toggleFavorite: ctxOverrides.toggleFavorite ?? toggleFavorite,
  };
}

async function openCommunicationSession(screen: ReturnType<typeof renderStudyScreen>) {
  fireEvent.press(await screen.findByText('Comunicación'));
  await waitFor(() => expect(screen.getByText('hola')).toBeTruthy());
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteParams = undefined;
  mockGetDailyProgress.mockResolvedValue({ count: 3, target: 10 });
  mockIncrementDailyProgress.mockResolvedValue({ count: 4, target: 10 });
  mockGetLastStudySession.mockResolvedValue(undefined);
  mockSaveLastStudySession.mockImplementation(async (payload) => ({ ...payload, updatedAt: 1000 }));
});

describe('StudyScreen landing', () => {
  it('shows loading state when ready=false', () => {
    mockUseDeck.mockReturnValue({
      ready: false,
      activeDeck: undefined,
      activeDeckId: undefined,
      decks: [],
      getStudyBatch: jest.fn(),
      recordAnswer: jest.fn(),
      toggleFavorite: jest.fn(),
      setActiveDeckId: jest.fn(),
    });

    const { getByText } = render(<StudyScreen />);

    expect(getByText('Cargando...')).toBeTruthy();
    expect(mockGetDailyProgress).not.toHaveBeenCalled();
  });

  it('shows the no-deck state when activeDeck is undefined', async () => {
    let finishResume!: (value: undefined) => void;
    mockGetLastStudySession.mockReturnValueOnce(
      new Promise<undefined>((resolve) => {
        finishResume = resolve;
      }),
    );
    const { getByText } = renderStudyScreen({
      activeDeck: undefined,
      activeDeckId: undefined,
      decks: [],
    });

    expect(getByText('Selecciona un deck')).toBeTruthy();
    expect(mockGetDailyProgress).not.toHaveBeenCalled();
    await act(async () => finishResume(undefined));
  });

  it('opens on the Study landing with search, categories, and resume', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderStudyScreen();

    expect(getByText('Estudiar')).toBeTruthy();
    expect(getByPlaceholderText('Busca palabras, frases o decks...')).toBeTruthy();
    expect(getByText('📂 Categorías')).toBeTruthy();
    expect(getByText('Continuar sesión')).toBeTruthy();
    expect(queryByText('hola')).toBeNull();
    await waitFor(() => expect(mockGetLastStudySession).toHaveBeenCalled());
  });

  it('shows an empty resume message when no last session is stored', async () => {
    const { getByText } = renderStudyScreen();

    await waitFor(() => {
      expect(
        getByText('Empieza una categoría o busca una palabra para crear tu primera sesión.'),
      ).toBeTruthy();
    });
  });

  it('starts a session from a category card', async () => {
    const screen = renderStudyScreen();

    fireEvent.press(await screen.findByText('Comunicación'));

    await waitFor(() => expect(screen.getByText('hola')).toBeTruthy());
    expect(screen.setActiveDeckId).toHaveBeenCalledWith('deck-greetings');
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        deckId: 'deck-greetings',
        queue: expect.objectContaining({ cardIds: ['c1', 'c2', 'c3'] }),
      }),
    );
  });

  it('prevents study-page overscroll from pulling a card down during a swipe', async () => {
    const screen = renderStudyScreen();
    fireEvent.press(await screen.findByText('Comunicación'));
    await screen.findByText('hola');
    const scroll = screen.UNSAFE_getByType(ScrollView);
    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.directionalLockEnabled).toBe(true);
    expect(scroll.props.scrollEnabled).not.toBe(false);
  });

  it('starts a session from a search result and activates the result deck', async () => {
    const screen = renderStudyScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText('Busca palabras, frases o decks...'),
      'celular',
    );
    fireEvent.press(await screen.findByText('celular'));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Voltear tarjeta: celular/ })).toBeTruthy(),
    );
    expect(screen.queryByText('cell phone')).toBeNull();
    expect(screen.setActiveDeckId).toHaveBeenCalledWith('deck-technology');
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        deckId: 'deck-technology',
        cardId: 'tech-1',
      }),
    );
  });

  it('starts a session from the stored resume deck', async () => {
    mockGetLastStudySession.mockResolvedValue({
      deckId: 'deck-technology',
      cardId: 'tech-1',
      updatedAt: 1000,
    });
    const screen = renderStudyScreen();

    fireEvent.press(await screen.findByText('Continuar'));

    await waitFor(() => expect(screen.getByText('celular')).toBeTruthy());
    expect(screen.setActiveDeckId).toHaveBeenCalledWith('deck-technology');
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        deckId: 'deck-technology',
        cardId: 'tech-1',
      }),
    );
  });

  it('returns from a session to the Study landing', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    fireEvent.press(screen.getByText('Volver'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Busca palabras, frases o decks...')).toBeTruthy();
    });
  });
});

describe('StudyScreen session', () => {
  it('shows the caught-up state when the session batch is empty', async () => {
    const screen = renderStudyScreen({
      getStudyBatch: jest.fn().mockReturnValue([]),
    });

    fireEvent.press(await screen.findByText('Comunicación'));

    await waitFor(() => expect(screen.getByText('¡Bacano! Todo al día')).toBeTruthy());
    expect(screen.getByText('No hay más tarjetas por ahora. Vuelve mañana.')).toBeTruthy();
    await waitFor(() => expect(mockGetDailyProgress).toHaveBeenCalled());
  });

  it('shows a quiz CTA when there are no more cards to study', async () => {
    const screen = renderStudyScreen({
      getStudyBatch: jest.fn().mockReturnValue([]),
    });

    fireEvent.press(await screen.findByText('Comunicación'));
    fireEvent.press(await screen.findByText('Hacer quiz'));

    expect(mockNavigate).toHaveBeenCalledWith('Quiz');
  });

  it('renders the deck name in the session header', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('Greetings')).toBeTruthy();
  });

  it('renders remaining card count for a 3-card batch', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('3 restantes')).toBeTruthy();
  });

  it('filters the study batch by selected region', async () => {
    const screen = renderStudyScreen({
      activeDeck: { ...GREETINGS_DECK, cards: MIXED_REGION_CARDS },
      getStudyBatch: jest.fn().mockReturnValue(MIXED_REGION_CARDS),
    });

    fireEvent.press(await screen.findByText('Comunicación'));
    await waitFor(() => expect(screen.getByText('general-card')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    fireEvent.press(screen.getByText('Paisa'));

    await waitFor(() => expect(screen.getByText('que hubo')).toBeTruthy());
    expect(screen.queryByText('general-card')).toBeNull();
  });

  it('renders compact region filters with an overflow affordance', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByTestId('region-filter-scroll')).toBeTruthy();
    expect(screen.getByTestId('region-filter-overflow-cue')).toBeTruthy();
    expect(screen.getByText('Todo')).toBeTruthy();
    expect(screen.getByText('Paisa')).toBeTruthy();
    expect(screen.getByText('Valluno')).toBeTruthy();
  });

  it('uses clear tap-to-answer copy for the flashcard hint', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('Toca para ver respuesta')).toBeTruthy();
  });

  it('renders the flip-card touch target', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByRole('button', { name: /Voltear tarjeta: hola/ })).toBeTruthy();
  });

  it('grading buttons are visible in the grade bar', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('Otra vez')).toBeTruthy();
    expect(screen.getByText('Bien')).toBeTruthy();
    expect(screen.getByText('Fácil')).toBeTruthy();
  });

  it('keeps front and back text mounted for the flip animation', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('hola')).toBeTruthy();
    expect(screen.getByText('hello', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('hello')).toBeNull();
  });

  it('pressing "Again" calls recordAnswer with quality 1', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Otra vez'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith(
      'c1',
      1,
      expect.objectContaining({ attemptId: expect.any(String), sessionId: expect.any(String) }),
    );
  });

  it('pressing "Good" calls recordAnswer with quality 4', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith(
      'c1',
      4,
      expect.objectContaining({ attemptId: expect.any(String), sessionId: expect.any(String) }),
    );
  });

  it('pressing "Easy" calls recordAnswer with quality 5', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Fácil'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith(
      'c1',
      5,
      expect.objectContaining({ attemptId: expect.any(String), sessionId: expect.any(String) }),
    );
  });

  it('passes the next card into the grade transaction without a second counter write', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });

    expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
    expect(screen.recordAnswer).toHaveBeenCalledWith(
      'c1',
      4,
      expect.objectContaining({
        nextSession: expect.objectContaining({ deckId: 'deck-greetings', cardId: 'c2' }),
      }),
    );
  });

  it('advances to the next card after grading', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });

    await waitFor(() => expect(screen.getByText('2 restantes')).toBeTruthy());
  });

  it('shows star button for the current card', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);

    expect(screen.getByText('☆')).toBeTruthy();
  });

  it('toggleFavorite is called when star is pressed', async () => {
    const toggleFavorite = jest.fn().mockResolvedValue(undefined);
    const screen = renderStudyScreen({ toggleFavorite });

    await openCommunicationSession(screen);
    fireEvent.press(screen.getByText('☆'));

    expect(toggleFavorite).toHaveBeenCalledWith('c1');
  });
});

describe('StudyScreen queue stability', () => {
  it('does not skip the next card when grading changes the provider queue', async () => {
    let eligible = [...GREETING_CARDS];
    const context = {
      activeDeck: GREETINGS_DECK,
      getStudyBatch: jest.fn(() => eligible),
      recordAnswer: jest.fn(async (id: string) => {
        eligible = eligible.filter((card) => card.id !== id);
        context.activeDeck = {
          ...GREETINGS_DECK,
          cards: GREETING_CARDS.map((card) =>
            card.id === id ? { ...card, reps: 1, due: NOW + 86400000 } : card,
          ),
        };
      }),
    };
    const screen = renderStudyScreen(context);
    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });
    await waitFor(() => expect(screen.getByText('adios')).toBeTruthy());
    expect(screen.getByText('2 restantes')).toBeTruthy();
    expect(context.recordAnswer).toHaveBeenCalledWith(
      'c1',
      4,
      expect.objectContaining({
        nextSession: expect.objectContaining({ deckId: GREETINGS_DECK.id, cardId: 'c2' }),
      }),
    );
  });

  it('submits only once while a grade is still saving', async () => {
    let finish!: () => void;
    const recordAnswer = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const screen = renderStudyScreen({ recordAnswer });
    await openCommunicationSession(screen);
    fireEvent.press(screen.getByText('Bien'));
    fireEvent.press(screen.getByText('Fácil'));
    expect(recordAnswer).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
    });
    await waitFor(() => expect(screen.getByText('adios')).toBeTruthy());
    expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
  });

  it('does not save the just-graded card as resume when the batch ends', async () => {
    let eligible = [GREETING_CARDS[0]];
    const context = {
      activeDeck: GREETINGS_DECK,
      getStudyBatch: jest.fn(() => eligible),
      recordAnswer: jest.fn(async () => {
        eligible = [];
      }),
    };
    const screen = renderStudyScreen(context);
    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });
    await waitFor(() => expect(screen.getByText('Sesión terminada')).toBeTruthy());
    expect(context.recordAnswer).toHaveBeenCalledWith(
      'c1',
      4,
      expect.objectContaining({
        nextSession: expect.objectContaining({ queue: expect.objectContaining({ cardIds: [] }) }),
      }),
    );
  });
});

it('keeps the next card when the already selected region is tapped', async () => {
  const screen = renderStudyScreen();
  await openCommunicationSession(screen);
  await act(async () => {
    fireEvent.press(screen.getByText('Bien'));
  });
  await waitFor(() => expect(screen.getByText('adios')).toBeTruthy());
  fireEvent.press(screen.getByText('Todo'));
  expect(screen.getByText('adios')).toBeTruthy();
  expect(screen.getByText('2 restantes')).toBeTruthy();
});

it('opens the requested deck session directly from a Home handoff', async () => {
  mockRouteParams = { autoStartDeckId: GREETINGS_DECK.id };
  const screen = renderStudyScreen();
  expect(await screen.findByText('hola')).toBeTruthy();
  expect(screen.getByText('3 restantes')).toBeTruthy();
  expect(mockSetParams).toHaveBeenCalledWith({
    autoStartDeckId: undefined,
    sessionCardLimit: undefined,
    sessionNewLimit: undefined,
    sessionPreferredRegion: undefined,
  });
});

it('retries a failed grade with the same attempt identity and original quality', async () => {
  const readTime = jest.fn().mockReturnValue(12000);
  const timing = jest
    .spyOn(require('../../src/hooks/useActiveStudyTime'), 'useActiveStudyTime')
    .mockReturnValue(readTime);
  try {
    const recordAnswer = jest
      .fn()
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValue(undefined);
    const screen = renderStudyScreen({ recordAnswer });
    await openCommunicationSession(screen);
    await act(async () => fireEvent.press(screen.getByText('Bien')));
    const retry = await screen.findByText('Intentar guardar de nuevo');
    expect(screen.getByText('hola')).toBeTruthy();
    const original = recordAnswer.mock.calls[0];
    expect(original[2]).toEqual(
      expect.objectContaining({
        attemptId: expect.any(String),
        sessionId: expect.any(String),
        durationMs: 12000,
      }),
    );
    readTime.mockReturnValue(99000);
    await act(async () => fireEvent.press(retry));
    expect(recordAnswer.mock.calls[1]).toEqual(original);
    expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
    expect(await screen.findByText('adios')).toBeTruthy();
  } finally {
    timing.mockRestore();
  }
});

it('keeps the current session and region while a grade is unresolved', async () => {
  let finish!: () => void;
  const recordAnswer = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = renderStudyScreen({ recordAnswer });
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  fireEvent.press(screen.getByText('Paisa'));
  fireEvent.press(screen.getByText('Volver'));
  expect(screen.getByText('hola')).toBeTruthy();
  await act(async () => finish());
  expect(await screen.findByText('adios')).toBeTruthy();
  expect(recordAnswer).toHaveBeenCalledTimes(1);
});

it('resumes only the saved ordered queue and learning-session identity', async () => {
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'c3',
    updatedAt: 1000,
    queue: { schemaVersion: 1, cardIds: ['c3', 'c2'], region: 'all', sessionId: 'saved-session' },
  });
  const screen = renderStudyScreen();
  fireEvent.press(await screen.findByText('Continuar'));
  await waitFor(() => expect(screen.getByText('como vas')).toBeTruthy());
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(saveResumedStudySession).toHaveBeenCalledWith(
    expect.objectContaining({ deckId: 'deck-greetings' }),
    expect.objectContaining({ queue: expect.objectContaining({ cardIds: ['c3', 'c2'] }) }),
  );
  expect(screen.getByText('2 restantes')).toBeTruthy();
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(screen.recordAnswer).toHaveBeenCalledWith(
    'c3',
    4,
    expect.objectContaining({
      sessionId: 'saved-session',
      nextSession: expect.objectContaining({ queue: expect.objectContaining({ cardIds: ['c2'] }) }),
    }),
  );
  expect(screen.getByText('adios')).toBeTruthy();
  expect(screen.queryByText('hola')).toBeNull();
});
it('does not skip the current card when a previously graded card is deleted', async () => {
  const context = { activeDeck: GREETINGS_DECK };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(screen.getByText('adios')).toBeTruthy();
  context.activeDeck = { ...GREETINGS_DECK, cards: GREETING_CARDS.slice(1) };
  await act(async () => screen.rerender(<StudyScreen />));
  expect(screen.getByText('adios')).toBeTruthy();
});
it('requires the initial queue checkpoint to save and offers a retry before grading', async () => {
  mockSaveLastStudySession.mockRejectedValueOnce(new Error('disk full'));
  const screen = renderStudyScreen();
  fireEvent.press(await screen.findByText('Comunicación'));
  await screen.findByText('No se pudo guardar esta sesión. Reintenta antes de responder.');
  fireEvent.press(screen.getByText('Bien'));
  expect(screen.recordAnswer).not.toHaveBeenCalled();
  await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(screen.recordAnswer).toHaveBeenCalledTimes(1);
});
it('ends the bounded batch instead of silently starting another batch', async () => {
  const screen = renderStudyScreen({ getStudyBatch: () => [GREETING_CARDS[0]] });
  await openCommunicationSession(screen);
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(await screen.findByText('Sesión terminada')).toBeTruthy();
  expect(screen.queryByText('hola')).toBeNull();
});

it('drops missing and no-longer-eligible saved cards without filling the queue', async () => {
  const future = makeCard('future', { reps: 1, interval: 1, due: Date.now() + 86400000 });
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'gone',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['gone', 'future', 'c2'],
      region: 'all',
      sessionId: 'original',
    },
  });
  const screen = renderStudyScreen({
    activeDeck: { ...GREETINGS_DECK, cards: [...GREETING_CARDS, future] },
  });
  fireEvent.press(await screen.findByText('Continuar'));
  expect(await screen.findByText('adios')).toBeTruthy();
  expect(screen.getByText('1 restantes')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(mockSaveLastStudySession).toHaveBeenCalledWith(
    expect.objectContaining({
      cardId: 'c2',
      queue: expect.objectContaining({ cardIds: ['c2'], sessionId: 'original' }),
    }),
  );
});
it('restores the saved regional filter along with queue identity', async () => {
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'paisa',
    updatedAt: 1000,
    queue: { schemaVersion: 1, cardIds: ['paisa'], region: 'paisa', sessionId: 'regional-session' },
  });
  const screen = renderStudyScreen({
    activeDeck: { ...GREETINGS_DECK, cards: MIXED_REGION_CARDS },
    getStudyBatch: () => MIXED_REGION_CARDS,
  });
  fireEvent.press(await screen.findByText('Continuar'));
  expect(await screen.findByText('que hubo')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(mockSaveLastStudySession).toHaveBeenCalledWith(
    expect.objectContaining({
      queue: expect.objectContaining({ region: 'paisa', sessionId: 'regional-session' }),
    }),
  );
  expect(screen.queryByText('general-card')).toBeNull();
});
it('blocks grading until the initial checkpoint finishes', async () => {
  let finish!: () => void;
  mockSaveLastStudySession.mockImplementationOnce(
    (payload) =>
      new Promise((resolve) => {
        finish = () => resolve({ ...payload, updatedAt: 1000 });
      }),
  );
  const screen = renderStudyScreen();
  fireEvent.press(await screen.findByText('Comunicación'));
  await screen.findByText('hola');
  fireEvent.press(screen.getByText('Bien'));
  expect(screen.recordAnswer).not.toHaveBeenCalled();
  await act(async () => finish());
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(screen.recordAnswer).toHaveBeenCalledTimes(1);
});
it('offers retry when loading the saved session fails instead of implying no session exists', async () => {
  mockGetLastStudySession.mockRejectedValueOnce(new Error('read failed'));
  const screen = renderStudyScreen();
  expect(
    await screen.findByText('No se pudo cargar la sesión guardada. Reintenta para continuar.'),
  ).toBeTruthy();
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'c2',
    updatedAt: 1000,
    queue: { schemaVersion: 1, cardIds: ['c2'], region: 'all', sessionId: 'recovered' },
  });
  await act(async () => fireEvent.press(screen.getByText('Reintentar')));
  expect(await screen.findByText('Continuar')).toBeTruthy();
});
it('clears an earlier resume-load error after a new session checkpoint saves', async () => {
  mockGetLastStudySession.mockRejectedValueOnce(new Error('read failed'));
  const screen = renderStudyScreen();
  await screen.findByText('No se pudo cargar la sesión guardada. Reintenta para continuar.');
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Volver'));
  expect(await screen.findByText('Continuar')).toBeTruthy();
  expect(
    screen.queryByText('No se pudo cargar la sesión guardada. Reintenta para continuar.'),
  ).toBeNull();
});

test('Home bounded review freezes card and new-card limits into its checkpoint', async () => {
  const cards = [
    makeCard('due', { reps: 2, interval: 2 }),
    ...Array.from({ length: 8 }, (_, i) => makeCard(`new-${i}`)),
  ];
  mockRouteParams = { autoStartDeckId: GREETINGS_DECK.id, sessionCardLimit: 4, sessionNewLimit: 2 };
  const ui = renderStudyScreen({ decks: [{ ...GREETINGS_DECK, cards }] });
  await waitFor(() =>
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({ cardIds: ['due', 'new-0', 'new-1'] }),
      }),
    ),
  );
  expect(ui.getByText('3 restantes')).toBeTruthy();
});

test('invalid bounded-route limits use safe ordinary queue defaults', async () => {
  const cards = Array.from({ length: 20 }, (_, i) => makeCard(`card-${i}`));
  mockRouteParams = {
    autoStartDeckId: GREETINGS_DECK.id,
    sessionCardLimit: Infinity,
    sessionNewLimit: -1,
  };
  const ui = renderStudyScreen({ decks: [{ ...GREETINGS_DECK, cards }] });
  await waitFor(() => expect(ui.getByText('15 restantes')).toBeTruthy());
  await waitFor(() =>
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({ cardIds: cards.slice(0, 15).map((card) => card.id) }),
      }),
    ),
  );
});
test('saved bounded queue resumes its membership without fresh default filling', async () => {
  const cards = Array.from({ length: 10 }, (_, i) => makeCard(`saved-${i}`));
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'saved-1',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['saved-1', 'saved-2'],
      region: 'all',
      sessionId: 'bounded-old',
    },
  });
  const ui = renderStudyScreen({ decks: [{ ...GREETINGS_DECK, cards }] });
  fireEvent.press(await ui.findByText('Continuar'));
  await waitFor(() => expect(ui.getByText('2 restantes')).toBeTruthy());
  await waitFor(() =>
    expect(mockSaveLastStudySession).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({
          cardIds: ['saved-1', 'saved-2'],
          sessionId: 'bounded-old',
        }),
      }),
    ),
  );
});

test('resumed bounded review retains its limits when explicitly changing regions', async () => {
  const cards = Array.from({ length: 10 }, (_, i) =>
    makeCard(`bounded-${i}`, { regions: ['paisa'] }),
  );
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'bounded-0',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['bounded-0', 'bounded-1'],
      region: 'all',
      sessionId: 'bounded-resume',
      limits: { cardLimit: 4, newLimit: 2 },
    },
  });
  const ui = renderStudyScreen({ decks: [{ ...GREETINGS_DECK, cards }] });
  await ui.findByText('Continuar');
  fireEvent.press(ui.getByText('Continuar'));
  await waitFor(() => expect(ui.getByText('Bien')).not.toBeDisabled());
  fireEvent.press(ui.getByText('Paisa'));
  await waitFor(() =>
    expect(mockSaveLastStudySession).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queue: expect.objectContaining({
          region: 'paisa',
          cardIds: ['bounded-0', 'bounded-1'],
          limits: { cardLimit: 4, newLimit: 2 },
        }),
      }),
    ),
  );
});

test('an external deck switch keeps the new queue when an earlier grade finishes', async () => {
  let finish!: () => void;
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
    recordAnswer: jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
  };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  await act(async () => finish());
  expect(screen.getByText('celular')).toBeTruthy();
  expect(screen.getByText('1 restantes')).toBeTruthy();
  expect(mockSaveLastStudySession).toHaveBeenLastCalledWith(
    expect.objectContaining({ deckId: TECH_DECK.id, cardId: 'tech-1' }),
  );
});

test('a new deck checkpoint waits for an earlier grade before becoming resumable', async () => {
  let finish!: () => void;
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
    recordAnswer: jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
  };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  const original = mockSaveLastStudySession.mock.calls[0][0];
  fireEvent.press(screen.getByText('Bien'));
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  expect(mockSaveLastStudySession).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Bien')).toBeDisabled();
  await act(async () => finish());
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const latest = mockSaveLastStudySession.mock.calls.at(-1)[0];
  expect(latest.deckId).toBe(TECH_DECK.id);
  expect(latest.queue.cardIds).toEqual(['tech-1']);
  expect(latest.queue.sessionId).not.toBe(original.queue.sessionId);
});

test('leaving a waiting deck boundary cannot overwrite a later screen checkpoint', async () => {
  let finish!: () => void;
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
    recordAnswer: jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
  };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  screen.unmount();
  const laterCheckpoint = {
    deckId: FOOD_DECK.id,
    cardId: 'food-1',
    queue: {
      schemaVersion: 1 as const,
      cardIds: ['food-1'],
      region: 'all' as const,
      sessionId: 'later-screen',
    },
  };
  await saveLastStudySession(laterCheckpoint);
  await act(async () => finish());
  expect(mockSaveLastStudySession).toHaveBeenCalledTimes(2);
  expect(mockSaveLastStudySession).toHaveBeenLastCalledWith(laterCheckpoint);
});

test('a failed earlier grade cannot block or retry into a new deck', async () => {
  let fail!: (reason: Error) => void;
  const recordAnswer = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        }),
    )
    .mockResolvedValue(undefined);
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
    recordAnswer,
  };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  await act(async () => fail(new Error('old write failed')));
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(screen.queryByText('Intentar guardar de nuevo')).toBeNull();
  await act(async () => fireEvent.press(screen.getByText('Bien')));
  expect(recordAnswer.mock.calls[1][0]).toBe('tech-1');
  expect(recordAnswer.mock.calls[1][2].sessionId).not.toBe(recordAnswer.mock.calls[0][2].sessionId);
  expect(await screen.findByText('Sesión terminada')).toBeTruthy();
});

test('only the latest external deck checkpoint is written after a pending grade', async () => {
  let finish!: () => void;
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
    recordAnswer: jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
  };
  const screen = renderStudyScreen(context);
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  context.activeDeckId = FOOD_DECK.id;
  context.activeDeck = FOOD_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('arepa');
  expect(mockSaveLastStudySession).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  expect(mockSaveLastStudySession).toHaveBeenCalledTimes(2);
  expect(mockSaveLastStudySession).toHaveBeenLastCalledWith(
    expect.objectContaining({ deckId: FOOD_DECK.id, cardId: 'food-1' }),
  );
  expect(screen.getByText('arepa')).toBeTruthy();
});

test('an external deck change does not inherit a bounded queue or learning identity', async () => {
  mockGetLastStudySession.mockResolvedValue({
    deckId: GREETINGS_DECK.id,
    cardId: 'c1',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['c1'],
      region: 'all',
      sessionId: 'bounded-old',
      limits: { cardLimit: 1, newLimit: 1 },
    },
  });
  const context = {
    activeDeckId: GREETINGS_DECK.id,
    activeDeck: GREETINGS_DECK,
    getStudyBatch: jest.fn((): FlashCard[] => context.activeDeck.cards),
  };
  const screen = renderStudyScreen(context);
  fireEvent.press(await screen.findByText('Continuar'));
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  context.activeDeckId = TECH_DECK.id;
  context.activeDeck = TECH_DECK;
  screen.rerender(<StudyScreen />);
  await screen.findByText('celular');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const latest = mockSaveLastStudySession.mock.calls.at(-1)[0];
  expect(latest.deckId).toBe(TECH_DECK.id);
  expect(latest.queue.cardIds).toEqual(['tech-1']);
  expect(latest.queue.sessionId).not.toBe('bounded-old');
  expect(latest.queue.limits).toBeUndefined();
});

test('retains the landing search across live text-size changes without starting a session', async () => {
  const window = Dimensions.get('window');
  const screenMetrics = Dimensions.get('screen');
  const screen = renderStudyScreen();
  const input = await screen.findByPlaceholderText('Busca palabras, frases o decks...');
  fireEvent.changeText(input, 'hola');
  try {
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByDisplayValue('hola')).toBeTruthy();
    expect(screen.getByText('hola')).toBeTruthy();
    expect(mockSaveLastStudySession).not.toHaveBeenCalled();
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

test('region controls expose their selected state through a live text-size change', async () => {
  const window = Dimensions.get('window'),
    screenMetrics = Dimensions.get('screen');
  const screen = renderStudyScreen();
  await openCommunicationSession(screen);
  const writes = mockSaveLastStudySession.mock.calls.length;
  try {
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByRole('button', { name: 'Todo' })).toHaveAccessibilityState({
      selected: true,
      disabled: false,
    });
    expect(screen.getByRole('button', { name: 'Paisa' })).toHaveAccessibilityState({
      selected: false,
      disabled: false,
    });
    expect(screen.getByText('hola')).toBeTruthy();
    expect(mockSaveLastStudySession).toHaveBeenCalledTimes(writes);
    expect(screen.recordAnswer).not.toHaveBeenCalled();
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

test('live session resizing preserves a pending grade and prevents duplicate submissions', async () => {
  const window = Dimensions.get('window'),
    screenMetrics = Dimensions.get('screen');
  let finish!: () => void;
  const recordAnswer = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = renderStudyScreen({ recordAnswer });
  await openCommunicationSession(screen);
  fireEvent.press(screen.getByText('Bien'));
  try {
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    expect(screen.getByText('Bien')).toBeDisabled();
    fireEvent.press(screen.getByText('Bien'));
    expect(recordAnswer).toHaveBeenCalledTimes(1);
    expect(screen.getByText('hola')).toBeTruthy();
    await act(async () => finish());
    expect(await screen.findByText('adios')).toBeTruthy();
    expect(recordAnswer).toHaveBeenCalledTimes(1);
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

test('advancing after a saved grade returns the viewport to the next card only after success', async () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  let finish!: () => void;
  const recordAnswer = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = renderStudyScreen({ recordAnswer });
  try {
    await openCommunicationSession(screen);
    fireEvent(screen.getByTestId('study-card-area'), 'layout', {
      nativeEvent: { layout: { y: 620 } },
    });
    scrollTo.mockClear();
    fireEvent.press(screen.getByText('Bien'));
    expect(scrollTo).not.toHaveBeenCalled();
    await act(async () => finish());
    expect(await screen.findByText('adios')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ y: 620, animated: false });
  } finally {
    screen.unmount();
    scrollTo.mockRestore();
  }
});

test('passes the Home regional preference to initial selection and clears it for explicit filters', async () => {
  const getStudyBatch = jest.fn(() => GREETINGS_DECK.cards);
  mockRouteParams = {
    autoStartDeckId: GREETINGS_DECK.id,
    sessionCardLimit: 4,
    sessionNewLimit: 2,
    sessionPreferredRegion: 'paisa',
  };
  const screen = renderStudyScreen({ getStudyBatch });
  try {
    await screen.findByText('hola');
    await waitFor(() =>
      expect(getStudyBatch).toHaveBeenCalledWith(15, { preferredRegion: 'paisa' }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'General' }));
    await waitFor(() => expect(getStudyBatch).toHaveBeenLastCalledWith(100));
    expect(screen.recordAnswer).not.toHaveBeenCalled();
  } finally {
    screen.unmount();
  }
});

test('resumes the exact saved mixed-region queue even when current eligible suggestions differ', async () => {
  const other = makeCard('other', { front: 'rolo-saved', regions: ['rolo'] });
  const local = makeCard('local', { front: 'paisa-saved', regions: ['paisa'] });
  const changed = { ...GREETINGS_DECK, cards: [other, local, makeCard('additional')] };
  mockGetLastStudySession.mockResolvedValue({
    deckId: changed.id,
    cardId: 'other',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['other', 'local'],
      region: 'all',
      sessionId: 'saved-regional-plan',
      limits: { cardLimit: 4, newLimit: 2 },
    },
  });
  const screen = renderStudyScreen({
    decks: [changed],
    activeDeck: changed,
    getStudyBatch: () => [local],
  });
  try {
    fireEvent.press(await screen.findByText('Continuar'));
    expect(await screen.findByText('rolo-saved')).toBeTruthy();
    await waitFor(() =>
      expect(mockSaveLastStudySession).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.objectContaining({
            cardIds: ['other', 'local'],
            sessionId: 'saved-regional-plan',
            limits: { cardLimit: 4, newLimit: 2 },
          }),
        }),
      ),
    );
    expect(screen.recordAnswer).not.toHaveBeenCalled();
  } finally {
    screen.unmount();
  }
});

test('explicit All clears a Home new-card preference even when All is already selected', async () => {
  const getStudyBatch = jest.fn(() => GREETINGS_DECK.cards);
  mockRouteParams = {
    autoStartDeckId: GREETINGS_DECK.id,
    sessionPreferredRegion: 'paisa',
    sessionCardLimit: 4,
    sessionNewLimit: 2,
  };
  const screen = renderStudyScreen({ getStudyBatch });
  try {
    await screen.findByText('hola');
    await waitFor(() =>
      expect(getStudyBatch).toHaveBeenCalledWith(15, { preferredRegion: 'paisa' }),
    );
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    fireEvent.press(screen.getByRole('button', { name: 'Todo', selected: true }));
    await waitFor(() => expect(getStudyBatch).toHaveBeenLastCalledWith(15));
    expect(screen.recordAnswer).not.toHaveBeenCalled();
  } finally {
    screen.unmount();
  }
});

test('opens a saved daily plan exactly, links grades and offers the next phase', async () => {
  const session = {
    deckId: GREETINGS_DECK.id,
    cardId: 'c1',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['c1'],
      region: 'all',
      sessionId: 'planned-review',
      limits: { cardLimit: 2, newLimit: 1 },
    },
  };
  const read = jest
    .spyOn(require('../../src/storage/dailyPlans'), 'readDailyPlan')
    .mockResolvedValue({
      id: 'daily-one',
      phase: 'review',
      review: { initialCardIds: ['c1'], session },
      applied: { missionId: 'daily-morning-greeting', contentVersion: 1, runId: 'response' },
    });
  try {
    mockRouteParams = { dailyPlanId: 'daily-one' };
    const ui = renderStudyScreen({
      decks: [
        {
          ...GREETINGS_DECK,
          cards: GREETING_CARDS.map((card) =>
            card.id === 'c1' ? { ...card, due: Date.now() + 86400000, reps: 2, interval: 1 } : card,
          ),
        },
      ],
    });
    await waitFor(() => expect(ui.getByText('1 restantes')).toBeTruthy());
    await waitFor(() => expect(ui.getByText('Bien')).not.toBeDisabled());
    await act(async () => fireEvent.press(ui.getByText('Bien')));
    expect(ui.recordAnswer).toHaveBeenCalledWith(
      'c1',
      4,
      expect.objectContaining({
        planId: 'daily-one',
        sessionId: 'planned-review',
        nextSession: expect.objectContaining({ queue: expect.objectContaining({ cardIds: [] }) }),
      }),
    );
    fireEvent.press(await ui.findByText('Continuar mi plan'));
    expect(mockNavigate).toHaveBeenCalledWith('DailyPlan', { planId: 'daily-one' });
  } finally {
    read.mockRestore();
  }
});

test('detached manual checkpoints clear their old plan linkage before ordinary resume', async () => {
  const session = {
    deckId: GREETINGS_DECK.id,
    cardId: 'c1',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['c1', 'c2'],
      region: 'all',
      sessionId: 'planned',
      limits: { cardLimit: 2, newLimit: 2 },
    },
  };
  const read = jest
    .spyOn(require('../../src/storage/dailyPlans'), 'readDailyPlan')
    .mockResolvedValue({ id: 'plan', phase: 'review', review: { session } });
  try {
    mockRouteParams = { dailyPlanId: 'plan' };
    const ui = renderStudyScreen();
    await waitFor(() => expect(ui.getByText('Bien')).not.toBeDisabled());
    await act(async () => fireEvent.press(ui.getByText('Bien')));
    expect(ui.recordAnswer.mock.calls[0][2].planId).toBe('plan');
    fireEvent.press(ui.getByText('General'));
    await waitFor(() => expect(ui.getByText('Bien')).not.toBeDisabled());
    fireEvent.press(ui.getByText('Volver'));
    fireEvent.press(await ui.findByText('Continuar'));
    await waitFor(() => expect(ui.getByText('Bien')).not.toBeDisabled());
    await act(async () => fireEvent.press(ui.getByText('Bien')));
    expect(ui.recordAnswer.mock.calls[1][2].planId).toBeUndefined();
  } finally {
    read.mockRestore();
  }
});

test('a plan handoff retains a failed manual grade until its original retry settles', async () => {
  const session = {
    deckId: FOOD_DECK.id,
    cardId: 'food-1',
    updatedAt: 1000,
    queue: {
      schemaVersion: 1,
      cardIds: ['food-1'],
      region: 'all',
      sessionId: 'food-review',
      limits: { cardLimit: 1, newLimit: 1 },
    },
  };
  const read = jest
    .spyOn(require('../../src/storage/dailyPlans'), 'readDailyPlan')
    .mockResolvedValue({ id: 'food-plan', phase: 'review', review: { session } });
  try {
    const recordAnswer = jest
      .fn()
      .mockRejectedValueOnce(new Error('disk'))
      .mockResolvedValue(undefined);
    const ui = renderStudyScreen({ recordAnswer });
    await openCommunicationSession(ui);
    await act(async () => fireEvent.press(ui.getByText('Bien')));
    await ui.findByText('Intentar guardar de nuevo');
    const original = recordAnswer.mock.calls[0];
    mockRouteParams = { dailyPlanId: 'food-plan' };
    await act(async () => ui.rerender(<StudyScreen />));
    await ui.findByText('No se pudo abrir el plan guardado. Reintenta o gestiona el plan.');
    expect(ui.getByText('hola')).toBeTruthy();
    await act(async () => fireEvent.press(ui.getByText('Intentar guardar de nuevo')));
    expect(recordAnswer.mock.calls[1]).toEqual(original);
    expect(ui.setActiveDeckId).not.toHaveBeenCalledWith(FOOD_DECK.id);
  } finally {
    read.mockRestore();
  }
});

test('Barrio audio entry uses the common decorative icon while Classic retains its glyph', async () => {
  const initial = renderStudyScreen();
  initial.unmount();
  const screen = renderWithTheme(<StudyScreen />);
  fireEvent.changeText(
    await screen.findByPlaceholderText('Busca palabras, frases o decks...'),
    'hola',
  );
  screen.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(screen.UNSAFE_getAllByType(ThemeIcon).some((icon) => icon.props.name === 'audio')).toBe(
    true,
  );
  expect(screen.queryAllByText('🔊')).toHaveLength(0);
  fireEvent.press(screen.getAllByLabelText(/^Escuchar: /)[0]);
  expect(require('../../src/services/tts').speakCard).toHaveBeenCalledTimes(1);
  screen.applyTheme({ themeId: 'classic', appearanceMode: 'system' });
  expect(screen.getAllByText('🔊').length).toBeGreaterThan(0);
});
