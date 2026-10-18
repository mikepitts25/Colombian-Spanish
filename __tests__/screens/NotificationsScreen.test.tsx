import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import NotificationsScreen from '../../src/screens/NotificationsScreen';
import {
  DEFAULT_NOTIFICATION_PREFS,
  getNotificationPreferences,
} from '../../src/services/notifications';
const originalWindow = Dimensions.get('window');
const mockBack = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: mockBack }) }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values: any) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', canAskAgain: true }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
}));
beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
  });
});
afterEach(() => act(() => Dimensions.set({ window: originalWindow })));

it('locks controls until the saved choices are loaded and supports retry after read failure', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failed'));
  const ui = render(<NotificationsScreen />);
  expect(ui.getByTestId('notification-master-toggle')).toBeDisabled();
  await ui.findByText('Could not load reminder preferences. Your settings have not changed.');
  expect(ui.getByTestId('notification-master-toggle')).toBeDisabled();
  fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
  await ui.findByRole('switch', { name: 'Notifications', disabled: false, checked: true });
  expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
});

it('blocks duplicate edits and Back through a pending save and live font changes, preserving legacy fields', async () => {
  await AsyncStorage.setItem(
    'SRS_NOTIFICATION_PREFS_V1',
    JSON.stringify({ ...DEFAULT_NOTIFICATION_PREFS, streakOn: false, achieveOn: false }),
  );
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockImplementationOnce(
    () => held,
  );
  const ui = render(<NotificationsScreen />);
  await ui.findByRole('switch', { name: 'Notifications', disabled: false });
  fireEvent(ui.getByTestId('notification-master-toggle'), 'valueChange', false);
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(
    ui.getByRole('switch', { name: 'Notifications', checked: false, disabled: true }),
  ).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Settings', disabled: true })).toBeTruthy();
  fireEvent(ui.getByTestId('notification-master-toggle'), 'valueChange', true);
  fireEvent.press(ui.getByRole('button', { name: 'Settings' }));
  await act(async () => release());
  await ui.findByText('Preferences saved. No reminders requested.');
  expect(await getNotificationPreferences()).toEqual({
    ...DEFAULT_NOTIFICATION_PREFS,
    masterOn: false,
    streakOn: false,
    achieveOn: false,
  });
  expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
  expect(ui.getByTestId('notification-morning-toggle')).toBeDisabled();
  fireEvent(ui.getByTestId('notification-morning-toggle'), 'valueChange', false);
  expect((await getNotificationPreferences()).morningOn).toBe(true);
});

it('rolls back a failed durable save and lets the learner retry the change', async () => {
  const ui = render(<NotificationsScreen />);
  await ui.findByRole('switch', { name: 'Notifications', disabled: false });
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  fireEvent(ui.getByTestId('notification-master-toggle'), 'valueChange', false);
  await ui.findByText(
    'Could not save preferences. Previous choices are shown. Try the change again.',
  );
  expect(
    ui.getByRole('switch', { name: 'Notifications', checked: true, disabled: false }),
  ).toBeTruthy();
  expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  fireEvent(ui.getByTestId('notification-master-toggle'), 'valueChange', false);
  await ui.findByText('Preferences saved. No reminders requested.');
  expect((await getNotificationPreferences()).masterOn).toBe(false);
});

it('retains saved choices when scheduling fails and offers a working retry without changing them', async () => {
  const ui = render(<NotificationsScreen />);
  await ui.findByRole('switch', { name: 'Notifications', disabled: false });
  (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
    new Error('OS failure'),
  );
  fireEvent(ui.getByTestId('notification-night-toggle'), 'valueChange', true);
  await ui.findByText(
    'Preferences saved, but reminders could not be scheduled. Retry to apply them.',
  );
  expect(ui.getByRole('switch', { name: 'Night Reminder', checked: true })).toBeTruthy();
  expect((await getNotificationPreferences()).nightOn).toBe(true);
  fireEvent.press(ui.getByRole('button', { name: 'Retry' }));
  await ui.findByText(
    'Preferences saved. Reminders scheduled; delivery depends on system settings.',
  );
  expect((await getNotificationPreferences()).nightOn).toBe(true);
});

it('shows denied permission as distinct from an unsaved preference and does not prompt on screen opening', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'denied',
    canAskAgain: false,
  });
  const ui = render(<NotificationsScreen />);
  await ui.findByRole('switch', { name: 'Notifications', disabled: false });
  expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
  fireEvent(ui.getByTestId('notification-night-toggle'), 'valueChange', true);
  await ui.findByText(
    'Preferences saved. Allow notifications in system settings to receive reminders.',
  );
  expect((await getNotificationPreferences()).nightOn).toBe(true);
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: 'Settings' }));
  expect(mockBack).toHaveBeenCalledTimes(1);
});

it('offers only implemented reminders and accurately explains daily timing and the finite morning window', async () => {
  const ui = render(<NotificationsScreen />);
  await ui.findByRole('switch', { name: 'Notifications', disabled: false });
  expect(ui.getAllByRole('switch')).toHaveLength(3);
  expect(ui.getByText(/next seven calendar days/)).toBeTruthy();
  expect(ui.getByText(/Streak and achievement alerts are not sent/)).toBeTruthy();
  expect(ui.queryByTestId('notification-achievements-toggle')).toBeNull();
  expect(ui.queryByText('Mon • Tue • Wed • Thu • Fri')).toBeNull();
});
