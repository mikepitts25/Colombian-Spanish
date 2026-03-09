import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BrowseScreen from '../../src/screens/BrowseScreen';
import { Deck, FlashCard } from '../../src/types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
  DeckProvider: ({ children }: any) => children,
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

import { useDeck } from '../../src/hooks/useDeck';
import * as Speech from 'expo-speech';

const mockUseDeck = useDeck as jest.Mock;
const mockSpeak = Speech.speak as jest.Mock;

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

function buildContext(overrides = {}) {
  return {
    ready: true,
    decks: [DECK_A, DECK_B],
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
    expect(getByText('Cargando…')).toBeTruthy();
  });
});

// ── Default rendering ──────────────────────────────────────────────────────────

describe('BrowseScreen default state', () => {
  it('renders without crashing', () => {
    expect(() => renderBrowseScreen()).not.toThrow();
  });

  it('renders the search input', () => {
    const { getByPlaceholderText } = renderBrowseScreen();
    expect(getByPlaceholderText('Search cards, phrases, translations...')).toBeTruthy();
  });

  it('shows cards from all decks (up to 80) with no search query', () => {
    const { getByText } = renderBrowseScreen();
    // Cards from both decks should be visible
    expect(getByText('hola')).toBeTruthy();
    expect(getByText('arepa')).toBeTruthy();
  });

  it('shows deck name alongside each card', () => {
    const { getAllByText } = renderBrowseScreen();
    expect(getAllByText('Saludos').length).toBeGreaterThan(0);
  });
});

// ── Search ────────────────────────────────────────────────────────────────────

describe('BrowseScreen search', () => {
  it('filters by front (Spanish word) match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(queryByText('hola')).toBeTruthy());
    expect(queryByText('arepa')).toBeNull();
  });

  it('filters by back (English) match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'goodbye');
    await waitFor(() => expect(queryByText('adiós')).toBeTruthy());
    expect(queryByText('hola')).toBeNull();
  });

  it('filters by tag match', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'slang');
    await waitFor(() => expect(queryByText('chimba')).toBeTruthy());
    expect(queryByText('hola')).toBeNull();
  });

  it('search is case-insensitive', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'HOLA');
    await waitFor(() => expect(queryByText('hola')).toBeTruthy());
  });

  it('shows all cards again when query is cleared', async () => {
    const { getByPlaceholderText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(queryByText('arepa')).toBeNull());
    fireEvent.changeText(input, '');
    await waitFor(() => expect(queryByText('arepa')).toBeTruthy());
  });

  it('shows a clear button when query is non-empty', async () => {
    const { getByPlaceholderText, getByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => expect(getByText('✕')).toBeTruthy());
  });

  it('clears the query when the clear button is pressed', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderBrowseScreen();
    const input = getByPlaceholderText('Search cards, phrases, translations...');
    fireEvent.changeText(input, 'hola');
    await waitFor(() => getByText('✕'));
    fireEvent.press(getByText('✕'));
    await waitFor(() => expect(queryByText('✕')).toBeNull());
  });
});

// ── Deck filter ───────────────────────────────────────────────────────────────

describe('BrowseScreen deck filter', () => {
  it('shows "All Decks" option in the filter', () => {
    const { getByText } = renderBrowseScreen();
    // The chip renders '📚 All Decks'
    expect(getByText(/All Decks/)).toBeTruthy();
  });

  it('renders deck names as filter options in the dropdown', async () => {
    const { getByText, getAllByText } = renderBrowseScreen();
    // Open the dropdown by pressing the chip
    const chip = getByText(/All Decks/);
    fireEvent.press(chip);
    await waitFor(() => {
      // Deck names should appear in the modal dropdown
      const saludosItems = getAllByText('Saludos');
      expect(saludosItems.length).toBeGreaterThan(0);
    });
  });
});

// ── Audio ─────────────────────────────────────────────────────────────────────

describe('BrowseScreen audio', () => {
  it('renders speak buttons for each card row', () => {
    const { getAllByText } = renderBrowseScreen();
    const speakButtons = getAllByText('🔊');
    expect(speakButtons.length).toBeGreaterThan(0);
  });

  it('calls Speech.speak with the card front text when 🔊 is pressed', async () => {
    const { getAllByText } = renderBrowseScreen();
    const speakButtons = getAllByText('🔊');
    // BrowseScreen's onPress calls e.stopPropagation() before speak; pass a mock event
    fireEvent(speakButtons[0], 'press', { stopPropagation: jest.fn() });
    await waitFor(() =>
      expect(mockSpeak).toHaveBeenCalledWith(
        'hola',
        expect.objectContaining({ language: 'es-CO' }),
      ),
    );
  });
});
