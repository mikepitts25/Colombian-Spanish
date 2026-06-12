import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { Deck, FlashCard } from '../../src/types';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/storage/storage', () => ({
  getDailyProgress: jest.fn().mockResolvedValue({ count: 0, target: 10 }),
  getStudyStreak: jest.fn().mockResolvedValue(0),
}));

import { useDeck } from '../../src/hooks/useDeck';

const mockUseDeck = useDeck as jest.Mock;
const NOW = Date.now();

function makeCard(id: string): FlashCard {
  return {
    id,
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
  };
}

const DECK: Deck = {
  id: 'deck-greetings',
  name: 'Saludos',
  cards: [makeCard('c1')],
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
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    activeDeckId: DECK.id,
    activeDeck: DECK,
    setActiveDeckId: jest.fn(),
  });
});

describe('HomeScreen quick actions', () => {
  it('navigates to quiz, difficult words, phrasebook, and add-card flows', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    fireEvent.press(getByText('Quiz'));
    fireEvent.press(getByText('Difficult'));
    fireEvent.press(getByText('Phrasebook'));
    fireEvent.press(getByText('Add Card'));

    expect(mockNavigate).toHaveBeenCalledWith('Quiz');
    expect(mockNavigate).toHaveBeenCalledWith('DifficultWords');
    expect(mockNavigate).toHaveBeenCalledWith('Phrasebook');
    expect(mockNavigate).toHaveBeenCalledWith('AddCard');
  });

  it('does not show the manage-decks floating plus action', async () => {
    const { getByText, queryByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Quiz')).toBeTruthy());

    expect(queryByText('+')).toBeNull();
  });

  it('keeps full deck browsing out of Home and links to Browse instead', async () => {
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

    expect(mockNavigate).toHaveBeenCalledWith('Browse');
  });

  it('shows one primary study action for due cards', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => expect(getByText('Study due cards')).toBeTruthy());
  });
});
