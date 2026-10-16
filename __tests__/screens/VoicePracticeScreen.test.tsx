import React from 'react';
import { AppState } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import VoicePracticeScreen from '../../src/screens/VoicePracticeScreen';
const mockBack = jest.fn(),
  mockRecorder = { id: 1 };
let mockPermission = jest.fn(),
  mockDiscard = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  useFocusEffect: (cb: any) => require('react').useEffect(cb, [cb]),
}));
jest.mock('expo-audio', () => ({
  useAudioRecorder: () => mockRecorder,
  RecordingPresets: { HIGH_QUALITY: {} },
}));
jest.mock('../../src/services/voicePractice', () => ({
  createVoicePorts: () => ({
    permission: () => mockPermission(),
    prepare: async () => {},
    begin: () => {},
    stopCapture: async () => {},
    clip: async () => ({ bytes: 1000, durationMs: 1500 }),
    discard: () => mockDiscard(),
    play: async () => {},
    stopPlayback: () => {},
    restoreMode: async () => {},
  }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, v: any) => require('../../src/i18n/translations').translate('en', key, v),
  }),
}));
jest.mock('../../src/config', () => ({ SHOW_REVIEW_TOOLS: true }));
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  mockPermission = jest.fn(async () => ({ granted: true, canAskAgain: true }));
  mockDiscard = jest.fn(async () => {});
});
test('explains local unscored practice without requesting permission on open; text alternative stays available', async () => {
  const ui = render(<VoicePracticeScreen />);
  expect(mockPermission).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Practice without recording'));
  expect(ui.getByText('buenos días')).toBeTruthy();
  expect(mockPermission).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText('Record up to 30 seconds'));
  await ui.findByText('Recording');
  expect(mockPermission).toHaveBeenCalledTimes(1);
  fireEvent.press(ui.getByText('Stop'));
  await ui.findByText('Ready to replay');
  fireEvent.press(ui.getByText('Replay my take'));
  await ui.findByText('Replay started');
  fireEvent.press(ui.getByText('Stop'));
  await ui.findByText('Ready to replay');
  fireEvent.press(ui.getByText('Delete my take'));
  await ui.findByText('Ready to record');
  expect(mockDiscard).toHaveBeenCalled();
});
test('denied microphone has a usable text alternative and Back', async () => {
  mockPermission.mockResolvedValue({ granted: false, canAskAgain: false });
  const ui = render(<VoicePracticeScreen />);
  fireEvent.press(ui.getByText('Record up to 30 seconds'));
  await ui.findByText('Microphone access was denied. You can practice without recording.');
  expect(ui.getByText('Open app settings')).toBeTruthy();
  fireEvent.press(ui.getByText('Practice without recording'));
  expect(ui.getByText('buenos días')).toBeTruthy();
  fireEvent.press(ui.getByText('Back'));
  await act(async () => {});
  expect(mockBack).toHaveBeenCalled();
});
test('failed deletion remains visible for explicit retry and cannot silently overwrite', async () => {
  const ui = render(<VoicePracticeScreen />);
  fireEvent.press(ui.getByText('Record up to 30 seconds'));
  await ui.findByText('Recording');
  fireEvent.press(ui.getByText('Stop'));
  await ui.findByText('Ready to replay');
  mockDiscard.mockRejectedValueOnce(new Error('file'));
  fireEvent.press(ui.getByText('Delete my take'));
  await ui.findByText(
    'Audio action failed. Stop or delete the take to retry; text practice remains available.',
  );
  expect(ui.getByRole('button', { name: 'Record up to 30 seconds' })).toHaveAccessibilityState({
    disabled: true,
  });
  fireEvent.press(ui.getByText('Delete my take'));
  await ui.findByText('Ready to record');
});

afterEach(() => jest.restoreAllMocks());
