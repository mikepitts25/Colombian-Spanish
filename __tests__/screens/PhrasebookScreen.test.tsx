import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import PhrasebookScreen from '../../src/screens/PhrasebookScreen';
import { useDeck } from '../../src/hooks/useDeck';
import { Deck } from '../../src/types';

jest.mock('../../src/hooks/useDeck', () => ({ useDeck: jest.fn() }));
const mockSpeak = jest.fn();
jest.mock('../../src/services/tts', () => ({
  speakCard: (...args: unknown[]) => mockSpeak(...args),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values?: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
const originalWindow = Dimensions.get('window');
const toggle = jest.fn();
const active = jest.fn();
const decks: Deck[] = [
  {
    id: 'weather',
    name: 'Weather',
    cards: [
      {
        id: 'heat',
        front: 'Hace calor',
        back: 'It is hot',
        tags: ['summer'],
        favorite: true,
        createdAt: 0,
        due: 0,
        reps: 0,
        interval: 0,
        ease: 2.5,
      },
      {
        id: 'rain',
        front: 'Llueve',
        back: 'It is raining',
        favorite: true,
        createdAt: 0,
        due: 0,
        reps: 0,
        interval: 0,
        ease: 2.5,
      },
      {
        id: 'hidden',
        front: 'Unsaved card',
        back: 'Hidden',
        favorite: false,
        createdAt: 0,
        due: 0,
        reps: 0,
        interval: 0,
        ease: 2.5,
      },
    ],
  },
];
beforeEach(() => {
  jest.clearAllMocks();
  (useDeck as jest.Mock).mockReturnValue({
    ready: true,
    decks,
    toggleFavorite: toggle,
    setActiveDeckId: active,
  });
});
afterEach(() => act(() => Dimensions.set({ window: originalWindow })));

test('retains a tag search through live resizing and names the matching playback action', () => {
  const screen = render(<PhrasebookScreen />);
  fireEvent.changeText(screen.getByPlaceholderText('Search (es/en/tags)…'), 'summer');
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(screen.getByDisplayValue('summer')).toBeTruthy();
  expect(screen.queryByText('Llueve')).toBeNull();
  expect(screen.queryByText('Unsaved card')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Play Hace calor' }));
  expect(active).toHaveBeenCalledWith('weather');
  expect(mockSpeak).toHaveBeenCalledWith(decks[0].cards[0]);
  expect(toggle).not.toHaveBeenCalled();
});

test('does not resubmit a pending removal on resize and retains the search when it completes', async () => {
  let finish!: () => void;
  toggle.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = render(<PhrasebookScreen />);
  fireEvent.changeText(screen.getByPlaceholderText('Search (es/en/tags)…'), 'hot');
  fireEvent.press(screen.getByRole('button', { name: 'Remove Hace calor', selected: true }));
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(toggle).toHaveBeenCalledWith('heat');
  await act(async () => finish());
  (useDeck as jest.Mock).mockReturnValue({
    ready: true,
    decks: [
      {
        ...decks[0],
        cards: decks[0].cards.map((card) => ({
          ...card,
          favorite: card.id !== 'heat' && card.favorite,
        })),
      },
    ],
    toggleFavorite: toggle,
    setActiveDeckId: active,
  });
  screen.rerender(<PhrasebookScreen />);
  expect(screen.getByDisplayValue('hot')).toBeTruthy();
  expect(screen.queryByText('Hace calor')).toBeNull();
  expect(screen.queryByText('Llueve')).toBeNull();
  expect(toggle).toHaveBeenCalledTimes(1);
});
