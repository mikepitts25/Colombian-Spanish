import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Alert, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyPlanScreen from '../../src/screens/DailyPlanScreen';
import { startDailyPlan, readDailyPlan } from '../../src/storage/dailyPlans';
import * as missions from '../../src/storage/missions';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const windowMetrics = Dimensions.get('window'),
  screenMetrics = Dimensions.get('screen');
afterEach(() => act(() => Dimensions.set({ window: windowMetrics, screen: screenMetrics })));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
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
    t: (key: any, values: Record<string, string | number>) =>
      require('../../src/i18n/translations').translate('en', key, values),
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
  expect(ui.getByText('End plan')).toBeDisabled();
  fireEvent.press(ui.getByText('End plan'));
  expect(mockNavigate).not.toHaveBeenCalled();
  await act(async () => release());
  await ui.findByText('Correct');
  expect((await readDailyPlan())?.phase).toBe('applied');
  expect(ui.getByText('End plan')).not.toBeDisabled();
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
  expect(scrollParent(ui.getByText('End plan'))).toBe(scrollParent(input));
});

test('an unavailable saved content version keeps explicit End and Back recovery without creating a run', async () => {
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
  await ui.findByText('The activity in this plan is unavailable.');
  expect(ui.queryByText('Start draft reply')).toBeNull();
  expect((await readDailyPlan())?.applied?.runId).toBe('retained-run');
  fireEvent.press(ui.getByRole('button', { name: 'Back' }));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
  expect(await readDailyPlan()).toBeDefined();
  fireEvent.press(ui.getByText('End plan'));
  expect((await readDailyPlan())?.applied?.runId).toBe('retained-run');
  await act(async () => {
    (Alert.alert as jest.Mock).mock.calls
      .at(-1)![2]
      .find((button: { style?: string }) => button.style === 'destructive')
      .onPress();
  });
  await waitFor(async () => expect(await readDailyPlan()).toBeUndefined());
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_LEARNING_EVENTS_V1')).toBeNull();
});

test('Back during an applied activity leaves its durable checkpoint ready to resume', async () => {
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Start draft reply'));
  await ui.findByLabelText('Your response');
  const before = await AsyncStorage.getItem('SRS_MISSIONS_V1');
  fireEvent.press(ui.getByRole('button', { name: 'Back' }));
  expect(mockGoBack).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBe(before);
  expect((await readDailyPlan())?.applied?.runId).toBe('run');
  await expect(
    startDailyPlan({
      id: 'next-day',
      day: '2026-10-18',
      minutes: 3,
      createdAt: 2000,
      phase: 'applied',
      applied: { missionId: DAILY_RESPONSE.id, contentVersion: 1, runId: 'other' },
    }),
  ).rejects.toThrow('Unfinished daily plan');
});

test('finishing one written reply keeps its single credit when the summary is reopened', async () => {
  const ui = render(<DailyPlanScreen />);
  fireEvent.press(await ui.findByText('Start draft reply'));
  fireEvent.changeText(await ui.findByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByRole('button', { name: 'Check answer' }));
  const continueButton = await ui.findByRole('button', { name: 'Continue' });
  fireEvent.press(continueButton);
  fireEvent.press(continueButton);

  await ui.findByText('You practiced writing a morning greeting.');
  const finish = ui.getByRole('button', { name: 'Finish for today' });
  const earned = await getLearningEvents();
  expect(earned).toHaveLength(1);
  expect((await readDailyPlan())?.phase).toBe('complete');
  fireEvent.press(finish);
  expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
  ui.unmount();

  const reopened = render(<DailyPlanScreen />);
  await reopened.findByText('You practiced writing a morning greeting.');
  expect(await getLearningEvents()).toEqual(earned);
  expect((await readDailyPlan())?.applied?.runId).toBe('run');
});
