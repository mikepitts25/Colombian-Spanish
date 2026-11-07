import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider, useLanguage } from '../../src/context/LanguageContext';
import * as prefs from '../../src/storage/prefs';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', canAskAgain: true }),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
}));
import * as Notifications from 'expo-notifications';
import { refreshScheduledNotifications } from '../../src/services/notifications';

let language: ReturnType<typeof useLanguage>;
function Probe() {
  const value = useLanguage();
  React.useLayoutEffect(() => {
    language = value;
  }, [value]);
  return <Text>{value.language}</Text>;
}
beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
afterEach(async () => {
  // Drain native scheduling intents before another test replaces the saved state.
  await refreshScheduledNotifications();
});

test('keeps the current language when persistence fails and lets the same change succeed on retry', async () => {
  const ui = render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );
  await act(async () => {});
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await expect(language.setLanguage('en')).rejects.toThrow('disk full');
  });
  expect(ui.getByText('es')).toBeTruthy();
  expect((await prefs.getPrefs()).uiLanguage).toBe('es');
  await act(async () => language.setLanguage('en'));
  expect(ui.getByText('en')).toBeTruthy();
  expect((await prefs.getPrefs()).uiLanguage).toBe('en');
});

test('serializes rapid toggles so the visible language matches the persisted choice', async () => {
  const ui = render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );
  await act(async () => {});
  await act(async () => {
    await Promise.all([language.toggleLanguage(), language.toggleLanguage()]);
  });
  expect(ui.getByText('es')).toBeTruthy();
  expect((await prefs.getPrefs()).uiLanguage).toBe('es');
});

test('does not let a stale startup read overwrite a newer saved language', async () => {
  const saved = await prefs.getPrefs();
  let finish!: (value: typeof saved) => void;
  jest.spyOn(prefs, 'getPrefs').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const ui = render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );
  await act(async () => language.setLanguage('en'));
  await act(async () => finish(saved));
  expect(ui.getByText('en')).toBeTruthy();
});

test('refreshes scheduled reminder copy after the language is saved without asking for permission', async () => {
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );
  await act(async () => {});
  await act(async () => language.setLanguage('en'));
  await waitFor(() =>
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: expect.stringContaining('Word of the day:') }),
      }),
    ),
  );
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  expect((await prefs.getPrefs()).uiLanguage).toBe('en');
});

test.each(['prefs write', 'journal removal'])(
  'recognizes a recovered language commit after %s fails',
  async (failure) => {
    const ui = render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    await act(async () => {});
    if (failure === 'prefs write') {
      const write = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
      (AsyncStorage.setItem as jest.Mock)
        .mockImplementationOnce(write)
        .mockRejectedValueOnce(new Error('native prefs write failed'));
    } else {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('journal removal failed'),
      );
    }
    await act(async () => language.toggleLanguage());
    expect(ui.getByText('en')).toBeTruthy();
    expect((await prefs.getPrefs()).uiLanguage).toBe('en');
    await act(async () => language.toggleLanguage());
    expect(ui.getByText('es')).toBeTruthy();
    expect((await prefs.getPrefs()).uiLanguage).toBe('es');
  },
);
