import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { DeckProvider } from '../../src/context/DeckContext';
import HomeScreen from '../../src/screens/HomeScreen';
import ProgressScreen from '../../src/screens/ProgressScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values?: any) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
jest.mock('../../src/services/tts', () => ({ speakCard: jest.fn(), stop: jest.fn() }));
jest.mock('../../src/data/decks', () => ({
  ALL_DECKS: [
    {
      id: 'scheduled',
      name: 'Travel',
      cards: [
        {
          id: 'scheduled-card',
          front: 'maleta',
          back: 'suitcase',
          createdAt: 0,
          due: new Date(2026, 9, 17, 12, 0, 30).getTime(),
          reps: 1,
          interval: 1,
          ease: 2.5,
        },
      ],
    },
  ],
}));

beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 17, 12));
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  await AsyncStorage.clear();
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it('Home discovers a scheduled review becoming due without leaving the screen', async () => {
  const screen = render(
    <DeckProvider>
      <HomeScreen />
    </DeckProvider>,
  );
  await screen.findByText('0 reviews due');
  await act(async () => {
    jest.advanceTimersByTime(60000);
  });
  expect(screen.getAllByText('1 review due').length).toBeGreaterThan(0);
  expect(screen.getByText('Study due cards')).toBeTruthy();
});

it('Progress discovers a scheduled review becoming due without leaving the screen', async () => {
  const screen = render(
    <DeckProvider>
      <ProgressScreen />
    </DeckProvider>,
  );
  await screen.findByText('No recognition results yet');
  expect(screen.getByTestId('progress-in-review').props.children).toBe(1);
  expect(screen.getByTestId('progress-due-reviews').props.children).toBe(0);
  await act(async () => {
    jest.advanceTimersByTime(60000);
  });
  expect(screen.getByTestId('progress-due-reviews').props.children).toBe(1);
});
