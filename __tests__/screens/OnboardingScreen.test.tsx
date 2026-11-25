import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen, { chooseOnboardingPractice } from '../../src/screens/OnboardingScreen';
import { Deck, FlashCard } from '../../src/types';
import { ALL_DECKS } from '../../src/data/decks';
import { LanguageProvider } from '../../src/context/LanguageContext';
import { getPrefs } from '../../src/storage/prefs';

jest.mock('../../src/hooks/useDeck', () => ({ useDeck: () => ({ ready: false, decks: [] }) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({}) }));
jest.mock('../../src/services/notifications', () => ({
  refreshScheduledNotifications: jest.fn(),
}));

beforeEach(async () => AsyncStorage.clear());

const now = Date.UTC(2026, 10, 25);
const budget = { now, remainingNew: 3 };
const card = (id: string, fields: Partial<FlashCard> = {}): FlashCard => ({
  id,
  front: id,
  back: 'answer',
  createdAt: 0,
  due: 0,
  interval: 0,
  reps: 0,
  ease: 2.5,
  ...fields,
});
const deck = (id: string, cards: FlashCard[]): Deck => ({ id, name: id, cards });

test('shows the two interface languages before asking any learning question', async () => {
  const ui = render(<OnboardingScreen />);
  expect(await ui.findByRole('button', { name: 'English' })).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Español' })).toBeTruthy();
  expect(ui.queryByText('¿Por qué aprendes español colombiano?')).toBeNull();
});

test('filters owned paid decks before choosing a bounded named practice', () => {
  const greetings = deck('deck-greetings', [card('hello')]);
  const decks = [
    deck('deck-dating', [card('date')]),
    deck('deck-paisa', [card('parce')]),
    greetings,
  ];
  expect(chooseOnboardingPractice(decks, 'love', 'paisa', budget)).toMatchObject({
    kind: 'study',
    deck: greetings,
    cardLimit: 4,
    newLimit: 3,
    minutes: 1,
    region: 'all',
    regionalFallback: true,
  });
});

test('chooses a free regional match when one can enter the first queue', () => {
  const greetings = deck('deck-greetings', [card('hello')]);
  const travel = deck('deck-travel', [card('medellin', { regions: ['paisa'] })]);
  expect(chooseOnboardingPractice([greetings, travel], 'general', 'paisa', budget)).toMatchObject({
    kind: 'study',
    deck: travel,
    region: 'paisa',
    regionalFallback: false,
  });
});

test('skips empty and unavailable decks while observing the remaining new-card cap', () => {
  const later = card('scheduled', { reps: 1, due: now + 60_000 });
  const shown = [
    deck('deck-travel', []),
    deck('deck-greetings', [later]),
    deck('deck-food', [card('tinto')]),
  ];
  expect(chooseOnboardingPractice(shown, 'travel', 'all', budget)).toMatchObject({
    kind: 'study',
    deck: { id: 'deck-food' },
  });
  expect(chooseOnboardingPractice(shown, 'travel', 'all', { now, remainingNew: 0 })).toEqual({
    kind: 'home',
  });
});

test('allows due reviews with no remaining new-card budget', () => {
  const greetings = deck('deck-greetings', [card('hello', { reps: 1, due: now })]);
  expect(
    chooseOnboardingPractice([greetings], 'general', 'all', { now, remainingNew: 0 }),
  ).toMatchObject({
    kind: 'study',
    deck: greetings,
    newLimit: 0,
  });
});

test('never hands a free-deck route to Study if its stored queue could expose a bundled paid card', () => {
  const paid = ALL_DECKS.find(({ id }) => id === 'deck-dating')!.cards[0];
  expect(
    chooseOnboardingPractice(
      [deck('deck-travel', [card('trip'), paid]), deck('deck-greetings', [card('hello')])],
      'travel',
      'all',
      budget,
    ),
  ).toMatchObject({ kind: 'study', deck: { id: 'deck-greetings' } });
});

test('saves the explicit language in durable preferences before showing the next screen', async () => {
  const ui = render(
    <LanguageProvider>
      <OnboardingScreen />
    </LanguageProvider>,
  );
  fireEvent.press(ui.getByRole('button', { name: 'English' }));
  await ui.findByRole('header', { name: 'Hi, I’m Ana' });
  ui.unmount();
  expect(await getPrefs()).toMatchObject({ uiLanguage: 'en', onboardingDone: false });
});
