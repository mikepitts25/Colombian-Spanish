import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AppState } from 'react-native';
import * as prefsStorage from '../../src/storage/prefs';
import { DeckProvider } from '../../src/context/DeckContext';
import HomeScreen from '../../src/screens/HomeScreen';
import StudyScreen from '../../src/screens/StudyScreen';

let mockRouteParams: any;
let mockOnNavigate: (name: string, params?: any) => void;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: (name: string, params?: any) => mockOnNavigate(name, params),
    setParams: () => {
      mockRouteParams = undefined;
    },
  }),
  useRoute: () => ({ params: mockRouteParams }),
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
      id: 'fresh',
      name: 'Travel',
      cards: [
        {
          id: 'fresh-card',
          front: 'new prompt',
          back: 'new answer',
          createdAt: 0,
          due: 0,
          reps: 0,
          interval: 0,
          ease: 2.5,
        },
      ],
    },
  ],
}));

function Harness() {
  const [study, setStudy] = React.useState(false);
  React.useLayoutEffect(() => {
    mockOnNavigate = (name, params) => {
      if (name === 'Study') {
        mockRouteParams = params;
        setStudy(true);
      }
    };
  }, []);
  return <DeckProvider>{study ? <StudyScreen /> : <HomeScreen />}</DeckProvider>;
}

it('starts a new-day session after yesterday exhausted the mounted provider budget', async () => {
  jest.useFakeTimers();
  const subscription = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  try {
    await AsyncStorage.clear();
    jest.setSystemTime(new Date(2026, 9, 14, 12));
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    await AsyncStorage.setItem(
      'SRS_PREFS_V1',
      JSON.stringify({ newCardsPerDay: 1, onboardingDone: true }),
    );
    await AsyncStorage.setItem(
      'SRS_DAILY_PROGRESS_V1',
      JSON.stringify({ date: midnight.toISOString(), count: 1, target: 5, newCount: 1 }),
    );
    const screen = render(<Harness />);
    await screen.findByText('New cards available today: 0');
    jest.setSystemTime(new Date(2026, 9, 15, 12));
    const foreground = subscription.mock.calls.at(-1)![1];
    await act(async () => foreground('active'));
    await screen.findByText('Study new cards');
    const prefsRead = jest
      .spyOn(prefsStorage, 'getPrefs')
      .mockRejectedValueOnce(new Error('budget read unavailable'));
    fireEvent.press(screen.getByText('Study new cards'));
    expect(
      await screen.findByText('Could not prepare the session. Please try again.'),
    ).toBeTruthy();
    expect(screen.queryByText('1 left')).toBeNull();
    prefsRead.mockRestore();
    fireEvent.press(screen.getByText('Study new cards'));
    expect(await screen.findByText('1 left')).toBeTruthy();
    expect(screen.getByText('new prompt')).toBeTruthy();
    screen.unmount();
  } finally {
    subscription.mockRestore();
    jest.useRealTimers();
  }
});
