import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

const mockStackNavigator = jest.fn(({ children }) => <>{children}</>);
const mockStackScreen = jest.fn(({ name, component: Component }: any) => {
  if (name === 'Root' && Component) return <Component />;
  return null;
});
const mockTabNavigator = jest.fn(({ children }) => <>{children}</>);
const mockTabScreen = jest.fn((_props: any) => null);

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: mockStackNavigator,
    Screen: mockStackScreen,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: mockTabNavigator,
    Screen: mockTabScreen,
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');

  return {
    useLanguage: () => ({
      language: 'en',
      setLanguage: jest.fn(),
      toggleLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) => translate('en', key, values),
    }),
  };
});

jest.mock('../../src/screens/HomeScreen', () => () => null);
jest.mock('../../src/screens/StudyScreen', () => () => null);
jest.mock('../../src/screens/ProgressScreen', () => () => null);
jest.mock('../../src/screens/SettingsScreen', () => () => null);
jest.mock('../../src/screens/NotificationsScreen', () => () => null);
jest.mock('../../src/screens/DailyGoalScreen', () => () => null);
jest.mock('../../src/screens/ManageDecksScreen', () => () => null);
jest.mock('../../src/screens/ReviewScreen', () => () => null);
jest.mock('../../src/screens/FlaggedScreen', () => () => null);
jest.mock('../../src/screens/QuizScreen', () => () => null);
jest.mock('../../src/screens/PhrasebookScreen', () => () => null);
jest.mock('../../src/screens/PhrasesScreen', () => () => null);
jest.mock('../../src/screens/AddCardScreen', () => () => null);
jest.mock('../../src/screens/ExploreScreen', () => () => null);
jest.mock('../../src/screens/DifficultWordsScreen', () => () => null);
jest.mock('../../src/screens/OnboardingScreen', () => () => null);

describe('RootNavigator transitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The navigator defers rendering until the onboarding pref loads.
  async function renderNavigator() {
    const RootNavigator = require('../../src/navigation').default;
    render(<RootNavigator />);
    await waitFor(() => expect(mockStackNavigator).toHaveBeenCalled());
  }

  it('uses a short fade transition for stack screen changes', async () => {
    await renderNavigator();

    expect(mockStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: expect.objectContaining({
          animation: 'fade',
          animationDuration: 220,
        }),
      }),
      undefined,
    );
  });

  it('uses Study as the only discovery/study bottom tab', async () => {
    await renderNavigator();

    const tabNames = mockTabScreen.mock.calls.map(([props]) => props.name);
    expect(tabNames).toEqual(['Home', 'Study', 'Progress', 'Settings']);
    expect(tabNames).not.toContain('Browse');
  });

  it('registers the onboarding screen for first-run users', async () => {
    await renderNavigator();

    const stackNames = mockStackScreen.mock.calls.map(([props]) => props.name);
    expect(stackNames).toContain('Onboarding');
  });

  it('registers the Phrases screen while keeping Favorites available', async () => {
    await renderNavigator();

    const stackNames = mockStackScreen.mock.calls.map(([props]) => props.name);
    expect(stackNames).toContain('Phrases');
    expect(stackNames).toContain('Phrasebook');
  });
});
