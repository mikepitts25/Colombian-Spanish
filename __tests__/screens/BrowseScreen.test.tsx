import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BrowseScreen from '../../src/screens/BrowseScreen';
import { Deck, FlashCard } from '../../src/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

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

function buildContext(overrides = {}) {
  return {
    ready: true,
    decks: [DECK_A, DECK_B, DECK_PAISA],
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

  it('shows browse categories and trending words with no search query', () => {
    const { getByText } = renderBrowseScreen();
    expect(getByText('📂 Categorías')).toBeTruthy();
    expect(getByText('🔥 Palabras del Día')).toBeTruthy();
    expect(getByText('chimba')).toBeTruthy();
    expect(getByText('awesome • Saludos')).toBeTruthy();
  });

  it('shows category cards in browse mode', () => {
    const { getAllByText } = renderBrowseScreen();
    expect(getAllByText('Jerga Colombiana').length).toBeGreaterThan(0);
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

  it('filters search results by selected region', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderBrowseScreen();

    fireEvent.press(getByText('Paisa'));
    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'paisa');

    await waitFor(() => expect(queryByText('parce-paisa')).toBeTruthy());
    expect(queryByText('bandeja paisa')).toBeNull();
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

// ── Deck filter ───────────────────────────────────────────────────────────────

describe('BrowseScreen deck filter', () => {
  it('shows the active all filter chip', () => {
    const { getByText } = renderBrowseScreen();
    expect(getByText('Todos')).toBeTruthy();
  });

  it('filters search results with the slang chip', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderBrowseScreen();
    fireEvent.press(getByText('🇨🇴 Jerga'));
    fireEvent.changeText(getByPlaceholderText('Busca palabras, frases o decks...'), 'a');

    await waitFor(() => expect(queryByText('chimba')).toBeTruthy());
    expect(queryByText('arepa')).toBeNull();
  });
});

// ── Audio ─────────────────────────────────────────────────────────────────────

describe('BrowseScreen audio', () => {
  it('renders speak buttons for each card row', () => {
    const { getAllByText } = renderBrowseScreen();
    const speakButtons = getAllByText('🔊');
    expect(speakButtons.length).toBeGreaterThan(0);
  });

  it('calls speakCard with the row card when 🔊 is pressed', async () => {
    const { getAllByText } = renderBrowseScreen();
    const speakButtons = getAllByText('🔊');
    fireEvent(speakButtons[0], 'press', { stopPropagation: jest.fn() });
    await waitFor(() => expect(mockSpeakCard).toHaveBeenCalledWith(DECK_A.cards[2]));
  });
});
