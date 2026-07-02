import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BrowseScreen from '../../src/screens/BrowseScreen';
import { Deck, FlashCard } from '../../src/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
  DeckProvider: ({ children }: any) => children,
}));

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
}));

import { useDeck } from '../../src/hooks/useDeck';
import { speakCard } from '../../src/services/tts';

const mockUseDeck = useDeck as jest.Mock;
const mockSpeakCard = speakCard as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW = Date.now();

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: `frente-${id}`,
    back: `back-${id}`,
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const DECK_A: Deck = {
  id: 'deck-a',
  name: 'Saludos',
  cards: [
    makeCard('a1', { front: 'hola', back: 'hello', tags: ['greetings'] }),
    makeCard('a2', { front: 'adiós', back: 'goodbye', tags: ['greetings'] }),
    makeCard('a3', { front: 'chimba', back: 'awesome', tags: ['slang'] }),
  ],
};

const DECK_B: Deck = {
  id: 'deck-b',
  name: 'Comida',
  cards: [
    makeCard('b1', { front: 'arepa', back: 'cornmeal cake', tags: ['food'] }),
    makeCard('b2', { front: 'bandeja paisa', back: 'traditional dish', tags: ['food'] }),
  ],
};

const DECK_PAISA: Deck = {
  id: 'deck-paisa',
  name: 'Paisa Slang (Medellín)',
  cards: [
    makeCard('p1', { front: 'parce-paisa', back: 'paisa buddy', tags: ['paisa', 'Medellín'] }),
  ],
};

const DECK_TECH: Deck = {
  id: 'deck-tech',
  name: 'Tecnología',
  cards: [
    makeCard('t1', { front: 'celular', back: 'cell phone', tags: ['tech'] }),
  ],
};

const DECK_HEALTH: Deck = {
  id: 'deck-health',
  name: 'Salud',
  cards: [
    makeCard('h1', { front: 'cita médica', back: 'medical appointment', tags: ['health'] }),
  ],
};

const DECK_NUMBERS: Deck = {
  id: 'deck-numbers',
  name: 'Numbers',
  cards: [
    makeCard('n1', { front: 'quincena', back: 'paycheck every 15 days', tags: ['number'] }),
  ],
};

function buildContext(overrides = {}) {
  return {
    ready: true,
    decks: [DECK_A, DECK_B, DECK_PAISA, DECK_TECH, DECK_HEALTH, DECK_NUMBERS],
    setActiveDeckId: jest.fn(),
    ...overrides,
  };
}

function renderBrowseScreen(ctxOverrides = {}) {
  mockUseDeck.mockReturnValue(buildContext(ctxOverrides));
  return render(<BrowseScreen />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Loading state ──────────────────────────────────────────────────────────────

describe('BrowseScreen loading', () => {
  it('shows loading text when ready=false', () => {
    const { getByText } = renderBrowseScreen({ ready: false });
    expect(getByText('Cargando...')).toBeTruthy();
  });
});

// ── Default rendering ──────────────────────────────────────────────────────────

describe('BrowseScreen default state', () => {
  it('renders without crashing', () => {
    expect(() => renderBrowseScreen()).not.toThrow();
  });

  it('renders the search input', () => {
    const { getByPlaceholderText } = renderBrowseScreen();
    expect(getByPlaceholderText('Busca palabras, frases o decks...')).toBeTruthy();
  });

  it('shows browse categories without the old Words of the Day feed', () => {
    const { getByText, queryByText } = renderBrowseScreen();

    expect(getByText('📂 Categorías')).toBeTruthy();
    expect(queryByText('🔥 Palabras del Día')).toBeNull();
    expect(queryByText('awesome • Saludos')).toBeNull();
  });

  it('shows category cards in browse mode', () => {
    const { getByText } = renderBrowseScreen();

    expect(getByText('Jerga Colombiana')).toBeTruthy();
    expect(getByText('Comida & Bebida')).toBeTruthy();
    expect(getByText('Comunicación')).toBeTruthy();
    expect(getByText('Tecnología')).toBeTruthy();
    expect(getByText('Salud')).toBeTruthy();
    expect(getByText('Números & Tiempo')).toBeTruthy();
  });

  it('does not render the old filter controls', () => {
    const { queryByText } = renderBrowseScreen();

    expect(queryByText('⚙️ Filtros')).toBeNull();
    expect(queryByText('Todos')).toBeNull();
    expect(queryByText('🇨🇴 Jerga')).toBeNull();
    expect(queryByText('Paisa')).toBeNull();
  });
});

// ── Search ────────────────────────────────────────────────────────────────────

describe('BrowseScreen search', () => {
  it('filters by front (Spanish word) match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(queryByText('hola')).toBeTruthy());
    expect(queryByText('arepa')).toBeNull();
  });

  it('filters by back (English) match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'goodbye');
    await waitFor(() => expect(queryByText('adiós')).toBeTruthy());
    expect(queryByText('hola')).toBeNull();
  });

  it('filters by tag match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'slang');
    await waitFor(() => expect(queryByText('chimba')).toBeTruthy());
    expect(queryByText('hola')).toBeNull();
  });

  it('searches across all loaded cards without region or deck-type filters', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();

    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'paisa');

    await waitFor(() => expect(queryByText('parce-paisa')).toBeTruthy());
    expect(queryByText('bandeja paisa')).toBeTruthy();
  });

  it('searches by deck name', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();

    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'Tecnología');

    await waitFor(() => expect(queryByText('celular')).toBeTruthy());
    expect(queryByText('hola')).toBeNull();
  });

  it('search is case-insensitive', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'HOLA');
    await waitFor(() => expect(queryByText('hola')).toBeTruthy());
  });

  it('returns to browse mode when query is cleared', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(queryByText('1 resultado')).toBeTruthy());
    fireEvent.changeText(input, '');
    await waitFor(() => expect(queryByText('📂 Categorías')).toBeTruthy());
  });

  it('shows a clear button when query is non-empty', async () => {
    const { getByPlaceholderText, getByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(getByText('✕')).toBeTruthy());
  });

  it('clears the query when the clear button is pressed', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Busca palabras, frases o decks...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => getByText('✕'));
    fireEvent.press(getByText('✕'));
    await waitFor(() => expect(queryByText('✕')).toBeNull());
  });
});

// ── Categories ────────────────────────────────────────────────────────────────

describe('BrowseScreen categories', () => {
  it('activates the first matching category deck and navigates to Study', () => {
    const setActiveDeckId = jest.fn();
    const { getByText } = renderBrowseScreen({ setActiveDeckId });

    fireEvent.press(getByText('Tecnología'));

    expect(setActiveDeckId).toHaveBeenCalledWith('deck-tech');
    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });
});

// ── Audio ─────────────────────────────────────────────────────────────────────

describe('BrowseScreen audio', () => {
  it('renders speak buttons for search result rows', async () => {
    const { getAllByText, getByPlaceholderText } = renderBrowseScreen();

    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'chimba');

    await waitFor(() => expect(getAllByText('🔊').length).toBeGreaterThan(0));
  });

  it('calls speakCard with the row card when a search result 🔊 is pressed', async () => {
    const { getAllByText, getByPlaceholderText } = renderBrowseScreen();

    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'chimba');

    await waitFor(() => expect(getAllByText('🔊').length).toBeGreaterThan(0));
    fireEvent.press(getAllByText('🔊')[0]);

    expect(mockSpeakCard).toHaveBeenCalledWith(DECK_A.cards[2]);
  });
});
