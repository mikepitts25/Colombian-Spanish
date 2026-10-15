import '@testing-library/jest-native/extend-expect';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import StudyScreen from '../../src/screens/StudyScreen';
import { FlashCard, Deck } from '../../src/types';

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockRouteParams: Record<string, unknown> | undefined;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, setParams: mockSetParams }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
  DeckProvider: ({ children }: any) => children,
}));

jest.mock('../../src/storage/storage', () => ({
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
}));

import { useDeck } from '../../src/hooks/useDeck';
import {
  getDailyProgress,
  getLastStudySession,
  incrementDailyProgress,
  saveLastStudySession,
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

  it('shows the no-deck state when activeDeck is undefined', () => {
    const { getByText } = renderStudyScreen({
      activeDeck: undefined,
      activeDeckId: undefined,
      decks: [],
    });

    expect(getByText('Selecciona un deck')).toBeTruthy();
    expect(mockGetDailyProgress).not.toHaveBeenCalled();
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
  });
});

it('retries a failed grade with the same attempt identity and original quality', async () => {
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
    expect.objectContaining({ attemptId: expect.any(String), sessionId: expect.any(String) }),
  );
  await act(async () => fireEvent.press(retry));
  expect(recordAnswer.mock.calls[1]).toEqual(original);
  expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
  expect(await screen.findByText('adios')).toBeTruthy();
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
  await ui.findByText('Continuar sesión');
  fireEvent.press(ui.getByText('Continuar'));
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
