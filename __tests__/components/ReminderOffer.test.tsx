import React from 'react';
import { View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import ReminderOffer from '../../src/components/ReminderOffer';
import { canOfferReminders } from '../../src/services/notifications';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any) => require('../../src/i18n/translations').translate('en', key),
  }),
}));
jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined', canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

test('requests permission only after the learned reminder offer is accepted', async () => {
  const ui = render(<ReminderOffer />);
  const remind = await ui.findByRole('button', { name: 'Remind me' });
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  fireEvent.press(remind);
  fireEvent.press(remind);
  await ui.findByText(/Reminders scheduled/);
  expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
});

test('remembers Maybe later across remounts without prompting or touching schedules', async () => {
  const ui = render(<ReminderOffer />);
  const later = await ui.findByRole('button', { name: 'Maybe later' });
  await act(async () => {
    fireEvent.press(later);
  });
  expect(ui.queryByRole('button', { name: 'Maybe later' })).toBeNull();
  await expect(canOfferReminders()).resolves.toBe(false);
  ui.unmount();
  const again = render(<View />);
  await act(async () => {
    again.rerender(
      <View>
        <ReminderOffer />
      </View>,
    );
  });
  expect(again.queryByRole('button', { name: 'Remind me' })).toBeNull();
  expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});
