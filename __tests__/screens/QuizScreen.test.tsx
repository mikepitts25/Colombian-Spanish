import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import QuizScreen from '../../src/screens/QuizScreen';
import { Deck, FlashCard } from '../../src/types';
import { SeenWord } from '../../src/storage/storage';

const mockNavigate = jest.fn();
let mockLanguage: 'es' | 'en' = 'en';

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
  recordStudySession: jest.fn().mockResolvedValue(1),
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
import { getSeenWords, getQuizHistory, recordQuizResult } from '../../src/storage/storage';

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

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockLanguage = 'en';
  mockGetSeenWords.mockResolvedValue(CARDS.map(makeSeenWord));
  mockGetQuizHistory.mockResolvedValue([]);
});

describe('QuizScreen integration polish', () => {
  it('shows a study CTA when no words have been studied', async () => {
    mockGetSeenWords.mockResolvedValue([]);

    const { getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Study 1 more word')).toBeTruthy());
    fireEvent.press(getByText('Study now'));
    expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Study' }, { pop: true });
  });

  it('renders quiz region filters without horizontal scrolling', async () => {
    mockGetSeenWords.mockResolvedValue(CARDS.slice(0, 2).map(makeSeenWord));

    const { UNSAFE_getAllByType, getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Start Quiz')).toBeTruthy());
    const horizontalScrollViews = UNSAFE_getAllByType(ScrollView).filter(
      (scrollView) => scrollView.props.horizontal,
    );
    expect(horizontalScrollViews).toHaveLength(0);
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

  it('renders locked quiz copy in Spanish when UI language is Spanish', async () => {
    mockLanguage = 'es';
    mockGetSeenWords.mockResolvedValue([]);

    const { getByText } = renderQuiz();

    await waitFor(() => expect(getByText('Estudia 1 palabra más')).toBeTruthy());
    expect(getByText('Empieza con una palabra')).toBeTruthy();
    expect(getByText('Estudiar ahora')).toBeTruthy();
  });
});

describe('recognition evidence', () => {
  async function start() {
    const recordAnswer = jest.fn().mockResolvedValue(undefined);
    const screen = renderQuiz({ recordAnswer });
    fireEvent.press(await screen.findByText('Start Quiz'));
    const prompt = screen.getByText(/^front-c/).props.children as string;
    return { screen, recordAnswer, correctAnswer: prompt.replace('front-', 'back-') };
  }

  it('records recognition without changing existing flashcard scheduling or double-counting taps', async () => {
    const original = JSON.stringify([DECK]);
    await AsyncStorage.setItem('SRS_DECKS_V3', original);
    const { screen, recordAnswer, correctAnswer } = await start();
    fireEvent.press(screen.getByText(correctAnswer));
    fireEvent.press(screen.getByText(correctAnswer));
    await waitFor(async () => expect(await getLearningEvents()).toHaveLength(1));
    expect(recordAnswer).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe(original);
    expect((await getLearningEvents())[0]).toMatchObject({
      modality: 'recognition',
      evidence: 'answer-checked',
      outcome: 'correct',
      hintsUsed: 0,
    });
    expect(await screen.findByText('Next question')).toBeTruthy();
    fireEvent.press(screen.getByText('Next question'));
    expect(screen.getByText('2 / 10')).toBeTruthy();
  });

  it('records incorrect recognition as incorrect instead of a failed flashcard review', async () => {
    const { screen, recordAnswer, correctAnswer } = await start();
    const wrong = screen
      .getAllByText(/^back-c/)
      .find((node) => node.props.children !== correctAnswer)!;
    fireEvent.press(wrong);
    await waitFor(async () => expect(await getLearningEvents()).toHaveLength(1));
    expect((await getLearningEvents())[0].outcome).toBe('incorrect');
    expect(recordAnswer).not.toHaveBeenCalled();
  });

  it('keeps an unsaved answer recoverable and retries the same observation', async () => {
    const { screen, correctAnswer } = await start();
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    fireEvent.press(screen.getByText(correctAnswer));
    expect(await screen.findByText('Try saving again')).toBeTruthy();
    expect(await getLearningEvents()).toEqual([]);
    expect(screen.queryByText('Next question')).toBeNull();
    fireEvent.press(screen.getByText('Try saving again'));
    expect(await screen.findByText('Next question')).toBeTruthy();
    expect(await getLearningEvents()).toHaveLength(1);
  });

  it('uses the current translation rather than stale seen-word text', async () => {
    mockGetSeenWords.mockResolvedValue(
      CARDS.map((card) => ({ ...makeSeenWord(card), english: 'old translation' })),
    );
    const { screen, correctAnswer } = await start();
    expect(screen.queryByText('old translation')).toBeNull();
    expect(screen.getByText(correctAnswer)).toBeTruthy();
  });
});

it('can retry completion without losing the score or creating another recognition attempt', async () => {
  mockGetQuizHistory.mockResolvedValue([
    { id: 'previous', score: 0, total: 1, createdAt: NOW, missedCardIds: ['c3'], region: 'all' },
  ]);
  (recordQuizResult as jest.Mock)
    .mockRejectedValueOnce(new Error('disk full'))
    .mockImplementationOnce(async (params) => [{ ...params, createdAt: NOW }]);
  const screen = renderQuiz();
  fireEvent.press(await screen.findByText('Review missed cards'));
  fireEvent.press(screen.getByText('back-c3'));
  fireEvent.press(await screen.findByText('See results'));
  fireEvent.press(await screen.findByText('Try saving again'));
  expect(await screen.findByText('Quiz Complete')).toBeTruthy();
  expect(await getLearningEvents()).toHaveLength(1);
  expect((recordQuizResult as jest.Mock).mock.calls).toHaveLength(2);
  const [first, retry] = (recordQuizResult as jest.Mock).mock.calls;
  expect(first[0].id).toEqual(expect.any(String));
  expect(retry[0]).toEqual(first[0]);
  expect(retry[0].score).toBe(1);
});

it('shows unique answer meanings even when many cards share one translation', async () => {
  const cards = CARDS.map((card, index) => ({
    ...card,
    back: index === 0 ? 'meaning-b' : 'meaning-a',
  }));
  const screen = renderQuiz({ decks: [{ ...DECK, cards }] });
  fireEvent.press(await screen.findByText('Start Quiz'));
  expect(screen.getAllByText('meaning-a')).toHaveLength(1);
  expect(screen.getAllByText('meaning-b')).toHaveLength(1);
});

it('does not score a quiz with only one distinct answer meaning', async () => {
  const cards = CARDS.map((card) => ({ ...card, back: 'same meaning' }));
  const screen = renderQuiz({ decks: [{ ...DECK, cards }] });
  fireEvent.press(await screen.findByText('Start Quiz'));
  expect(
    await screen.findByText('Add more words with different meanings to start a quiz.'),
  ).toBeTruthy();
  expect(await getLearningEvents()).toEqual([]);
});

describe('early quiz practice', () => {
  it('finishes a one-word round and records only checked recognition', async () => {
    mockGetSeenWords.mockResolvedValue([makeSeenWord(CARDS[0])]);
    (recordQuizResult as jest.Mock).mockImplementation(async (params) => [
      { ...params, createdAt: NOW },
    ]);
    const recordAnswer = jest.fn();
    const screen = renderQuiz({ recordAnswer });
    expect(await screen.findByText('Up to 1 question in this round.')).toBeTruthy();
    fireEvent.press(screen.getByText('Start Quiz'));
    expect(screen.getByText('1 / 1')).toBeTruthy();
    fireEvent.press(screen.getByText('back-c0'));
    await screen.findByText('See results');
    const scroll = screen.getByTestId('quiz-question-scroll');
    fireEvent.press(within(scroll).getByText('See results'));
    expect(await screen.findByText('Quiz Complete')).toBeTruthy();
    expect(screen.getByText('Nice work recognizing these words.')).toBeTruthy();
    expect(recordQuizResult).toHaveBeenLastCalledWith(
      expect.objectContaining({ score: 1, total: 1, missedCardIds: [] }),
    );
    expect(await getLearningEvents()).toEqual([
      expect.objectContaining({
        cardId: 'c0',
        modality: 'recognition',
        evidence: 'answer-checked',
        outcome: 'correct',
      }),
    ]);
    expect(recordAnswer).not.toHaveBeenCalled();
  });

  it('builds a short round from only studied words, without repeating duplicate history IDs', async () => {
    mockGetSeenWords.mockResolvedValue([
      makeSeenWord(CARDS[0]),
      makeSeenWord(CARDS[1]),
      makeSeenWord(CARDS[0]),
    ]);
    const screen = renderQuiz();
    fireEvent.press(await screen.findByText('Start Quiz'));
    expect(screen.getByText('1 / 2')).toBeTruthy();
    const first = screen.getByText(/^front-c/).props.children as string;
    expect(['front-c0', 'front-c1']).toContain(first);
    fireEvent.press(screen.getByText(first.replace('front-', 'back-')));
    fireEvent.press(await screen.findByText('Next question'));
    expect(screen.getByText('2 / 2')).toBeTruthy();
    const second = screen.getByText(/^front-c/).props.children as string;
    expect(second).not.toBe(first);
    expect(['front-c0', 'front-c1']).toContain(second);
  });

  it('supports a single studied word in a region and an empty-region fallback', async () => {
    const cards = [makeCard(0, { tags: ['paisa'] }), makeCard(1)];
    mockGetSeenWords.mockResolvedValue(cards.map(makeSeenWord));
    const screen = renderQuiz({ decks: [{ ...DECK, cards }] });
    await screen.findByText('Start Quiz');
    fireEvent.press(screen.getByText('Rolo'));
    expect(await screen.findByText('Study now')).toBeTruthy();
    fireEvent.press(screen.getByText('Paisa'));
    fireEvent.press(await screen.findByText('Start Quiz'));
    expect(screen.getByText('front-c0')).toBeTruthy();
    expect(screen.getByText('1 / 1')).toBeTruthy();
    expect(screen.getAllByText(/^back-c/)).toHaveLength(2);
  });

  it('still caps a larger studied pool at ten questions', async () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i));
    mockGetSeenWords.mockResolvedValue(cards.map(makeSeenWord));
    const screen = renderQuiz({ decks: [{ ...DECK, cards }] });
    fireEvent.press(await screen.findByText('Start Quiz'));
    expect(screen.getByText('1 / 10')).toBeTruthy();
  });
});
