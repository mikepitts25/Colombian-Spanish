import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { Deck, FlashCard } from '../../src/types';

const mockNavigate = jest.fn();
let mockLanguage: 'es' | 'en' = 'en';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ count: 0, target: 10, newCount: 0 }),
  getStudyStreak: jest.fn().mockResolvedValue(0),
  getStreakState: jest.fn().mockResolvedValue({ streak: 0, freezes: 0 }),
}));

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
}));

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      language: mockLanguage,
      setLanguage: jest.fn(),
      toggleLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) =>
        translate(mockLanguage, key, values),
    }),
  };
});

import { useDeck } from '../../src/hooks/useDeck';
import { speakCard } from '../../src/services/tts';

const mockUseDeck = useDeck as jest.Mock;
const mockSpeakCard = speakCard as jest.Mock;
const NOW = Date.now();

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const DECK: Deck = {
  id: 'deck-greetings',
  name: 'Saludos',
  cards: [makeCard('c1')],
};

const SLANG_DECK: Deck = {
  id: 'deck-slang',
  name: 'Jerga Colombiana',
  cards: [
    makeCard('slang-1', { front: 'chimba', back: 'awesome', tags: ['slang'] }),
    makeCard('slang-2', { front: 'parce', back: 'buddy', tags: ['slang'] }),
  ],
};

const RESTED_DECK: Deck = {
  id: 'deck-rested',
  name: 'Rested deck',
  cards: [
    {
      ...makeCard('c2'),
      due: NOW + 1000 * 60 * 60 * 48,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLanguage = 'en';
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK, SLANG_DECK],
    activeDeckId: DECK.id,
    activeDeck: DECK,
    setActiveDeckId: jest.fn(),
  });
});

describe('HomeScreen quick actions', () => {
  it('navigates to quiz, difficult words, phrases, and add-card flows', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    fireEvent.press(getByText('Quiz'));
    fireEvent.press(getByText('Difficult'));
    fireEvent.press(getByText('Phrases'));
    fireEvent.press(getByText('Add Card'));

    expect(mockNavigate).toHaveBeenCalledWith('Quiz');
    expect(mockNavigate).toHaveBeenCalledWith('DifficultWords');
    expect(mockNavigate).toHaveBeenCalledWith('Phrases');
    expect(mockNavigate).toHaveBeenCalledWith('AddCard');
  });

  it('does not show the manage-decks floating plus action', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    expect(queryByText('+')).toBeNull();
  });

  it('keeps full deck browsing out of Home and links to Study instead', async () => {
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK, RESTED_DECK],
      activeDeckId: DECK.id,
      activeDeck: DECK,
      setActiveDeckId: jest.fn(),
    });

    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Browse all decks')).toBeTruthy());

    expect(queryByText('Todos los Decks')).toBeNull();
    expect(queryByText('Rested deck')).toBeNull();

    fireEvent.press(getByText('Browse all decks'));

    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });

  it('shows one primary study action for due cards', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());
  });

  it('does not render the standalone summary stats strip', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());

    expect(queryByText('mastered')).toBeNull();
    expect(queryByText('decks')).toBeNull();
  });

  it('renders key Home labels in Spanish when UI language is Spanish', async () => {
    mockLanguage = 'es';

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Estudiar tarjetas pendientes')).toBeTruthy());
    expect(getByText('Herramientas')).toBeTruthy();
    expect(getByText('Decks pendientes')).toBeTruthy();
    expect(getByText('Ver todos los decks')).toBeTruthy();
  });

  it('renders exactly one Word of the Day card from slang content', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    // The pick is date-seeded, so exactly one of the slang cards is shown.
    const showsChimba = queryByText('chimba') !== null;
    const showsParce = queryByText('parce') !== null;
    expect(showsChimba !== showsParce).toBe(true);
  });

  it('is stable across re-renders on the same day', async () => {
    const first = render(<HomeScreen />);
    await waitFor(() => expect(first.getByText('Word of the Day')).toBeTruthy());
    const firstShowsChimba = first.queryByText('chimba') !== null;
    first.unmount();

    const second = render(<HomeScreen />);
    await waitFor(() => expect(second.getByText('Word of the Day')).toBeTruthy());
    expect(second.queryByText('chimba') !== null).toBe(firstShowsChimba);
  });

  it('falls back to general content when no slang content exists', async () => {
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK],
      activeDeckId: DECK.id,
      activeDeck: DECK,
      setActiveDeckId: jest.fn(),
    });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    expect(getByText('hola')).toBeTruthy();
  });

  it('plays the Word of the Day audio', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Word of the Day')).toBeTruthy());

    fireEvent.press(getByText('🔊'));

    expect(mockSpeakCard).toHaveBeenCalledTimes(1);
    const spoken = mockSpeakCard.mock.calls[0][0];
    expect(SLANG_DECK.cards.map((c) => c.id)).toContain(spoken.id);
  });
});
