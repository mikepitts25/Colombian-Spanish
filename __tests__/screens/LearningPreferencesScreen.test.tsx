import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import LearningPreferencesScreen from '../../src/screens/LearningPreferencesScreen';
import { getPrefs } from '../../src/storage/prefs';
import type { Deck } from '../../src/types';
import { saveLearningProfile } from '../../src/storage/learningProfile';
const mockBack = jest.fn();
let mockDecks: Deck[] = [];
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: mockDecks }),
}));
const originalWindow = Dimensions.get('window');
afterEach(() => act(() => Dimensions.set({ window: originalWindow })));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: mockBack }) }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values?: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
jest.mock('../../src/storage/prefs', () => ({
  ...jest.requireActual('../../src/storage/prefs'),
  getPrefs: jest.fn(),
}));
jest.mock('../../src/storage/learningProfile', () => ({
  ...jest.requireActual('../../src/storage/learningProfile'),
  saveLearningProfile: jest.fn(),
}));
const load = getPrefs as jest.Mock;
const save = saveLearningProfile as jest.Mock;
const profile = {
  learningReason: 'travel',
  homeRegion: 'all',
  learningLevel: 'beginner',
  studyMinutes: 5,
  tripDate: null,
};
beforeEach(() => {
  jest.clearAllMocks();
  mockDecks = [];
  load.mockResolvedValue({ ...profile, newCardsPerDay: 10 });
  save.mockResolvedValue(undefined);
});
test('loads saved selections, edits planning fields and saves only the chosen profile', async () => {
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Your starting level')).toBeTruthy());
  expect(ui.getByRole('radio', { name: 'Beginner' })).toHaveAccessibilityState({ checked: true });
  fireEvent.press(ui.getByText('I know the basics'));
  fireEvent.press(ui.getByText('10 minutes'));
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2027-03-12');
  fireEvent.press(ui.getByText('Save preferences'));
  await waitFor(() => expect(ui.getByText('Preferences saved.')).toBeTruthy());
  expect(save).toHaveBeenCalledWith({
    ...profile,
    learningLevel: 'basic',
    studyMinutes: 10,
    tripDate: '2027-03-12',
  });
});
test('read failure offers retry without letting defaults overwrite existing preferences', async () => {
  load.mockRejectedValueOnce(new Error('read failure'));
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Could not load your preferences.')).toBeTruthy());
  expect(ui.queryByText('Save preferences')).toBeNull();
  fireEvent.press(ui.getByText('Retry'));
  await waitFor(() => expect(ui.getByText('Save preferences')).toBeTruthy());
  expect(save).not.toHaveBeenCalled();
});
test('rejects impossible dates and retains unsaved edits after failure for retry', async () => {
  save.mockRejectedValueOnce(new Error('disk full'));
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Save preferences')).toBeTruthy());
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2027-02-29');
  expect(ui.getByText('Save preferences')).toBeDisabled();
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2028-02-29');
  fireEvent.press(ui.getByText('Save preferences'));
  await waitFor(() =>
    expect(ui.getByText('Could not save. Your edits are still here.')).toBeTruthy(),
  );
  expect(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)')).toHaveProp('value', '2028-02-29');
  fireEvent.press(ui.getByText('Save preferences'));
  await waitFor(() => expect(ui.getByText('Preferences saved.')).toBeTruthy());
  expect(save).toHaveBeenCalledTimes(2);
});
test('blocks overlapping writes and local exit, then allows cancelling without a write', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Save preferences')).toBeTruthy());
  fireEvent.press(ui.getByText('Save preferences'));
  fireEvent.press(ui.getByText('Save preferences'));
  fireEvent.press(ui.getByText('Back'));
  expect(save).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
  expect(ui.getByText('Beginner')).toBeDisabled();
  await act(async () => {
    release();
  });
  fireEvent.press(ui.getByText('Back'));
  expect(mockBack).toHaveBeenCalledTimes(1);
});

test('retains dirty choices, trip text and one pending save across live text changes', async () => {
  let release!: () => void;
  save.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const ui = render(<LearningPreferencesScreen />);
  await ui.findByText('Save preferences');
  fireEvent.press(ui.getByRole('radio', { name: 'I know the basics' }));
  fireEvent.press(ui.getByRole('radio', { name: '10 minutes' }));
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2028-02-29');
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByRole('radio', { name: 'I know the basics', checked: true })).toBeTruthy();
  expect(ui.getByDisplayValue('2028-02-29')).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Save preferences' }));
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 1.8 } }));
  expect(ui.getByRole('radio', { name: '10 minutes', checked: true, disabled: true })).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Back', disabled: true })).toBeTruthy();
  expect(ui.getByDisplayValue('2028-02-29').props.editable).toBe(false);
  fireEvent.press(ui.getByRole('button', { name: 'Save preferences' }));
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith({
    ...profile,
    learningLevel: 'basic',
    studyMinutes: 10,
    tripDate: '2028-02-29',
  });
  await act(async () => release());
  await ui.findByText('Preferences saved.');
  expect(mockBack).not.toHaveBeenCalled();
});

test('suggests a topic from the currently accessible library, even if a preferred topic is absent', async () => {
  mockDecks = [
    {
      id: 'local-greetings',
      name: 'My greetings',
      cards: [
        {
          id: 'local-hello',
          front: 'hola',
          back: 'hello',
          createdAt: 1,
          due: 0,
          reps: 0,
          interval: 0,
          ease: 2.5,
        },
      ],
    },
  ];
  const ui = render(<LearningPreferencesScreen />);
  await ui.findByText('My greetings · about 1 min');
});
