import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListeningScreen from '../../src/screens/ListeningScreen';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { speakCard, stop } from '../../src/services/tts';
import { loadMissionRun } from '../../src/storage/missions';
import { LISTENING_BASICS } from '../../src/missions/listeningBasics';
const mockBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(async () => ({ source: 'generated', loop: false })),
  stop: jest.fn(),
}));
jest.mock('../../src/config', () => ({ SHOW_REVIEW_TOOLS: true }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: any, v: any) => require('../../src/i18n/translations').translate('en', key, v),
  }),
}));
jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: () => ({
    ready: true,
    decks: [
      { id: 'deck-greetings', cards: [{ id: '0010', front: 'buenos días', back: 'good morning' }] },
      {
        id: 'deck-food',
        cards: [
          { id: '0024', front: 'café', back: 'coffee' },
          { id: '0025', front: 'agua', back: 'water' },
        ],
      },
    ],
  }),
}));
beforeEach(async () => {
  jest.clearAllMocks();
  (speakCard as jest.Mock).mockResolvedValue({ source: 'generated', loop: false });
  await AsyncStorage.clear();
});
async function begin() {
  const ui = render(<ListeningScreen />);
  fireEvent.press(await ui.findByText('Start draft mission'));
  await ui.findByText('A morning greeting');
  return ui;
}
async function play(ui: ReturnType<typeof render>) {
  fireEvent.press(ui.getByText('Play / replay'));
  await waitFor(() =>
    expect(ui.getByText('Good morning').parent).toHaveAccessibilityState({
      disabled: false,
      busy: false,
    }),
  );
  await act(async () => {});
}
test('hides Spanish until requested, requires playback, records transcript assistance and resumes it', async () => {
  const ui = await begin();
  expect(ui.queryByText('buenos días')).toBeNull();
  fireEvent.press(ui.getByText('Good morning'));
  expect(await getLearningEvents()).toHaveLength(0);
  fireEvent.press(ui.getByText('Show transcript'));
  await ui.findByText('buenos días');
  await play(ui);
  expect(speakCard).toHaveBeenCalledWith(
    { id: '0010', front: 'buenos días' },
    expect.objectContaining({ requireBundled: true }),
  );
  fireEvent.press(ui.getByText('Good morning'));
  await ui.findByText('Correct');
  expect((await getLearningEvents())[0]).toMatchObject({
    modality: 'listening',
    transcriptAssisted: true,
    audio: { kind: 'generated' },
  });
  ui.unmount();
  const next = render(<ListeningScreen />);
  await next.findByText('Correct');
  expect(next.getByText('buenos días')).toBeTruthy();
  expect(await getLearningEvents()).toHaveLength(1);
});
test('completes all clips with distinct evidence and no flashcard counters', async () => {
  const ui = await begin();
  await play(ui);
  fireEvent.press(ui.getByText('Good morning'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('At the café');
  fireEvent.press(ui.getByText('Play / replay'));
  await waitFor(() =>
    expect(ui.getByText('Coffee').parent).toHaveAccessibilityState({
      disabled: false,
      busy: false,
    }),
  );
  await act(async () => {});
  fireEvent.press(ui.getByText('Coffee'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Another drink');
  expect(ui.queryByText('agua')).toBeNull();
  fireEvent.press(ui.getByText('Play / replay'));
  await waitFor(() =>
    expect(ui.getByText('Water').parent).toHaveAccessibilityState({ disabled: false, busy: false }),
  );
  await act(async () => {});
  fireEvent.press(ui.getByText('Water'));
  await ui.findByText('Correct');
  fireEvent.press(ui.getByText('Continue'));
  await ui.findByText('Listening practice complete');
  const events = await getLearningEvents();
  expect(events).toHaveLength(3);
  expect(events.every((e) => e.modality === 'listening' && e.transcriptAssisted === false)).toBe(
    true,
  );
  expect(await AsyncStorage.getItem('SRS_DAILY_PROGRESS_V1')).toBeNull();
});
test('audio failure cannot enable an answer or fall back silently; retry is explicit', async () => {
  const ui = await begin();
  (speakCard as jest.Mock).mockRejectedValueOnce(new Error('missing clip'));
  fireEvent.press(ui.getByText('Play / replay'));
  await ui.findByText('Could not play the bundled clip. Try replaying or return to text practice.');
  fireEvent.press(ui.getByText('Good morning'));
  expect(await getLearningEvents()).toHaveLength(0);
  await play(ui);
});
test('Stop and unmount cancel pending audio without recording playback', async () => {
  let release!: (v: any) => void;
  const ui = await begin();
  (speakCard as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  fireEvent.press(ui.getByText('Play / replay'));
  fireEvent.press(ui.getByText('Stop audio'));
  await act(async () => release({ source: 'generated', loop: false }));
  expect((await loadMissionRun(LISTENING_BASICS)).run?.audioPlayed).toBe(false);
  ui.unmount();
  expect(stop).toHaveBeenCalled();
});
