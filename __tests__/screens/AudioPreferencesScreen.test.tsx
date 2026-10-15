import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPreferencesScreen from '../../src/screens/AudioPreferencesScreen';
import * as prefs from '../../src/storage/prefs';
import { speakCard, stop } from '../../src/services/tts';
const mockBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, [cb]),
}));
jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(async () => ({ source: 'generated', loop: false })),
  stop: jest.fn(),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values: any) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
test('loads existing speed, previews selected unsaved speed and explicitly saves only that preference', async () => {
  await prefs.setPrefs({ speechRate: 1.25, learningReason: 'travel' });
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save speed');
  fireEvent.press(ui.getByText('0.75×'));
  fireEvent.press(ui.getByText('Preview pronunciation'));
  await ui.findByText('Source: generated clip');
  expect(speakCard).toHaveBeenCalledWith(
    { id: '0010', front: 'buenos días' },
    { rate: 0.75, loop: false },
  );
  expect((await prefs.getPrefs()).speechRate).toBe(1.25);
  fireEvent.press(ui.getByText('Save speed'));
  await ui.findByText('Speed saved.');
  expect(await prefs.getPrefs()).toMatchObject({ speechRate: 0.75, learningReason: 'travel' });
  ui.unmount();
  expect(stop).toHaveBeenCalled();
});
test('explicit repeat is labeled and stop cancels a pending preview without stale status', async () => {
  let release!: (x: any) => void;
  (speakCard as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save speed');
  fireEvent.press(ui.getByRole('switch'));
  fireEvent.press(ui.getByText('Preview pronunciation'));
  expect(speakCard).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ loop: true }),
  );
  fireEvent.press(ui.getByText('Stop audio'));
  await act(async () => release({ source: 'generated', loop: true }));
  expect(ui.queryByText('Source: generated clip')).toBeNull();
  expect(stop).toHaveBeenCalled();
});
test('load failure offers retry without editable defaults or writes; save failure retains selection', async () => {
  jest.spyOn(prefs, 'getPrefs').mockRejectedValueOnce(new Error('read'));
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Could not load audio preferences.');
  expect(ui.queryByText('Save speed')).toBeNull();
  fireEvent.press(ui.getByText('Retry'));
  await ui.findByText('Save speed');
  fireEvent.press(ui.getByText('1.25×'));
  jest.spyOn(prefs, 'setPrefs').mockRejectedValueOnce(new Error('full'));
  fireEvent.press(ui.getByText('Save speed'));
  await ui.findByText('Could not save. Your selection is still here.');
  fireEvent.press(ui.getByText('Save speed'));
  await ui.findByText('Speed saved.');
  expect((await prefs.getPrefs()).speechRate).toBe(1.25);
});
test('reports device fallback and its single-play limit honestly', async () => {
  (speakCard as jest.Mock).mockResolvedValueOnce({ source: 'device', loop: false });
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save speed');
  fireEvent.press(ui.getByRole('switch'));
  fireEvent.press(ui.getByText('Preview pronunciation'));
  await ui.findByText('Source: device speech · plays once');
});
