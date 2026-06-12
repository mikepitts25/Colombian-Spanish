import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  DEFAULT_NOTIFICATION_PREFS,
  getNotificationPreferences,
  saveAndScheduleNotificationPreferences,
} from '../../src/services/notifications';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
  },
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
}));

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockCancelAll = Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockGetPermissions.mockResolvedValue({ status: 'granted' });
  mockRequestPermissions.mockResolvedValue({ status: 'granted' });
});

describe('notification preferences', () => {
  it('returns default notification preferences when nothing is stored', async () => {
    await expect(getNotificationPreferences()).resolves.toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it('persists preferences and schedules enabled local reminders', async () => {
    const prefs = {
      ...DEFAULT_NOTIFICATION_PREFS,
      masterOn: true,
      morningOn: true,
      nightOn: true,
    };

    await saveAndScheduleNotificationPreferences(prefs);

    await expect(getNotificationPreferences()).resolves.toEqual(prefs);
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledTimes(2);
    expect(mockSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Time to study Colombian Spanish' }),
        trigger: expect.objectContaining({ hour: 8, minute: 0 }),
      }),
    );
    expect(mockSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Keep your Spanish streak alive' }),
        trigger: expect.objectContaining({ hour: 21, minute: 0 }),
      }),
    );
  });

  it('cancels scheduled reminders when notifications are disabled', async () => {
    await saveAndScheduleNotificationPreferences({
      ...DEFAULT_NOTIFICATION_PREFS,
      masterOn: false,
      morningOn: true,
      nightOn: true,
    });

    expect(mockCancelAll).toHaveBeenCalledTimes(1);
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
