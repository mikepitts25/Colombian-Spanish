import { renderWithTheme } from '../../testFixtures/renderWithTheme';
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { AppState, AppStateStatus } from 'react-native';
import { DAILY_RESPONSE } from '../../src/missions/dailyResponse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MissionScreen from '../../src/screens/MissionScreen';
import { FIRST_MORNING } from '../../src/missions/firstMorning';
import * as missionStorage from '../../src/storage/missions';
import { getLearningEvents } from '../../src/storage/learningEvents';
const mockBack = jest.fn();
let mockPreview = true;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/config', () => ({
  get SHOW_REVIEW_TOOLS() {
    return mockPreview;
  },
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
  }),
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({
    ready: true,
    decks: [
      {
        id: 'deck-greetings',
        cards: [
          {
            id: '0010',
            front: 'buenos días',
            back: 'good morning',
            example: 'Buenos días. | Good morning.',
          },
        ],
      },
      {
        id: 'deck-food',
        cards: [
          { id: '0024', front: 'café', back: 'coffee' },
          { id: '0025', front: 'agua', back: 'water' },
        ],
      },
      { id: 'deck-conversation', cards: [{ id: '1148' }] },
    ],
  }),
}));
beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  mockPreview = true;
  await AsyncStorage.clear();
});
async function begin() {
  const ui = renderWithTheme(<MissionScreen />);
  fireEvent.press(await ui.findByText('Start draft mission'));
  await ui.findByText('At the café');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Greet the staff');
  return ui;
}
async function submit(ui: ReturnType<typeof render>, answer: string) {
  fireEvent.changeText(ui.getByLabelText('Your response'), answer);
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
}
test('choice actions keep stable React list keys', async () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const ui = await begin();
  await submit(ui, 'Buenos días');
  await ui.findByText('Ask for coffee');
  await submit(ui, 'Un café, por favor');
  await ui.findByText('Accept water');
  const keyWarnings = errors.mock.calls.filter((args) =>
    args.some((value) => String(value).includes('unique "key"')),
  );
  expect(keyWarnings).toHaveLength(0);
});

