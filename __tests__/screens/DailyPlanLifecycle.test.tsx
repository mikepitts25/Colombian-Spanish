import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyPlanScreen from '../../src/screens/DailyPlanScreen';
import { startDailyPlan, readDailyPlan } from '../../src/storage/dailyPlans';
import * as missions from '../../src/storage/missions';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
const mockNavigate = jest.fn();
const windowMetrics = Dimensions.get('window'),
  screenMetrics = Dimensions.get('screen');
afterEach(() => act(() => Dimensions.set({ window: windowMetrics, screen: screenMetrics })));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: { planId: 'plan' } }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/config', () => ({ SHOW_REVIEW_TOOLS: true }));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({ ready: true, decks: require('../../src/data/decks').ALL_DECKS }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
  }),
}));
beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await startDailyPlan({
    id: 'plan',
    day: '2026-10-17',
    minutes: 3,
    createdAt: 1000,
    phase: 'applied',
    applied: { missionId: DAILY_RESPONSE.id, contentVersion: 1, runId: 'run' },
  });
});
test('cannot end the parent plan while the assigned response answer is being committed', async () => {
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Start draft reply'));
  await ui.findByLabelText('Your response');
  let release!: () => void;
  const original = missions.applyMissionCommand;
  jest.spyOn(missions, 'applyMissionCommand').mockImplementationOnce(
    (...args) =>
      new Promise((resolve) => {
        release = () => {
          void original(...args).then(resolve);
        };
      }),
  );
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByText('Check answer'));
  act(() =>
    Dimensions.set({
      window: { ...windowMetrics, fontScale: 3 },
      screen: { ...screenMetrics, fontScale: 3 },
    }),
  );
  expect(ui.getByText('End plan (keep learning progress)')).toBeDisabled();
  fireEvent.press(ui.getByText('End plan (keep learning progress)'));
  expect(mockNavigate).not.toHaveBeenCalled();
  await act(async () => release());
  await ui.findByText('Correct');
  expect((await readDailyPlan())?.phase).toBe('applied');
  expect(ui.getByText('End plan (keep learning progress)')).not.toBeDisabled();
});

test('live text-size reflow keeps the entered answer and exact applied identity without extra writes', async () => {
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Start draft reply'));
  await ui.findByLabelText('Your response');
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos');
  const saved = await AsyncStorage.getItem('SRS_MISSIONS_V1');
  act(() =>
    Dimensions.set({
      window: { ...windowMetrics, fontScale: 3 },
      screen: { ...screenMetrics, fontScale: 3 },
    }),
  );
  expect(ui.getByLabelText('Your response')).toHaveProp('value', 'Buenos');
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBe(saved);
  expect((await readDailyPlan())?.applied?.runId).toBe('run');
  act(() => Dimensions.set({ window: windowMetrics, screen: screenMetrics }));
  await waitFor(() => expect(ui.getByLabelText('Your response')).toHaveProp('value', 'Buenos'));
});

test('plan recovery action shares the response scroll area instead of consuming a fixed pane', async () => {
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Start draft reply'));
  const input = await ui.findByLabelText('Your response');
  const scrollParent = (element: any): any => {
    for (let node = element; node; node = node.parent) if (node.type === ScrollView) return node;
    return undefined;
  };
  expect(scrollParent(input)).toBeDefined();
  expect(scrollParent(ui.getByText('End plan (keep learning progress)'))).toBe(scrollParent(input));
});

test('an unavailable saved content version keeps explicit End/Home recovery without creating a run', async () => {
  await AsyncStorage.clear();
  await startDailyPlan({
    id: 'plan',
    day: '2001-01-01',
    minutes: 3,
    createdAt: 1000,
    phase: 'applied',
    applied: { missionId: DAILY_RESPONSE.id, contentVersion: 99, runId: 'retained-run' },
  });
  const ui = render(<DailyPlanScreen />);
  await ui.findByText(
    'This activity is unavailable in this build. You can end the plan and keep your learning progress.',
  );
  expect(ui.queryByText('Start draft reply')).toBeNull();
  expect((await readDailyPlan())?.applied?.runId).toBe('retained-run');
  fireEvent.press(ui.getByText('Return Home'));
  expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
  expect(await readDailyPlan()).toBeDefined();
  fireEvent.press(ui.getByText('End plan (keep learning progress)'));
  await waitFor(async () => expect(await readDailyPlan()).toBeUndefined());
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1')).toBeNull();
});
