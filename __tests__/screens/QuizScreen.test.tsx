import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import QuizScreen from '../../src/screens/QuizScreen';
import { Deck, FlashCard } from '../../src/types';
import { SeenWord } from '../../src/storage/storage';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/storage/storage', () => ({
  getSeenWords: jest.fn(),
  getQuizHistory: jest.fn(),
  recordQuizResult: jest.fn(),
  incrementDailyProgress: jest.fn().mockResolvedValue({ count: 1, target: 10 }),
}));

import { useDeck } from '../../src/hooks/useDeck';
import { getSeenWords, getQuizHistory } from '../../src/storage/storage';

const mockUseDeck = useDeck as jest.Mock;
const mockGetSeenWords = getSeenWords as jest.Mock;
const mockGetQuizHistory = getQuizHistory as jest.Mock;
const NOW = 1_700_000_000_000;

function makeCard(index: number, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: `c${index}`,
    front: `front-c${index}`,
    back: `back-c${index}`,
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

function makeSeenWord(card: FlashCard): SeenWord {
  return {
    cardId: card.id,
    deckId: 'deck-a',
    front: card.front,
    back: card.back,
    spanish: card.front,
    english: card.back,
    lastSeen: NOW,
    correctCount: 1,
    incorrectCount: 0,
  };
}

const CARDS = Array.from({ length: 10 }, (_, index) => makeCard(index));
const DECK: Deck = {
  id: 'deck-a',
  name: 'General',
  cards: CARDS,
};

function renderQuiz(overrides = {}) {
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    recordAnswer: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });
  return render(<QuizScreen />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSeenWords.mockResolvedValue(CARDS.map(makeSeenWord));
  mockGetQuizHistory.mockResolvedValue([]);
});

describe('QuizScreen integration polish', () => {
  it('shows a study CTA when there are not enough seen words', async () => {
    mockGetSeenWords.mockResolvedValue(CARDS.slice(0, 2).map(makeSeenWord));

    const { getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Study 8 more words')).toBeTruthy());
    fireEvent.press(getByText('Study now'));
    expect(mockNavigate).toHaveBeenCalledWith('Study');
  });

  it('shows recent score history before starting a quiz', async () => {
    mockGetQuizHistory.mockResolvedValue([
      {
        id: 'quiz-1',
        createdAt: NOW,
        score: 7,
        total: 10,
        missedCardIds: ['c1'],
        region: 'all',
      },
    ]);

    const { getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Start Quiz')).toBeTruthy());
    expect(getByText('Recent scores')).toBeTruthy();
    expect(getByText('70%')).toBeTruthy();
  });

  it('starts a missed-card review from quiz history', async () => {
    mockGetQuizHistory.mockResolvedValue([
      {
        id: 'quiz-1',
        createdAt: NOW,
        score: 8,
        total: 10,
        missedCardIds: ['c3'],
        region: 'all',
      },
    ]);

    const { getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Review missed cards')).toBeTruthy());
    fireEvent.press(getByText('Review missed cards'));

    await waitFor(() => expect(getByText('front-c3')).toBeTruthy());
  });
});
