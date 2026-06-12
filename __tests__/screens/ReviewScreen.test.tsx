import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import ReviewScreen from '../../src/screens/ReviewScreen';
import { Deck, FlashCard } from '../../src/types';
import { useDeck } from '../../src/hooks/useDeck';

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

const mockUseDeck = useDeck as jest.Mock;
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
    makeCard('parce', {
      front: 'parce',
      back: 'dude',
      example: 'Hola, parce. | Hi, dude.',
    }),
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function renderReviewScreen(overrides = {}) {
  const updateCardReview = jest.fn().mockResolvedValue(undefined);
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    updateCardReview,
    ...overrides,
  });

  const screen = render(<ReviewScreen />);
  return { ...screen, updateCardReview };
}

describe('ReviewScreen review queue', () => {
  it('saves inline edits as reviewed', async () => {
    const { getByPlaceholderText, getByText, updateCardReview } = renderReviewScreen();

    fireEvent.changeText(getByPlaceholderText('English translation'), 'buddy / friend');
    fireEvent.changeText(getByPlaceholderText('Example with English after |'), 'Hola, parce. | Hi, buddy.');

    await act(async () => {
      fireEvent.press(getByText('Save & Next'));
    });

    expect(updateCardReview).toHaveBeenCalledWith('parce', {
      back: 'buddy / friend',
      example: 'Hola, parce. | Hi, buddy.',
      flagged: false,
      reviewStatus: 'reviewed',
      reviewedAt: NOW,
    });
  });

  it('marks a card as needing a native check', async () => {
    const { getByText, updateCardReview } = renderReviewScreen();

    await act(async () => {
      fireEvent.press(getByText('Needs Native Check'));
    });

    expect(updateCardReview).toHaveBeenCalledWith('parce', {
      back: 'dude',
      example: 'Hola, parce. | Hi, dude.',
      flagged: true,
      reviewStatus: 'needs_native',
      reviewedAt: NOW,
    });
  });

  it('filters to cards missing an English example', async () => {
    const missingExampleDeck: Deck = {
      ...DECK,
      cards: [
        makeCard('needs-example', {
          front: 'listo',
          back: 'ready',
          example: 'Listo.',
        }),
        makeCard('complete-example', {
          front: 'chévere',
          back: 'cool',
          example: 'Qué chévere. | How cool.',
        }),
      ],
    };

    const { getByText, queryByText } = renderReviewScreen({ decks: [missingExampleDeck] });

    fireEvent.press(getByText('Missing Example EN'));

    await waitFor(() => expect(getByText('listo')).toBeTruthy());
    expect(queryByText('chévere')).toBeNull();
  });
});
