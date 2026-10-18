import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPreferencesScreen from '../../src/screens/AudioPreferencesScreen';
import * as prefs from '../../src/storage/prefs';
import { speakCard, stop } from '../../src/services/tts';
const mockBack = jest.fn();
const originalWindow = Dimensions.get('window');
afterEach(() => act(() => Dimensions.set({ window: originalWindow })));
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
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByText('0.75×'));
  fireEvent.press(ui.getByText('Preview pronunciation'));
  await ui.findByText('Source: generated clip');
  expect(speakCard).toHaveBeenCalledWith(
    { id: '0010', front: 'buenos días' },
    { rate: 0.75, loop: false },
  );
  expect((await prefs.getPrefs()).speechRate).toBe(1.25);
  fireEvent.press(ui.getByText('Save audio preferences'));
  await ui.findByText('Audio preferences saved.');
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
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByRole('switch', { name: 'Repeat clip' }));
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
  expect(ui.queryByText('Save audio preferences')).toBeNull();
  fireEvent.press(ui.getByText('Retry'));
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByText('1.25×'));
  jest.spyOn(prefs, 'setPrefs').mockRejectedValueOnce(new Error('full'));
  fireEvent.press(ui.getByText('Save audio preferences'));
  await ui.findByText('Could not save. Your selection is still here.');
  fireEvent.press(ui.getByText('Save audio preferences'));
  await ui.findByText('Audio preferences saved.');
  expect((await prefs.getPrefs()).speechRate).toBe(1.25);
});
test('reports device fallback and its single-play limit honestly', async () => {
  (speakCard as jest.Mock).mockResolvedValueOnce({ source: 'device', loop: false });
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByRole('switch', { name: 'Repeat clip' }));
  fireEvent.press(ui.getByText('Preview pronunciation'));
  await ui.findByText('Source: device speech · plays once');
});

test('automatic speech is opt-in, saved with speed, and does not play on enabling or reopening', async () => {
  await prefs.setPrefs({ autoSpeak: false, speechRate: 1.25, learningReason: 'travel' });
  const ui = render(<AudioPreferencesScreen />);
  const toggle = await ui.findByRole('switch', { name: 'Speak after revealing a flashcard' });
  expect(toggle).toHaveAccessibilityState({ checked: false });
  fireEvent.press(toggle);
  expect((await prefs.getPrefs()).autoSpeak).toBe(false);
  fireEvent.press(ui.getByText('Save audio preferences'));
  await ui.findByText('Audio preferences saved.');
  expect(await prefs.getPrefs()).toMatchObject({
    autoSpeak: true,
    speechRate: 1.25,
    learningReason: 'travel',
  });
  expect(speakCard).not.toHaveBeenCalled();
  ui.unmount();
  const next = render(<AudioPreferencesScreen />);
  expect(
    await next.findByRole('switch', { name: 'Speak after revealing a flashcard' }),
  ).toHaveAccessibilityState({ checked: true });
  expect(speakCard).not.toHaveBeenCalled();
});

test('retains unsaved speed, automatic speech and one pending save across live font changes', async () => {
  await prefs.setPrefs({ autoSpeak: false, speechRate: 0.98, learningReason: 'travel' });
  const originalSave = prefs.setPrefs;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const saving = jest.spyOn(prefs, 'setPrefs').mockImplementationOnce(async (patch) => {
    await held;
    return originalSave(patch);
  });
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByRole('radio', { name: '0.75×' }));
  fireEvent.press(ui.getByRole('switch', { name: 'Speak after revealing a flashcard' }));
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByRole('radio', { name: '0.75×', checked: true })).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Save audio preferences' }));
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 1.8 } }));
  expect(ui.getByRole('radio', { name: '0.75×', checked: true, disabled: true })).toBeTruthy();
  expect(
    ui.getByRole('switch', {
      name: 'Speak after revealing a flashcard',
      checked: true,
      disabled: true,
    }),
  ).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Save audio preferences' }));
  expect(saving).toHaveBeenCalledTimes(1);
  await act(async () => release());
  await ui.findByText('Audio preferences saved.');
  expect(await prefs.getPrefs()).toMatchObject({
    autoSpeak: true,
    speechRate: 0.75,
    learningReason: 'travel',
  });
  expect(speakCard).not.toHaveBeenCalled();
});

test('does not restart or cancel preview merely on resize and keeps Stop authoritative over late results', async () => {
  let release!: (value: any) => void;
  (speakCard as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save audio preferences');
  fireEvent.press(ui.getByRole('radio', { name: '1.25×' }));
  fireEvent.press(ui.getByRole('switch', { name: 'Repeat clip' }));
  fireEvent.press(ui.getByRole('button', { name: 'Preview pronunciation' }));
  const stops = (stop as jest.Mock).mock.calls.length;
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByRole('switch', { name: 'Repeat clip', checked: true })).toBeTruthy();
  expect(speakCard).toHaveBeenCalledTimes(1);
  expect(stop).toHaveBeenCalledTimes(stops);
  fireEvent.press(ui.getByRole('button', { name: 'Stop audio' }));
  await act(async () => release({ source: 'generated', loop: true }));
  expect(ui.queryByText('Source: generated clip')).toBeNull();
  expect(speakCard).toHaveBeenCalledWith(expect.anything(), { rate: 1.25, loop: true });
});

test('keeps a valid loaded custom rate selectable and allows restoring the supported default rate', async () => {
  await prefs.setPrefs({ speechRate: 0.9, autoSpeak: false });
  const ui = render(<AudioPreferencesScreen />);
  await ui.findByText('Save audio preferences');
  expect(ui.getByRole('radio', { name: '0.9×', checked: true })).toBeTruthy();
  fireEvent.press(ui.getByRole('radio', { name: '0.75×' }));
  expect(ui.getByRole('radio', { name: '0.9×', checked: false })).toBeTruthy();
  fireEvent.press(ui.getByRole('radio', { name: '0.98×' }));
  fireEvent.press(ui.getByRole('button', { name: 'Save audio preferences' }));
  await ui.findByText('Audio preferences saved.');
  expect(await prefs.getPrefs()).toMatchObject({ speechRate: 0.98, autoSpeak: false });
});
