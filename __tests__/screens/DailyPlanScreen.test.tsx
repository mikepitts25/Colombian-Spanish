import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import DailyPlanScreen from '../../src/screens/DailyPlanScreen';
const mockNavigate = jest.fn();
let mockPlan: any;
let mockDraft = true;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
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
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
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
test('production cannot execute the draft and explicit end keeps learning progress', async () => {
  mockDraft = false;
  const ui = render(<DailyPlanScreen />);
  await ui.findByText(
    'This activity is unavailable in this build. You can end the plan and keep your learning progress.',
  );
  expect(ui.queryByTestId('mission-identity')).toBeNull();
  fireEvent.press(ui.getByText('End plan (keep learning progress)'));
  await waitFor(() =>
    expect(require('../../src/storage/dailyPlans').abandonDailyPlan).toHaveBeenCalledWith('one'),
  );
  expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
});
test('review resume keeps the assigned plan and completed plans show honest completion', async () => {
  mockPlan.phase = 'review';
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Continue daily plan'));
  expect(mockNavigate).toHaveBeenCalledWith(
    'Root',
    { screen: 'Study', params: { dailyPlanId: 'one' } },
    { pop: true },
  );
  ui.unmount();
  mockPlan.phase = 'complete';
  const done = render(<DailyPlanScreen />);
  await done.findByText('Your planned practice is complete.');
  expect(done.queryByTestId('mission-identity')).toBeNull();
});

test('a first read failure shows a retry rather than an endless loading state', async () => {
  require('../../src/storage/dailyPlans').readDailyPlan.mockRejectedValueOnce(new Error('disk'));
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Retry'));
  await ui.findByText('one:exact');
});
