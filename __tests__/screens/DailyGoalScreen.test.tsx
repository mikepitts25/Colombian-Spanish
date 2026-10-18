import React from 'react';
import { Alert, Dimensions } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyGoalScreen from '../../src/screens/DailyGoalScreen';
import { getDailyProgress, incrementDailyProgress } from '../../src/storage/storage';
import { getPrefs } from '../../src/storage/prefs';

const mockBack = jest.fn();
const mockReload = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  usePreventRemove: jest.fn(),
}));
jest.mock('../../src/hooks/useDeck', () => ({ useDeck: () => ({ reload: mockReload }) }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values?: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
const originalWindow = Dimensions.get('window');
const write = AsyncStorage.setItem as jest.Mock;
const implementation = write.getMockImplementation()!;
beforeEach(async () => {
  jest.clearAllMocks();
  write.mockImplementation(implementation);
  mockReload.mockResolvedValue(undefined);
  await AsyncStorage.clear();
  const daily = await getDailyProgress();
  await AsyncStorage.setItem(
    'SRS_DAILY_PROGRESS_V1',
    JSON.stringify({ ...daily, target: 5, count: 3, newCount: 2 }),
  );
  await AsyncStorage.setItem(
    'SRS_PREFS_V1',
    JSON.stringify({ newCardsPerDay: 10, uiLanguage: 'en', autoSpeak: true }),
  );
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  write.mockClear();
});
afterEach(() => {
  write.mockImplementation(implementation);
  jest.restoreAllMocks();
  act(() => Dimensions.set({ window: originalWindow }));
});

test('retains one selected save intent and pending controls through live text resizing', async () => {
  const screen = render(<DailyGoalScreen />);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '5 cards per day', selected: true })).toBeTruthy(),
  );
  fireEvent.press(screen.getByRole('button', { name: '20 cards per day' }));
  fireEvent.press(screen.getByRole('button', { name: 'Increase daily new-card limit' }));
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  write.mockImplementationOnce(async (...args: unknown[]) => {
    await held;
    return implementation(...args);
  });
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(screen.getByRole('button', { name: 'Save', disabled: true })).toBeTruthy();
  expect(
    screen.getByRole('button', { name: '20 cards per day', selected: true, disabled: true }),
  ).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Increase daily new-card limit', disabled: true }),
  ).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  expect(mockBack).not.toHaveBeenCalled();
  await act(async () => release());
  await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  expect(mockReload).toHaveBeenCalledTimes(1);
  expect(mockReload).toHaveBeenCalledWith({ requireFreshBudget: true });
  expect(await getDailyProgress()).toMatchObject({ target: 20, count: 3, newCount: 2 });
  expect(await getPrefs()).toMatchObject({ newCardsPerDay: 15, uiLanguage: 'en', autoSpeak: true });
  const journals = write.mock.calls.filter(([key]: [string]) => key === 'SRS_WRITE_JOURNAL_V1');
  expect(journals).toHaveLength(1);
  expect(
    JSON.parse(journals[0][1])
      .entries.map(([key]: [string]) => key)
      .sort(),
  ).toEqual(['SRS_DAILY_PROGRESS_V1', 'SRS_PREFS_V1']);
});

test('keeps the failed intent and retries without claiming success or changing its values', async () => {
  const screen = render(<DailyGoalScreen />);
  await waitFor(() => screen.getByRole('button', { name: '5 cards per day', selected: true }));
  fireEvent.press(screen.getByRole('button', { name: '10 cards per day' }));
  write.mockRejectedValueOnce(new Error('disk full'));
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('alert');
  expect(mockBack).not.toHaveBeenCalled();
  expect(Alert.alert).not.toHaveBeenCalled();
  expect(await getDailyProgress()).toMatchObject({ target: 5, count: 3, newCount: 2 });
  expect(screen.getByRole('button', { name: '20 cards per day', disabled: true })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Retry save' }));
  await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  expect(await getDailyProgress()).toMatchObject({ target: 10, count: 3, newCount: 2 });
});

test('does not allow a failed load to overwrite existing settings with defaults', async () => {
  const read = AsyncStorage.getItem as jest.Mock;
  read.mockRejectedValueOnce(new Error('read failed'));
  const screen = render(<DailyGoalScreen />);
  await screen.findByRole('alert');
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => screen.getByRole('button', { name: '5 cards per day', selected: true }));
  expect(mockBack).not.toHaveBeenCalled();
  expect(await getPrefs()).toMatchObject({ newCardsPerDay: 10 });
});

test('retries a committed save after provider refresh failure while preserving a later counter increment', async () => {
  const screen = render(<DailyGoalScreen />);
  await waitFor(() => screen.getByRole('button', { name: '5 cards per day', selected: true }));
  fireEvent.press(screen.getByRole('button', { name: '20 cards per day' }));
  mockReload.mockRejectedValueOnce(new Error('refresh failed'));
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('alert');
  expect(await getDailyProgress()).toMatchObject({ target: 20, count: 3 });
  expect(mockBack).not.toHaveBeenCalled();
  await incrementDailyProgress();
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(
    screen.getByRole('button', { name: '20 cards per day', selected: true, disabled: true }),
  ).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Retry save' }));
  await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  expect(await getDailyProgress()).toMatchObject({ target: 20, count: 4, newCount: 2 });
});
