import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import DifficultWordsScreen from '../../src/screens/DifficultWordsScreen';
import { Deck, FlashCard } from '../../src/types';

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/storage/storage', () => ({
  incrementDailyProgress: jest.fn().mockResolvedValue({ count: 1, target: 10 }),
}));

import { useDeck } from '../../src/hooks/useDeck';
import { incrementDailyProgress } from '../../src/storage/storage';

const mockUseDeck = useDeck as jest.Mock;
const mockIncrementDailyProgress = incrementDailyProgress as jest.Mock;
const NOW = 1_700_000_000_000;

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: id,
    back: `translation-${id}`,
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const DECK: Deck = {
  id: 'deck-a',
  name: 'Slang',
  cards: [
    makeCard('parce', { ease: 2.0, reps: 2, due: NOW + 1000 }),
    makeCard('hola', { ease: 2.5, reps: 0, interval: 0, due: NOW }),
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    recordAnswer: jest.fn().mockResolvedValue(undefined),
  });
  mockIncrementDailyProgress.mockResolvedValue({ count: 1, target: 10 });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('DifficultWordsScreen', () => {
  it('renders difficult cards and excludes untouched cards', async () => {
    const { getByText, queryByText } = render(<DifficultWordsScreen />);

    await waitFor(() => expect(getByText('1 difficult word')).toBeTruthy());
    expect(getByText('parce')).toBeTruthy();
    expect(queryByText('hola')).toBeNull();
  });

  it('grades the current difficult card and increments daily progress', async () => {
    const recordAnswer = jest.fn().mockResolvedValue(undefined);
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK],
      recordAnswer,
    });

    const { getByText } = render(<DifficultWordsScreen />);
    await waitFor(() => getByText('Good'));

    await act(async () => {
      fireEvent.press(getByText('Good'));
    });

    expect(recordAnswer).toHaveBeenCalledWith('parce', 4);
    expect(mockIncrementDailyProgress).toHaveBeenCalledWith(1);
  });
});