test('complete draft flow records three assessed recalls and one recognition without changing daily/SRS state', async () => {
  const ui = await begin();
  await submit(ui, 'Buenos días');
  await ui.findByText('Ask for coffee');
  await submit(ui, 'Un café, por favor');
  fireEvent.press(await ui.findByText('Accept water'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Close the exchange');
  await submit(ui, 'gracias');
  await ui.findByText('Practice complete');
  expect(ui.getByText('Finished without recorded hints or errors.')).toBeTruthy();
  const events = await getLearningEvents();
  expect(events).toHaveLength(4);
  expect(events.filter((e) => e.modality === 'recall')).toHaveLength(3);
  expect(events.every((e) => e.missionId === FIRST_MORNING.id)).toBe(true);
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBeNull();
});
test('retains failed submission for retry and resumes exact feedback without persisting raw text', async () => {
  const ui = await begin();
  jest.spyOn(missionStorage, 'applyMissionCommand').mockRejectedValueOnce(new Error('disk full'));
  fireEvent.changeText(ui.getByLabelText('Your response'), 'buenos dias');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Could not save this step. Retry to continue.');
  ui.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(ui.getByLabelText('Your response')).toHaveProp('value', 'buenos dias');
  expect(ui.getByLabelText('Your response')).toHaveStyle({ color: '#18352F' });
  fireEvent.press(ui.getByText('Retry save'));
  await ui.findByText('Check the accents');
  const state = (await missionStorage.loadMissionRun(FIRST_MORNING)).run!;
  expect(state.assisted).toBe(true);
  expect(await getLearningEvents()).toHaveLength(1);
  ui.unmount();
  const resumed = render(<MissionScreen />);
  await resumed.findByText('Check the accents');
  expect(resumed.queryByLabelText('Your response')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).not.toContain('buenos dias');
});
test('hints are counted on explicit retries and incorrect answers permit assisted continuation', async () => {
  const ui = await begin();
  fireEvent.press(ui.getByText('Hint'));
  await ui.findByText('Begin with buenos…');
  fireEvent.changeText(ui.getByLabelText('Your response'), 'hola');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Try the correction');
  fireEvent.press(ui.getByText('Try again'));
  await waitFor(() => expect(ui.getByLabelText('Your response')).toBeTruthy());
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Correct');
  expect((await getLearningEvents()).map((e) => e.hintsUsed)).toEqual([1, 1]);
});
test('load failure offers retry and production gate prevents accessing draft content', async () => {
  jest.spyOn(missionStorage, 'loadMissionRun').mockRejectedValueOnce(new Error('read failure'));
  const ui = render(<MissionScreen />);
  await ui.findByText('Could not load the saved mission.');
  expect(ui.queryByText('Start draft mission')).toBeNull();
  fireEvent.press(ui.getByText('Retry'));
  await ui.findByText('Start draft mission');
  ui.unmount();
  mockPreview = false;
  const blocked = render(<MissionScreen />);
  expect(blocked.getByText('Mission preview is unavailable.')).toBeTruthy();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBeNull();
});
test('blocks rapid actions and local exit during a pending checkpoint', async () => {
  let release!: () => void;
  const original = missionStorage.startMissionRun;
  jest.spyOn(missionStorage, 'startMissionRun').mockImplementationOnce(
    (...args) =>
      new Promise((resolve) => {
        release = () => {
          void original(...args).then(resolve);
        };
      }),
  );
  const ui = render(<MissionScreen />);
  fireEvent.press(await ui.findByText('Start draft mission'));
  fireEvent.press(ui.getByText('Start draft mission'));
  fireEvent.press(ui.getByText('Back'));
  expect(missionStorage.startMissionRun).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
  await act(async () => release());
  await ui.findByText('At the café');
});

test('preserves partial input when revealing a hint', async () => {
  const ui = await begin();
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos');
  fireEvent.press(ui.getByText('Hint'));
  await ui.findByText('Begin with buenos…');
  expect(ui.getByLabelText('Your response')).toHaveProp('value', 'Buenos');
});

test('allows local exit after a settled checkpoint failure while retaining retry', async () => {
  const ui = await begin();
  jest
    .spyOn(missionStorage, 'applyMissionCommand')
    .mockRejectedValue(new Error('storage unavailable'));
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Could not save this step. Retry to continue.');
  fireEvent.press(ui.getByText('Back'));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(ui.getByText('Retry save')).toBeTruthy();
});

test('offers difficult-phrase recall/reveal without writing extra events or changing the completed checkpoint', async () => {
  const ui = await begin();
  fireEvent.changeText(ui.getByLabelText('Your response'), 'hola');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Try the correction');
  fireEvent.press(ui.getByText('Continue with help'));
  await ui.findByText('Ask for coffee');
  fireEvent.changeText(ui.getByLabelText('Your response'), 'wrong');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Try the correction');
  fireEvent.press(ui.getByText('Continue with help'));
  fireEvent.press(await ui.findByText('Accept water'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Close the exchange');
  await submit(ui, 'gracias');
  await ui.findByText('Practice complete');
  const before = await AsyncStorage.getItem('SRS_MISSIONS_V1');
  const events = await getLearningEvents();
  fireEvent.press(ui.getByText('Review these phrases'));
  await ui.findByText('good morning');
  expect(ui.queryByText('buenos días')).toBeNull();
  fireEvent.press(ui.getByText('Reveal phrase'));
  expect(ui.getByText('buenos días')).toBeTruthy();
  fireEvent.press(ui.getByText('Next phrase'));
  expect(ui.getByText('coffee')).toBeTruthy();
  expect(ui.queryByText('café')).toBeNull();
  fireEvent.press(ui.getByText('Reveal phrase'));
  expect(ui.getByText('café')).toBeTruthy();
  fireEvent.press(ui.getByText('Return to mission'));
  expect(ui.getByText('Practice complete')).toBeTruthy();
  fireEvent.press(ui.getByText('Review these phrases'));
  expect(ui.getByText('good morning')).toBeTruthy();
  expect(ui.queryByText('buenos días')).toBeNull();
  expect(await AsyncStorage.getItem('SRS_MISSIONS_V1')).toBe(before);
  expect(await getLearningEvents()).toEqual(events);
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
});

test('a linked one-response activity starts its planned run and completes only that plan', async () => {
  const { DAILY_RESPONSE } = require('../../src/missions/dailyResponse');
  const { startDailyPlan, readDailyPlan } = require('../../src/storage/dailyPlans');
  await startDailyPlan({
    id: 'daily',
    day: '2026-10-17',
    minutes: 3,
    createdAt: 1000,
    phase: 'applied',
    applied: { missionId: DAILY_RESPONSE.id, contentVersion: 1, runId: 'planned' },
  });
  const completed = jest.fn();
  const ui = render(
    <MissionScreen
      pack={DAILY_RESPONSE}
      planId="daily"
      planRunId="planned"
      onCompleted={completed}
    />,
  );
  fireEvent.press(await ui.findByText('Start draft reply'));
  await ui.findByText('Greet the staff');
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await waitFor(() => expect(completed).toHaveBeenCalledTimes(1));
  expect((await readDailyPlan()).phase).toBe('complete');
  expect((await getLearningEvents())[0].sessionId).toBe('planned');
  expect(ui.queryByText('Practice again')).toBeNull();
});

test('times only actionable foreground segments, preserving hint/save retry timing without counting waits', async () => {
  let clock = 0;
  let change!: (s: AppStateStatus) => void;
  jest.spyOn(performance, 'now').mockImplementation(() => clock);
  Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, fn) => {
    if (event === 'change') change = fn;
    return { remove: jest.fn() };
  });
  const ui = render(<MissionScreen pack={DAILY_RESPONSE} />);
  fireEvent.press(await ui.findByText('Start draft mission'));
  await ui.findByText('Greet the staff');
  clock = 2000;
  fireEvent.press(ui.getByText('Hint'));
  await ui.findByText('Begin with buenos…');
  act(() => change('background'));
  clock = 62000;
  act(() => change('active'));
  clock = 65000;
  const apply = jest
    .spyOn(missionStorage, 'applyMissionCommand')
    .mockRejectedValueOnce(new Error('disk'));
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  fireEvent.press(ui.getByText('Check answer'));
  await ui.findByText('Could not save this step. Retry to continue.');
  expect(apply.mock.calls[0][1].activeDurationMs).toBe(3000);
  clock = 95000;
  fireEvent.press(ui.getByText('Retry save'));
  await ui.findByText('Correct');
  expect(apply.mock.calls[1][1]).toEqual(apply.mock.calls[0][1]);
  clock = 150000;
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Reply practiced');
  expect(await missionStorage.readActivityTimings()).toEqual([
    expect.objectContaining({ durationMs: 5000 }),
  ]);
});
test.each([false, true])(
  'cold response resume with feedback=%s never invents a lost timing segment',
  async (feedback) => {
    let clock = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => clock);
    Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
    const ui = render(<MissionScreen pack={DAILY_RESPONSE} />);
    fireEvent.press(await ui.findByText('Start draft mission'));
    await ui.findByText('Greet the staff');
    clock = 5000;
    if (feedback) {
      fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
      fireEvent.press(ui.getByText('Check answer'));
      await ui.findByText('Correct');
    }
    ui.unmount();
    clock = 80000;
    const resumed = render(<MissionScreen pack={DAILY_RESPONSE} />);
    if (!feedback) {
      await resumed.findByLabelText('Your response');
      clock = 85000;
      fireEvent.changeText(resumed.getByLabelText('Your response'), 'Buenos días');
      fireEvent.press(resumed.getByText('Check answer'));
    }
    await resumed.findByText('Correct');
    fireEvent.press(resumed.getByText('Continue'));
    await resumed.findByText('Reply practiced');
    expect(await missionStorage.readActivityTimings()).toHaveLength(feedback ? 1 : 0);
  },
);

test('notifies the parent when a pending save settles even after the player unmounts', async () => {
  let release!: () => void;
  const original = missionStorage.startMissionRun;
  jest.spyOn(missionStorage, 'startMissionRun').mockImplementationOnce(
    (...args) =>
      new Promise((resolve) => {
        release = () => {
          void original(...args).then(resolve);
        };
      }),
  );
  const changed = jest.fn();
  const ui = render(<MissionScreen onSavingChange={changed} />);
  fireEvent.press(await ui.findByText('Start draft mission'));
  expect(changed.mock.calls).toEqual([[true]]);
  ui.unmount();
  await act(async () => release());
  await waitFor(() => expect(changed.mock.calls).toEqual([[true], [false]]));
});

test('a held response checkpoint retains draft and exactly one command across identity changes', async () => {
  const ui = await begin();
  fireEvent.changeText(ui.getByLabelText('Your response'), 'Buenos días');
  const original = missionStorage.applyMissionCommand;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const command = jest
    .spyOn(missionStorage, 'applyMissionCommand')
    .mockImplementation(async (...args) => {
      await pending;
      return original(...args);
    });
  try {
    fireEvent.press(ui.getByText('Check answer'));
    ui.applyTheme({ themeId: 'barrio', appearanceMode: 'dark' });
    expect(ui.getByLabelText('Your response')).toHaveProp('value', 'Buenos días');
    expect(ui.getByLabelText('Your response')).toHaveStyle({ color: '#F7F3EA' });
    fireEvent.press(ui.getByText('Check answer'));
    expect(command).toHaveBeenCalledTimes(1);
    await act(async () => release());
    await ui.findByText('Correct');
    const events = await getLearningEvents();
    expect(events).toHaveLength(1);
    ui.applyTheme({ themeId: 'classic', appearanceMode: 'system' });
    expect(await getLearningEvents()).toEqual(events);
  } finally {
    release();
  }
});
