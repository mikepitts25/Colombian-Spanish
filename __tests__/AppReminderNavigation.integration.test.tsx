import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import App from '../App';
import { localDayKey } from '../src/utils/calendarDay';

jest.unmock('@react-navigation/native');

let mockOnboarding: boolean;
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));
jest.mock('../src/navigation', () => {
  const React = require('react');
  const { Button, Text } = require('react-native');
  const {
    createNavigatorFactory,
    StackRouter,
    useNavigationBuilder,
  } = require('@react-navigation/native');
  const Stack = createNavigatorFactory(function TestNavigator({ children, initialRouteName }: any) {
    const { state, descriptors, NavigationContent } = useNavigationBuilder(StackRouter, {
      children,
      initialRouteName,
    });
    return (
      <NavigationContent>{descriptors[state.routes[state.index].key].render()}</NavigationContent>
    );
  })();

  function Onboarding({ navigation }: any) {
    return (
      <Button
        title="Last onboarding step"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Root' }] })}
      />
    );
  }
  function Root({ route }: any) {
    return (
      <Text>{route.params?.screen === 'Home' ? 'Today’s Home practice' : 'Original Home tab'}</Text>
    );
  }
  const ReminderWord = require('../src/screens/ReminderWordScreen').default;

  return {
    __esModule: true,
    default: () => (
      <Stack.Navigator initialRouteName={mockOnboarding ? 'Onboarding' : 'Root'}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Root" component={Root} />
        <Stack.Screen name="ReminderWord" component={ReminderWord} />
      </Stack.Navigator>
    ),
  };
});
jest.mock('../src/hooks/useDeck', () => ({
  DeckProvider: ({ children }: any) => children,
  useDeck: () => ({
    ready: true,
    decks: [
      {
        id: 'deck-greetings',
        name: 'Greetings',
        cards: [{ id: '0010', front: 'buenos días', back: 'good morning' }],
      },
    ],
  }),
}));
jest.mock('../src/context/LanguageContext', () => ({
  LanguageProvider: ({ children }: any) => children,
  useLanguage: () => ({
    t: (key: any) => require('../src/i18n/translations').translate('en', key),
  }),
}));
jest.mock('../src/services/crashReporting', () => ({
  initCrashReporting: jest.fn(),
  reportError: jest.fn(),
}));
jest.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'tap',
  getLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined' }),
}));

const getLast = Notifications.getLastNotificationResponse as jest.Mock;
const subscribe = Notifications.addNotificationResponseReceivedListener as jest.Mock;
const response = (identifier: string, data: object) => ({
  actionIdentifier: 'tap',
  notification: { date: Date.now(), request: { identifier, content: { data } } },
});
const word = (day = localDayKey()) =>
  response('morning', {
    reminder: 'word',
    day,
    deckId: 'deck-greetings',
    cardId: '0010',
    front: 'buenos días',
  });

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockOnboarding = false;
  getLast.mockReturnValue(null);
});

test('cold-start word opens the word route and a later evening tap opens the Home practice route', async () => {
  const cold = word();
  getLast.mockReturnValue(cold);
  const ui = render(<App />);
  await ui.findByText('buenos días');
  expect(ui.getByText('good morning')).toBeTruthy();
  const receive = subscribe.mock.calls[0][0];
  act(() => receive(cold));
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);

  const evening = response('evening', { reminder: 'evening' });
  getLast.mockReturnValue(evening);
  act(() => receive(evening));
  await ui.findByText('Today’s Home practice');
  expect(ui.queryByText('buenos días')).toBeNull();
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(2);
});

test('a cold reminder waits until onboarding has released its route', async () => {
  mockOnboarding = true;
  getLast.mockReturnValue(word());
  const ui = render(<App />);
  const finish = await ui.findByRole('button', { name: 'Last onboarding step' });
  expect(ui.queryByText('buenos días')).toBeNull();
  expect(Notifications.clearLastNotificationResponse).not.toHaveBeenCalled();
  fireEvent.press(finish);
  await ui.findByText('buenos días');
  expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
});

test.each(['active', 'cold'] as const)(
  'a %s notification opens the exact card or expiry fallback without awarding credit',
  async (delivery) => {
    const progress: [string, string][] = [
      [
        'SRS_DAILY_PROGRESS_V1',
        JSON.stringify({ date: localDayKey(), count: 2, newCount: 1, target: 10 }),
      ],
      [
        'SRS_STUDY_STREAK_V1',
        JSON.stringify({ streak: 1, lastStudyDate: localDayKey(), freezes: 0 }),
      ],
      ['SRS_LEARNING_EVENTS_V1', JSON.stringify({ schemaVersion: 1, events: [] })],
    ];
    await AsyncStorage.multiSet(progress);
    const observedKeys = [
      ...progress.map(([key]) => key),
      'SRS_LAST_STUDY_SESSION_V1',
      'SRS_DAILY_PLAN_V1',
      'SRS_DECKS_V3',
      'SRS_SEEN_WORDS_V1',
    ];
    const original = await AsyncStorage.multiGet(observedKeys);
    const notification = delivery === 'cold' ? word('2020-01-01') : word();
    if (delivery === 'cold') getLast.mockReturnValue(notification);
    const ui = render(<App />);
    if (delivery === 'active') {
      await ui.findByText('Original Home tab');
      const receive = subscribe.mock.calls[0][0];
      act(() => receive(notification));
      await ui.findByText('good morning');
    } else {
      expect(await ui.findByRole('alert')).toHaveTextContent(/another day/);
      expect(ui.queryByText('buenos días')).toBeNull();
      expect(ui.queryByRole('button', { name: 'Listen' })).toBeNull();
    }
    expect(await AsyncStorage.multiGet(observedKeys)).toEqual(original);
    fireEvent.press(ui.getByRole('button', { name: 'Go to today’s practice' }));
    await ui.findByText('Today’s Home practice');
    expect(await AsyncStorage.multiGet(observedKeys)).toEqual(original);
  },
);
