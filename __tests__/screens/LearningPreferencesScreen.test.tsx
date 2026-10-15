import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import LearningPreferencesScreen from '../../src/screens/LearningPreferencesScreen';
import { getPrefs } from '../../src/storage/prefs';
import { saveLearningProfile } from '../../src/storage/learningProfile';
const mockBack = jest.fn();
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
  load.mockResolvedValue(profile);
  save.mockResolvedValue(undefined);
});
test('loads saved selections, edits planning fields and saves only the chosen profile', async () => {
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Your starting level')).toBeTruthy());
  expect(ui.getByRole('radio', { name: 'Beginner' })).toHaveAccessibilityState({ checked: true });
  fireEvent.press(ui.getByText('I know the basics'));
  fireEvent.press(ui.getByText('10 minutes'));
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2027-03-12');
  fireEvent.press(ui.getByText('Save'));
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
  expect(ui.queryByText('Save')).toBeNull();
  fireEvent.press(ui.getByText('Retry'));
  await waitFor(() => expect(ui.getByText('Save')).toBeTruthy());
  expect(save).not.toHaveBeenCalled();
});
test('rejects impossible dates and retains unsaved edits after failure for retry', async () => {
  save.mockRejectedValueOnce(new Error('disk full'));
  const ui = render(<LearningPreferencesScreen />);
  await waitFor(() => expect(ui.getByText('Save')).toBeTruthy());
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2027-02-29');
  expect(ui.getByText('Save')).toBeDisabled();
  fireEvent.changeText(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)'), '2028-02-29');
  fireEvent.press(ui.getByText('Save'));
  await waitFor(() =>
    expect(ui.getByText('Could not save. Your edits are still here.')).toBeTruthy(),
  );
  expect(ui.getByLabelText('Trip date (optional, YYYY-MM-DD)')).toHaveProp('value', '2028-02-29');
  fireEvent.press(ui.getByText('Save'));
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
  await waitFor(() => expect(ui.getByText('Save')).toBeTruthy());
  fireEvent.press(ui.getByText('Save'));
  fireEvent.press(ui.getByText('Save'));
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
