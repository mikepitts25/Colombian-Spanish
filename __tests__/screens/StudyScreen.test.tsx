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
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteParams = undefined;
  mockGetDailyProgress.mockResolvedValue({ count: 3, target: 10 });
  mockIncrementDailyProgress.mockResolvedValue({ count: 4, target: 10 });
  mockGetLastStudySession.mockResolvedValue(undefined);
  mockSaveLastStudySession.mockResolvedValue({
    deckId: 'deck-greetings',
    cardId: 'c1',
    updatedAt: 1000,
  });
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
      expect(getByText('Empieza una categoría o busca una palabra para crear tu primera sesión.')).toBeTruthy();
    });
  });

  it('starts a session from a category card', async () => {
    const screen = renderStudyScreen();

    fireEvent.press(await screen.findByText('Comunicación'));

    await waitFor(() => expect(screen.getByText('hola')).toBeTruthy());
    expect(screen.setActiveDeckId).toHaveBeenCalledWith('deck-greetings');
    expect(mockSaveLastStudySession).toHaveBeenCalledWith({ deckId: 'deck-greetings' });
  });

  it('starts a session from a search result and activates the result deck', async () => {
    const screen = renderStudyScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Busca palabras, frases o decks...'), 'celular');
    fireEvent.press(await screen.findByText('celular'));

    await waitFor(() => expect(screen.getByText('cell phone')).toBeTruthy());
    expect(screen.setActiveDeckId).toHaveBeenCalledWith('deck-technology');
    expect(mockSaveLastStudySession).toHaveBeenCalledWith({
      deckId: 'deck-technology',
      cardId: 'tech-1',
    });
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
    expect(mockSaveLastStudySession).toHaveBeenCalledWith({
      deckId: 'deck-technology',
      cardId: 'tech-1',
    });
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
      getStudyBatch: jest.fn().mockReturnValue(MIXED_REGION_CARDS),
    });

    fireEvent.press(await screen.findByText('Comunicación'));
    await waitFor(() => expect(screen.getByText('general-card')).toBeTruthy());
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

    expect(screen.getByLabelText('Voltear tarjeta')).toBeTruthy();
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
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('pressing "Again" calls recordAnswer with quality 1', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Otra vez'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith('c1', 1);
  });

  it('pressing "Good" calls recordAnswer with quality 4', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith('c1', 4);
  });

  it('pressing "Easy" calls recordAnswer with quality 5', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Fácil'));
    });

    expect(screen.recordAnswer).toHaveBeenCalledWith('c1', 5);
  });

  it('calls incrementDailyProgress and saves resume state after grading', async () => {
    const screen = renderStudyScreen();

    await openCommunicationSession(screen);
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
    });

    expect(mockIncrementDailyProgress).toHaveBeenCalledWith(1);
    expect(mockSaveLastStudySession).toHaveBeenLastCalledWith({
      deckId: 'deck-greetings',
      cardId: 'c1',
    });
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
