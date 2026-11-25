import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Dimensions } from 'react-native';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import {
  acknowledgeOnboardingHandoff,
  completeOnboarding,
  type OnboardingHandoff,
} from '../../src/storage/onboarding';
import { getPrefs } from '../../src/storage/prefs';
import { getDailyProgress } from '../../src/storage/storage';
import { ALL_DECKS } from '../../src/data/decks';
import * as adventures from '../../src/adventures/content';
import type { Deck } from '../../src/types';
import { translate, TranslationKey } from '../../src/i18n/translations';
let mockLanguage: 'en' | 'es' = 'en';
const label = (key: TranslationKey, values?: Record<string, string | number>) =>
  translate(mockLanguage, key, values);
const targetedStudy = () =>
  label('onboarding.firstPractice', {
    deck: mockLanguage === 'en' ? 'Travel' : 'Viajes',
  });
let mockFocused = true;
const mockReset = jest.fn();
const mockSetLanguage = jest.fn();
const mockStarter: Deck = {
  id: 'deck-travel',
  name: 'Viajes',
  cards: [
    {
      id: 'journey-test',
      front: 'viajar',
      back: 'travel',
      createdAt: 0,
      due: 0,
      reps: 0,
      interval: 0,
      ease: 2.5,
    },
  ],
};
let mockDecks: Deck[] = [mockStarter];
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockReset, isFocused: () => mockFocused }),
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: mockDecks }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    t: (key: TranslationKey, values?: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate(mockLanguage, key, values),
  }),
}));
jest.mock('../../src/storage/onboarding', () => ({
  completeOnboarding: jest.fn(),
  acknowledgeOnboardingHandoff: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/storage/prefs', () => ({
  ...jest.requireActual('../../src/storage/prefs'),
  getPrefs: jest.fn(),
}));
jest.mock('../../src/storage/storage', () => ({
  ...jest.requireActual('../../src/storage/storage'),
  getDailyProgress: jest.fn(),
}));
const save = completeOnboarding as jest.Mock;
async function setup(region: 'all' | 'rolo' = 'all') {
  const ui = render(<OnboardingScreen />);
  fireEvent.press(ui.getByRole('button', { name: mockLanguage === 'en' ? 'English' : 'Español' }));
  fireEvent.press(await ui.findByText(label('onboarding.personalize')));
  fireEvent.press(ui.getByText(label('onboarding.reason.travel')));
  fireEvent.press(ui.getByText(label('onboarding.next')));
  fireEvent.press(ui.getByText(label(`onboarding.region.${region}`)));
  fireEvent.press(ui.getByText(label('onboarding.next')));
  await ui.findByText(targetedStudy());
  return ui;
}
beforeEach(() => {
  mockLanguage = 'en';
  mockFocused = true;
  mockDecks = [mockStarter];
  jest.clearAllMocks();
  save.mockResolvedValue(undefined);
  mockSetLanguage.mockResolvedValue(undefined);
  (getPrefs as jest.Mock).mockResolvedValue({ newCardsPerDay: 10 });
  (getDailyProgress as jest.Mock).mockResolvedValue({ newCount: 0 });
});
afterEach(() => jest.restoreAllMocks());
test.each(['en', 'es'] as const)(
  'stays on setup after save failure and retries the selected intent before navigation (%s)',
  async (language) => {
    mockLanguage = language;
    save.mockRejectedValueOnce(new Error('disk full'));
    const ui = await setup();
    fireEvent.press(ui.getByText(targetedStudy()));
    await waitFor(() => expect(ui.getByText(label('onboarding.saveError'))).toBeTruthy());
    expect(mockReset).not.toHaveBeenCalled();
    fireEvent.press(ui.getByText(label('practice.retrySave')));
    await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1]).toEqual(save.mock.calls[0]);
    expect(save).toHaveBeenLastCalledWith(
      { reason: 'travel', region: 'all', target: 10 },
      expect.objectContaining({ destination: { kind: 'study', id: 'deck-travel' } }),
    );
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [
        {
          name: 'Root',
          params: {
            screen: 'Study',
            params: {
              autoStartDeckId: 'deck-travel',
              sessionCardLimit: 4,
              sessionNewLimit: 3,
              sessionPreferredRegion: 'all',
            },
          },
        },
      ],
    });
  },
);
test('blocks duplicate submission, goal changes and local back while the write is unresolved', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = await setup();
  fireEvent.press(ui.getByText(targetedStudy()));
  fireEvent.press(ui.getByText(targetedStudy()));
  fireEvent.press(ui.getByText('Back'));
  fireEvent.press(ui.getByText('20'));
  expect(ui.getByText('How many cards a day?')).toBeTruthy();
  expect(ui.getByText('20')).toBeDisabled();
  expect(save).toHaveBeenCalledTimes(1);
  expect(mockReset).not.toHaveBeenCalled();
  await act(async () => {
    release();
  });
  expect(mockReset).toHaveBeenCalledTimes(1);
});
test('does not navigate after unmount while saving', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = await setup();
  fireEvent.press(ui.getByText(targetedStudy()));
  ui.unmount();
  await act(async () => {
    release();
  });
  expect(mockReset).not.toHaveBeenCalled();
});

