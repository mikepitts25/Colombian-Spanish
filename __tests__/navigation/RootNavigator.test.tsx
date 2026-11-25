import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeOnboarding } from '../../src/storage/onboarding';

let mockReducedMotion = false;
let mockShowReviewTools = true;
jest.mock('../../src/config', () => ({
  get SHOW_REVIEW_TOOLS() {
    return mockShowReviewTools;
  },
  SHOW_CAFE_DRAFTS: false,
}));
jest.mock('../../src/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));
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
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    mockReducedMotion = false;
    mockShowReviewTools = true;
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

  it('disables stack animation when reduced motion is requested', async () => {
    mockReducedMotion = true;
    await renderNavigator();
    expect(mockStackNavigator).toHaveBeenCalledWith(
      expect.objectContaining({ screenOptions: expect.objectContaining({ animation: 'none' }) }),
      undefined,
    );
  });
  it('exposes named selected tabs and retains navigation', async () => {
    await renderNavigator();
    const tabBar = mockTabNavigator.mock.calls[0][0].tabBar;
    const navigate = jest.fn();
    const ui = render(
      tabBar({
        state: {
          index: 0,
          routes: [
            { key: 'home', name: 'Home' },
            { key: 'study', name: 'Study' },
            { key: 'progress', name: 'Progress' },
            { key: 'settings', name: 'Settings' },
          ],
        },
        descriptors: {},
        navigation: { navigate },
      }),
    );
    expect(ui.getByRole('tab', { name: 'HOME' })).toHaveAccessibilityState({ selected: true });
    const settings = ui.getByRole('tab', { name: 'SETTINGS' });
    expect(settings).toHaveAccessibilityState({ selected: false });
    fireEvent.press(settings);
    expect(navigate).toHaveBeenCalledWith('Settings');
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

  it('initializes a completed setup with a pending practice in its recovery screen', async () => {
    const intent = { reason: 'travel', region: 'all', target: 5 } as const;
    const handoff = {
      id: 'pending-practice',
      savedAt: Date.now(),
      intent,
      destination: { kind: 'study', id: 'deck-travel' },
    } as const;
    await completeOnboarding(intent, handoff);
    await renderNavigator();
    expect(mockStackNavigator.mock.calls[0][0]).toEqual(
      expect.objectContaining({ initialRouteName: 'Onboarding' }),
    );
    const screen = mockStackScreen.mock.calls.find(([props]) => props.name === 'Onboarding');
    expect(screen?.[0].initialParams).toEqual({ handoff });
  });

  it('starts at Home for earlier installs with no pending delivery', async () => {
    await completeOnboarding({ reason: 'general', region: 'all', target: 10 });
    await renderNavigator();
    expect(mockStackNavigator.mock.calls[0][0]).toEqual(
      expect.objectContaining({ initialRouteName: 'Root' }),
    );
  });

  it('allows retry after a failed launch read without skipping first-time setup', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failure'));
    const RootNavigator = require('../../src/navigation').default;
    const ui = render(<RootNavigator />);
    await ui.findByRole('alert');
    expect(mockStackNavigator).not.toHaveBeenCalled();
    fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(mockStackNavigator.mock.calls[0]?.[0]).toMatchObject({
        initialRouteName: 'Onboarding',
      }),
    );
  });

  it('registers only learner routes when the production developer-tools flag is off', async () => {
    mockShowReviewTools = false;
    await renderNavigator();
    expect(mockStackScreen.mock.calls.map(([props]) => props.name)).toEqual([
      'Onboarding',
      'ThemeSettings',
      'Library',
      'Root',
      'Adventures',
      'Adventure',
      'ReminderWord',
      'DailyPlan',
      'Notifications',
      'AudioPreferences',
      'LearningPreferences',
      'DailyGoal',
      'ManageDecks',
      'Quiz',
      'Phrasebook',
      'Phrases',
      'PhraseTopic',
      'AddCard',
      'Explore',
      'DifficultWords',
    ]);
  });

  it('registers all five developer surfaces only when development tools are on', async () => {
    await renderNavigator();
    expect(mockStackScreen.mock.calls.map(([props]) => props.name)).toEqual(
      expect.arrayContaining([
        'VoicePracticePreview',
        'ListeningPreview',
        'MissionPreview',
        'Review',
        'Flagged',
      ]),
    );
  });

  it('registers the Phrases screen while keeping Favorites available', async () => {
    await renderNavigator();

    const stackNames = mockStackScreen.mock.calls.map(([props]) => props.name);
    expect(stackNames).toContain('Phrases');
    expect(stackNames).toContain('Phrasebook');
  });
});
