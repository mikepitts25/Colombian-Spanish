import * as RN from 'react-native';
import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSettingsScreen from '../../src/screens/ThemeSettingsScreen';
import { ThemeProvider, useAppTheme } from '../../src/context/ThemeContext';
import { getPrefs, setPrefs } from '../../src/storage/prefs';
const mockBack = jest.fn(),
  mockPrevent = jest.fn();
const nativeWrite = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
const nativeRead = (AsyncStorage.getItem as jest.Mock).getMockImplementation()!;
let releaseWrite: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockBack }),
  usePreventRemove: (...args: unknown[]) => mockPrevent(...args),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values: any) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
function Paint() {
  const theme = useAppTheme();
  return (
    <Text testID="paint" style={{ backgroundColor: theme.colors.bg }}>
      {theme.id}:{theme.appearance}
    </Text>
  );
}
function App() {
  return (
    <ThemeProvider>
      <Paint />
      <ThemeSettingsScreen />
    </ThemeProvider>
  );
}
beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
afterEach(() => {
  releaseWrite?.();
  releaseWrite = undefined;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(nativeWrite);
  (AsyncStorage.getItem as jest.Mock).mockImplementation(nativeRead);
  jest.restoreAllMocks();
});
test('draft Barrio/Light and Cancel change neither stored Classic nor applied appearance', async () => {
  await setPrefs({ themeId: 'classic', appearanceMode: 'dark', speechRate: 0.8 });
  const original = await AsyncStorage.getItem('SRS_PREFS_V1');
  const ui = render(<App />);
  await ui.findByRole('radio', { name: 'Classic (original theme)', checked: true });
  fireEvent.press(ui.getByRole('radio', { name: 'Barrio' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Light' }));
  expect(ui.getByText('classic:dark')).toHaveStyle({ backgroundColor: '#020617' });
  expect(await AsyncStorage.getItem('SRS_PREFS_V1')).toBe(original);
  fireEvent.press(ui.getByRole('button', { name: 'Cancel' }));
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem('SRS_PREFS_V1')).toBe(original);
});
test('one held pair save blocks conflicting actions and merges an unrelated preference update', async () => {
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  let intercept = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
    if (intercept && key === 'SRS_WRITE_JOURNAL_V1') {
      intercept = false;
      entered();
      await held;
    }
    return nativeWrite(key, value);
  });
  const ui = render(<App />);
  await ui.findByRole('radio', { name: 'Classic (original theme)' });
  fireEvent.press(ui.getByRole('radio', { name: 'Barrio' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Light' }));
  fireEvent.press(ui.getByRole('button', { name: 'Save theme' }));
  await act(async () => {
    await started;
  });
  expect(ui.getByRole('radio', { name: 'Dark', disabled: true })).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Cancel', disabled: true })).toBeTruthy();
  expect(mockPrevent).toHaveBeenLastCalledWith(true, expect.any(Function));
  fireEvent.press(ui.getByRole('radio', { name: 'Dark' }));
  fireEvent.press(ui.getByRole('button', { name: 'Save theme' }));
  fireEvent.press(ui.getByRole('button', { name: 'Cancel' }));
  expect(ui.getByText('classic:dark')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();
  let other!: Promise<unknown>;
  await act(async () => {
    other = setPrefs({ speechRate: 0.85 });
    releaseWrite!();
    releaseWrite = undefined;
    await other;
  });
  await ui.findByText('Theme saved.');
  expect(ui.getByText('barrio:light')).toHaveStyle({ backgroundColor: '#F7F3EA' });
  expect(await getPrefs()).toMatchObject({
    themeId: 'barrio',
    appearanceMode: 'light',
    speechRate: 0.85,
  });
  fireEvent.press(ui.getByRole('radio', { name: 'Classic (original theme)' }));
  fireEvent.press(ui.getByRole('button', { name: 'Save theme' }));
  await waitFor(() => expect(ui.getByText('classic:dark')).toBeTruthy());
  expect(await getPrefs()).toMatchObject({ themeId: 'classic', appearanceMode: 'light' });
});
test('interrupted durable save retains the exact request and old paint until successful retry', async () => {
  await setPrefs({ speechRate: 0.8 });
  let fail = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
    if (key === 'SRS_PREFS_V1' && fail) {
      fail = false;
      throw new Error('disk interrupted');
    }
    return nativeWrite(key, value);
  });
  const ui = render(<App />);
  await ui.findByRole('radio', { name: 'Classic (original theme)' });
  fireEvent.press(ui.getByRole('radio', { name: 'Barrio' }));
  fireEvent.press(ui.getByRole('radio', { name: 'Light' }));
  fireEvent.press(ui.getByRole('button', { name: 'Save theme' }));
  await ui.findByText('Could not save. Your selection is retained. Retry the same selection.');
  expect(ui.getByText('classic:dark')).toBeTruthy();
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
  expect(ui.getByRole('radio', { name: 'Light', checked: true, disabled: true })).toBeTruthy();
  fireEvent.press(ui.getByRole('radio', { name: 'Dark' }));
  await act(async () => {
    await setPrefs({ uiLanguage: 'en' });
  });
  expect(ui.getByText('classic:dark')).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
  await ui.findByText('Theme saved.');
  expect(ui.getByText('barrio:light')).toBeTruthy();
  expect(await getPrefs()).toMatchObject({
    themeId: 'barrio',
    appearanceMode: 'light',
    speechRate: 0.8,
    uiLanguage: 'en',
  });
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
});

test('failed load exposes Retry instead of editable defaults and preserves existing selection', async () => {
  const raw = JSON.stringify({ themeId: 'classic', appearanceMode: 'light', speechRate: 0.85 });
  await AsyncStorage.setItem('SRS_PREFS_V1', raw);
  let fail = true;
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
    if (key === 'SRS_PREFS_V1' && fail) {
      fail = false;
      throw new Error('read unavailable');
    }
    return nativeRead(key);
  });
  const ui = render(<App />);
  await ui.findByText('Could not load theme settings. Retry without resetting the app.');
  expect(ui.queryByRole('button', { name: 'Save theme' })).toBeNull();
  expect(ui.queryByRole('radio')).toBeNull();
  expect(await nativeRead('SRS_PREFS_V1')).toBe(raw);
  fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
  await ui.findByRole('radio', { name: 'Classic (original theme)', checked: true });
  fireEvent.press(ui.getByRole('radio', { name: 'Barrio' }));
  expect(ui.getByRole('radio', { name: 'Light', checked: true })).toBeTruthy();
  expect(await nativeRead('SRS_PREFS_V1')).toBe(raw);
});

test('a pending Barrio/System save uses the latest OS appearance after acknowledgment', async () => {
  const scheme = jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const held = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  let intercept = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
    if (intercept && key === 'SRS_WRITE_JOURNAL_V1') {
      intercept = false;
      entered();
      await held;
    }
    return nativeWrite(key, value);
  });
  const ui = render(<App />);
  await ui.findByRole('radio', { name: 'Classic (original theme)' });
  fireEvent.press(ui.getByRole('radio', { name: 'Barrio' }));
  expect(ui.getByRole('radio', { name: 'Follow system', checked: true })).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Save theme' }));
  await act(async () => started);
  scheme.mockReturnValue('dark');
  ui.rerender(<App />);
  expect(ui.getByText('classic:dark')).toBeTruthy();
  await act(async () => {
    releaseWrite!();
    releaseWrite = undefined;
  });
  await ui.findByText('barrio:dark');
  expect(await getPrefs()).toMatchObject({ themeId: 'barrio', appearanceMode: 'system' });
  scheme.mockReturnValue('light');
  ui.rerender(<App />);
  expect(ui.getByText('barrio:light')).toBeTruthy();
});
