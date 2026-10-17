import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
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

    await waitFor(() => expect(getByText('1 palabra difícil')).toBeTruthy());
    expect(getByText('parce')).toBeTruthy();
    expect(queryByText('hola')).toBeNull();
  });

  it('delegates grading and counting to one provider transaction', async () => {
    const recordAnswer = jest.fn().mockResolvedValue(undefined);
    mockUseDeck.mockReturnValue({
      ready: true,
      decks: [DECK],
      recordAnswer,
    });

    const { getByText } = render(<DifficultWordsScreen />);
    await waitFor(() => getByText('Bien'));

    await act(async () => {
      fireEvent.press(getByText('Bien'));
    });

    expect(recordAnswer).toHaveBeenCalledWith(
      'parce',
      4,
      expect.objectContaining({ attemptId: expect.any(String), sessionId: expect.any(String) }),
    );
    expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
  });
});

it('keeps one stable attempt through a failed save and retry', async () => {
  const recordAnswer = jest
    .fn()
    .mockRejectedValueOnce(new Error('disk full'))
    .mockResolvedValue(undefined);
  mockUseDeck.mockReturnValue({ ready: true, decks: [DECK], recordAnswer });
  const screen = render(<DifficultWordsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Bien')));
  const retry = await screen.findByText('Intentar guardar de nuevo');
  await act(async () => fireEvent.press(retry));
  expect(recordAnswer.mock.calls[1]).toEqual(recordAnswer.mock.calls[0]);
  expect(mockIncrementDailyProgress).not.toHaveBeenCalled();
});

it('does not skip the next difficult card when grading changes eligibility', async () => {
  const second = makeCard('second', { ease: 2.0, reps: 1, due: NOW + 2000 });
  const context = {
    ready: true,
    decks: [{ ...DECK, cards: [{ ...DECK.cards[0], due: NOW - 1000 }, second] }],
    recordAnswer: jest.fn(),
  };
  context.recordAnswer.mockImplementation(async (id: string) => {
    context.decks = [
      {
        ...DECK,
        cards: context.decks[0].cards.map((card) =>
          card.id === id
            ? { ...card, ease: 2.8, reps: 10, interval: 30, due: NOW + 86400000 }
            : card,
        ),
      },
    ];
  });
  mockUseDeck.mockImplementation(() => context);
  const screen = render(<DifficultWordsScreen />);
  await act(async () => fireEvent.press(await screen.findByText('Bien')));
  expect(await screen.findByText('second')).toBeTruthy();
});

it('keeps the current card and disables grading during a save across live resizing', async () => {
  const window = Dimensions.get('window'),
    metrics = Dimensions.get('screen');
  let finish!: () => void;
  const recordAnswer = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  mockUseDeck.mockReturnValue({ ready: true, decks: [DECK], recordAnswer });
  const screen = render(<DifficultWordsScreen />);
  try {
    fireEvent.press(await screen.findByText('Bien'));
    act(() =>
      Dimensions.set({ window: { ...window, fontScale: 3 }, screen: { ...metrics, fontScale: 3 } }),
    );
    expect(screen.getByRole('button', { name: /Bien/ })).toBeDisabled();
    fireEvent.press(screen.getByText('Bien'));
    expect(recordAnswer).toHaveBeenCalledTimes(1);
    expect(screen.getByText('parce')).toBeTruthy();
    await act(async () => finish());
    expect(await screen.findByText('No hay palabras difíciles')).toBeTruthy();
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: metrics }));
  }
});

it('reveals the next difficult card viewport only after a successful grade', async () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  let finish!: () => void;
  const recordAnswer = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const second = makeCard('second', { ease: 2.0, reps: 1, due: NOW + 2000 });
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [{ ...DECK, cards: [DECK.cards[0], second] }],
    recordAnswer,
  });
  const screen = render(<DifficultWordsScreen />);
  try {
    await screen.findByText('parce');
    fireEvent(screen.getByTestId('difficult-card-area'), 'layout', {
      nativeEvent: { layout: { y: 400 } },
    });
    scrollTo.mockClear();
    fireEvent.press(screen.getByText('Bien'));
    expect(scrollTo).not.toHaveBeenCalled();
    await act(async () => finish());
    expect(await screen.findByText('second')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ y: 400, animated: false });
  } finally {
    screen.unmount();
    scrollTo.mockRestore();
  }
});

it('shows scheduler intervals for the current difficult card rather than fixed estimates', async () => {
  const screen = render(<DifficultWordsScreen />);
  try {
    await screen.findByText('parce');
    expect(within(screen.getByRole('button', { name: /Otra vez/ })).getByText('15m')).toBeTruthy();
    expect(within(screen.getByRole('button', { name: /Difícil/ })).getByText('12h')).toBeTruthy();
    expect(within(screen.getByRole('button', { name: /Bien/ })).getByText('2d')).toBeTruthy();
    expect(within(screen.getByRole('button', { name: /Fácil/ })).getByText('2d')).toBeTruthy();
  } finally {
    screen.unmount();
  }
});
