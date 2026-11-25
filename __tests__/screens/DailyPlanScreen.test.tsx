import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DailyPlanScreen from '../../src/screens/DailyPlanScreen';
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockPlan: any;
let mockDraft = true;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { planId: 'one' } }),
  useFocusEffect: (cb: any) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/config', () => ({
  get SHOW_REVIEW_TOOLS() {
    return mockDraft;
  },
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: require('../../src/data/decks').ALL_DECKS }),
}));
jest.mock('../../src/storage/dailyPlans', () => ({
  readDailyPlan: jest.fn(async () => mockPlan),
  abandonDailyPlan: jest.fn(async () => {}),
}));
jest.mock('../../src/screens/MissionScreen', () => ({
  __esModule: true,
  default: (props: any) => (
    <>
      {require('react').createElement(
        require('react-native').Text,
        { testID: 'mission-identity' },
        `${props.planId}:${props.planRunId}`,
      )}
    </>
  ),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: any, values: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
beforeEach(() => {
  jest.clearAllMocks();
  mockDraft = true;
  mockPlan = {
    id: 'one',
    phase: 'applied',
    applied: { missionId: 'daily-morning-greeting', contentVersion: 1, runId: 'exact' },
  };
});
test('hands the exact persisted identity to the applied player', async () => {
  const ui = render(<DailyPlanScreen />);
  await ui.findByText('one:exact');
});
test('an unavailable production activity offers other practice and confirms early end', async () => {
  mockDraft = false;
  const ui = render(<DailyPlanScreen />);
  const browse = await ui.findByRole('button', { name: 'Browse practice' });
  expect(ui.queryByTestId('mission-identity')).toBeNull();
  fireEvent.press(browse);
  expect(mockNavigate).toHaveBeenCalledWith(
    'Root',
    { screen: 'Study', params: { topicBrowserRequest: expect.any(String) } },
    { pop: true },
  );
  const { abandonDailyPlan } = require('../../src/storage/dailyPlans');
  expect(abandonDailyPlan).not.toHaveBeenCalled();

  expect(ui.getByText('End plan')).toHaveStyle({ color: '#f87171' });
  fireEvent.press(ui.getByRole('button', { name: 'End plan' }));
  const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls.at(-1)!;
  expect(title).toBe('End this plan?');
  expect(message).toMatch(/saved learning progress/i);
  expect(abandonDailyPlan).not.toHaveBeenCalled();
  buttons.find((button: { style?: string }) => button.style === 'cancel').onPress?.();
  expect(abandonDailyPlan).not.toHaveBeenCalled();

  fireEvent.press(ui.getByRole('button', { name: 'End plan' }));
  await act(async () => {
    (Alert.alert as jest.Mock).mock.calls
      .at(-1)![2]
      .find((button: { style?: string }) => button.style === 'destructive')
      .onPress();
  });
  await waitFor(() => expect(abandonDailyPlan).toHaveBeenCalledWith('one'));
  expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
});
test('review resume keeps the assigned plan and Back leaves its checkpoint untouched', async () => {
  mockPlan.phase = 'review';
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByRole('button', { name: 'Resume my plan' }));
  expect(mockNavigate).toHaveBeenCalledWith(
    'Root',
    { screen: 'Study', params: { dailyPlanId: 'one' } },
    { pop: true },
  );
  fireEvent.press(ui.getByRole('button', { name: 'Back' }));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
  expect(require('../../src/storage/dailyPlans').abandonDailyPlan).not.toHaveBeenCalled();
});
test('completion describes the reviewed cards and lets the learner finish for today', async () => {
  mockPlan = {
    id: 'one',
    phase: 'complete',
    review: {
      initialCardIds: ['card-a', 'card-b'],
      session: { deckId: 'deck-food', queue: { cardIds: [] } },
    },
  };
  const done = render(<DailyPlanScreen />);
  await done.findByText('Reviewed 2 cards in Food & Drink.');
  expect(done.queryByTestId('mission-identity')).toBeNull();
  expect(done.queryByRole('button', { name: 'End plan' })).toBeNull();
  expect(done.getByRole('button', { name: 'Browse practice' })).toBeTruthy();
  fireEvent.press(done.getByRole('button', { name: 'Finish for today' }));
  expect(mockNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
});
test('a first read failure shows a retry rather than an endless loading state', async () => {
  require('../../src/storage/dailyPlans').readDailyPlan.mockRejectedValueOnce(new Error('disk'));
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Retry'));
  await ui.findByText('one:exact');
});