test('keeps setup intent and a single pending save through live text-size changes', async () => {
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  let release!: () => void;
  save.mockImplementationOnce(() => new Promise<void>((resolve) => (release = resolve)));
  const ui = await setup();
  try {
    fireEvent.press(ui.getByText('20'));
    act(() =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screen, fontScale: 3 },
      }),
    );
    expect(ui.getByText('How many cards a day?')).toBeTruthy();
    fireEvent.press(ui.getByText(targetedStudy()));
    expect(save).toHaveBeenCalledWith(
      { reason: 'travel', region: 'all', target: 20 },
      expect.objectContaining({ destination: { kind: 'study', id: 'deck-travel' } }),
    );
    act(() => Dimensions.set({ window, screen }));
    expect(ui.getByText(targetedStudy())).toBeDisabled();
    fireEvent.press(ui.getByText(targetedStudy()));
    fireEvent.press(ui.getByText('Back'));
    fireEvent.press(ui.getByText('5'));
    expect(save).toHaveBeenCalledTimes(1);
    expect(mockReset).not.toHaveBeenCalled();
    await act(async () => release());
    expect(mockReset).toHaveBeenCalledTimes(1);
  } finally {
    ui.unmount();
    act(() => Dimensions.set({ window, screen }));
  }
});

test.each(['en', 'es'] as const)(
  'lands in free practice with defaults after one deliberate tap once %s is chosen',
  async (language) => {
    mockLanguage = language;
    const ui = render(<OnboardingScreen />);
    fireEvent.press(ui.getByRole('button', { name: language === 'en' ? 'English' : 'Español' }));
    const first = await ui.findByRole('button', { name: targetedStudy() });
    expect(mockSetLanguage).toHaveBeenCalledWith(language);
    fireEvent.press(first);
    fireEvent.press(first);
    await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
    expect(save.mock.calls).toEqual([
      [
        { reason: 'general', region: 'all', target: 10 },
        expect.objectContaining({ destination: { kind: 'study', id: 'deck-travel' } }),
      ],
    ]);
  },
);

test('shows an honest regional alternative and persists the region preference', async () => {
  const ui = await setup('rolo');
  expect(ui.getByText(/no free cards from that region ready/)).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: targetedStudy() }));
  await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledWith(
    { reason: 'travel', region: 'rolo', target: 10 },
    expect.objectContaining({ destination: { kind: 'study', id: 'deck-travel' } }),
  );
  expect(mockReset.mock.calls[0][0].routes[0].params.params.sessionPreferredRegion).toBe('all');
});

test('prefers an accepted café whose prerequisites and free source cards resolve', async () => {
  mockDecks = ALL_DECKS;
  const [first] = adventures.ADVENTURES;
  const fingerprint = adventures.adventureIdentity(first, ALL_DECKS);
  const resolve = adventures.resolveAdventure;
  jest.spyOn(adventures, 'resolveAdventure').mockImplementation((id, decks, mode) =>
    resolve(id, decks, mode, {
      schemaVersion: 1,
      records: [
        {
          missionId: first.pack.id,
          contentVersion: first.pack.contentVersion,
          fingerprint,
          status: 'reviewed',
          reviewer: { id: 'synthetic-test-only', kind: 'human' },
          reviewedAt: '2026-11-24T00:00:00Z',
        },
      ],
    }),
  );
  const ui = render(<OnboardingScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'English' }));
  fireEvent.press(await ui.findByRole('button', { name: 'Try my first visit' }));
  await waitFor(() =>
    expect(mockReset).toHaveBeenCalledWith({
      index: 1,
      routes: [
        { name: 'Root' },
        { name: 'Adventure', params: { id: 'first-morning-medellin', mode: 'accepted' } },
      ],
    }),
  );
});

