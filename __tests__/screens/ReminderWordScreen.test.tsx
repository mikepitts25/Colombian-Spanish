import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ReminderWordScreen from '../../src/screens/ReminderWordScreen';
import type { ReminderTap } from '../../src/services/notifications';
import { speakCard } from '../../src/services/tts';
import { localDayKey } from '../../src/utils/calendarDay';
import type { Deck } from '../../src/types';

const mockDispatch = jest.fn();
let mockDecks: Deck[] = [];
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ dispatch: mockDispatch }),
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: mockDecks }),
}));
jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(async () => ({ source: 'device' })),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
  }),
}));

const shownCard = {
  id: 'test-word',
  front: 'buenas tardes',
  back: 'good afternoon',
  createdAt: 0,
  due: 0,
  reps: 0,
  interval: 0,
  ease: 2.5,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDecks = [{ id: 'deck-greetings', name: 'Greetings', cards: [shownCard] }];
});

const word = (overrides?: Partial<Extract<ReminderTap, { kind: 'word' }>>): ReminderTap => ({
  kind: 'word',
  deckId: 'deck-greetings',
  cardId: shownCard.id,
  front: shownCard.front,
  day: localDayKey(),
  ...overrides,
});

test('opens the exact free word with optional pronunciation and an ordinary practice route', () => {
  const ui = render(<ReminderWordScreen route={{ params: word() }} />);
  expect(ui.getByText('buenas tardes')).toBeTruthy();
  expect(ui.getByText('good afternoon')).toBeTruthy();
  expect(speakCard).not.toHaveBeenCalled();
  expect(ui.getAllByRole('button')).toHaveLength(2);
  fireEvent.press(ui.getByRole('button', { name: 'Listen' }));
  expect(speakCard).toHaveBeenCalledWith(shownCard);
  fireEvent.press(ui.getByRole('button', { name: 'Go to today’s practice' }));
  expect(mockDispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'POP_TO',
      payload: expect.objectContaining({ name: 'Root', params: { screen: 'Home' } }),
    }),
  );
});

test.each([
  ['expiry', { day: '2020-01-01' }, /another day/],
  ['edited wording', { front: 'a different word' }, /unavailable/],
  ['removed card', { cardId: 'missing' }, /unavailable/],
  ['paid deck', { deckId: 'deck-dating' }, /unavailable/],
] as const)('handles %s truthfully with an actionable fallback', (_case, params, message) => {
  const ui = render(<ReminderWordScreen route={{ params: word(params) }} />);
  expect(ui.getByRole('alert')).toHaveTextContent(message);
  expect(ui.queryByText('buenas tardes')).toBeNull();
  expect(ui.queryByRole('button', { name: 'Listen' })).toBeNull();
  expect(ui.getByRole('button', { name: 'Go to today’s practice' })).toBeEnabled();
  expect(speakCard).not.toHaveBeenCalled();
});
