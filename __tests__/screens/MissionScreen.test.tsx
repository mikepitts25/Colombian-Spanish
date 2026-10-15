import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MissionScreen from '../../src/screens/MissionScreen';
import { FIRST_MORNING } from '../../src/missions/firstMorning';
import * as missionStorage from '../../src/storage/missions';
import { getLearningEvents } from '../../src/storage/learningEvents';
const mockBack = jest.fn();
let mockPreview = true;
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: mockBack }) }));
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
      { id: 'deck-greetings', cards: [{ id: '0010' }] },
      { id: 'deck-food', cards: [{ id: '0024' }, { id: '0025' }] },
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
  const ui = render(<MissionScreen />);
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
  expect(ui.getByLabelText('Your response')).toHaveProp('value', 'buenos dias');
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