test('does not offer a draft café or an owned paid deck when free practice is unavailable', async () => {
  mockDecks = ALL_DECKS.filter((deck) => deck.id === 'deck-dating');
  const ui = render(<OnboardingScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'English' }));
  expect(
    await ui.findByText('No free cards are ready right now. You can browse from Home.'),
  ).toBeTruthy();
  expect(ui.queryByText('Try my first visit')).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: 'Go to Home' }));
  await waitFor(() =>
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Root', params: undefined }],
    }),
  );
});

test('keeps language choice available after a rejected language save', async () => {
  mockSetLanguage.mockRejectedValueOnce(new Error('disk full'));
  const ui = render(<OnboardingScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'English' }));
  await ui.findByRole('alert');
  expect(ui.queryByText('Personalize practice')).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: 'Español' }));
  await ui.findByText('Personalize practice');
  expect(mockSetLanguage.mock.calls).toEqual([['en'], ['es']]);
  expect(save).not.toHaveBeenCalled();
});

test('does not reset an unfocused route and resumes its committed intent without writing twice', async () => {
  let release!: () => void;
  save.mockImplementationOnce(() => new Promise<void>((resolve) => (release = resolve)));
  const ui = await setup();
  fireEvent.press(ui.getByText(targetedStudy()));
  mockFocused = false;
  await act(async () => release());
  expect(mockReset).not.toHaveBeenCalled();
  expect(acknowledgeOnboardingHandoff).not.toHaveBeenCalled();
  mockFocused = true;
  fireEvent.press(ui.getByText(targetedStudy()));
  await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledTimes(1);
  expect(acknowledgeOnboardingHandoff).toHaveBeenCalledWith(save.mock.calls[0][1].id);
});

test('a failed navigation keeps the same durable receipt until the retry dispatch succeeds', async () => {
  mockReset.mockImplementationOnce(() => {
    throw new Error('navigator not ready');
  });
  const ui = await setup();
  fireEvent.press(ui.getByText(targetedStudy()));
  const retry = await ui.findByRole('button', { name: label('practice.retrySave') });
  expect(acknowledgeOnboardingHandoff).not.toHaveBeenCalled();
  fireEvent.press(retry);
  expect(mockReset).toHaveBeenCalledTimes(2);
  expect(save).toHaveBeenCalledTimes(1);
  expect(acknowledgeOnboardingHandoff).toHaveBeenCalledWith(save.mock.calls[0][1].id);
});

test('Back returns to the previous preference during recovery without changing the saved retry intent', async () => {
  save.mockRejectedValueOnce(new Error('disk full'));
  const ui = await setup();
  fireEvent.press(ui.getByText('20'));
  fireEvent.press(ui.getByText(targetedStudy()));
  await ui.findByText(label('onboarding.saveError'));
  fireEvent.press(ui.getByRole('button', { name: 'Back' }));
  expect(ui.getByText('Which region interests you most?')).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Next' }));
  fireEvent.press(ui.getByText(label('practice.retrySave')));
  await waitFor(() => expect(mockReset).toHaveBeenCalledTimes(1));
  expect(save.mock.calls.map(([input]) => input)).toEqual([
    { reason: 'travel', region: 'all', target: 20 },
    { reason: 'travel', region: 'all', target: 20 },
  ]);
  expect(save.mock.calls[1]).toEqual(save.mock.calls[0]);
});

test.each([
  { kind: 'study', id: 'deck-travel' },
  { kind: 'study', id: 'deck-dating' },
  { kind: 'cafe', id: 'withdrawn-visit' },
] as const)(
  'recovers a saved practice in one tap and rechecks its access (%j)',
  async (destination) => {
    const handoff: OnboardingHandoff = {
      id: 'restart-handoff',
      savedAt: 100,
      intent: { reason: 'travel', region: 'all', target: 10 },
      destination,
    };
    const ui = render(<OnboardingScreen route={{ params: { handoff } }} />);
    const action = await ui.findByRole('button', { name: targetedStudy() });
    expect(ui.queryByRole('button', { name: 'English' })).toBeNull();
    fireEvent.press(action);
    fireEvent.press(action);
    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockReset.mock.calls[0][0].routes[0].params.params.autoStartDeckId).toBe('deck-travel');
    expect(save).not.toHaveBeenCalled();
    expect(acknowledgeOnboardingHandoff).toHaveBeenCalledWith(handoff.id);
  },
);
