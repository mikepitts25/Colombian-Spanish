import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  DEFAULT_NOTIFICATION_PREFS,
  getNotificationPreferences,
  refreshScheduledNotifications,
  saveAndScheduleNotificationPreferences,
} from '../../src/services/notifications';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    DATE: 'date',
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

function morningCalls() {
  return mockSchedule.mock.calls.filter(([arg]) => arg.trigger?.type === 'date');
}

function nightCalls() {
  return mockSchedule.mock.calls.filter(([arg]) => arg.trigger?.type === 'daily');
}

describe('notification preferences', () => {
  it('returns default notification preferences when nothing is stored', async () => {
    await expect(getNotificationPreferences()).resolves.toEqual(DEFAULT_NOTIFICATION_PREFS);
  });

  it('persists preferences and schedules word-of-day mornings plus a nightly reminder', async () => {
    const prefs = {
      ...DEFAULT_NOTIFICATION_PREFS,
      masterOn: true,
      morningOn: true,
      nightOn: true,
    };

    await saveAndScheduleNotificationPreferences(prefs);

    await expect(getNotificationPreferences()).resolves.toEqual(prefs);
    expect(mockCancelAll).toHaveBeenCalledTimes(1);

    // Rolling one-shot morning window: 7 days, minus today if 8am already passed.
    const mornings = morningCalls();
    expect(mornings.length).toBeGreaterThanOrEqual(6);
    expect(mornings.length).toBeLessThanOrEqual(7);
    for (const [arg] of mornings) {
      // Default UI language is Spanish; each morning embeds that day's word.
      expect(arg.content.title).toMatch(/Palabra del día/);
      expect(arg.trigger.date).toBeInstanceOf(Date);
      expect(arg.trigger.date.getHours()).toBe(8);
    }

    // Morning words rotate — a 7-day window should not repeat a single word.
    const titles = new Set(mornings.map(([arg]) => arg.content.title));
    expect(titles.size).toBeGreaterThan(1);

    const nights = nightCalls();
    expect(nights).toHaveLength(1);
    expect(nights[0][0].trigger).toEqual(
      expect.objectContaining({ type: 'daily', hour: 21, minute: 0 }),
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

describe('refreshScheduledNotifications', () => {
  it('re-schedules the rolling window from saved prefs without prompting', async () => {
    await AsyncStorage.setItem(
      'SRS_NOTIFICATION_PREFS_V1',
      JSON.stringify({ ...DEFAULT_NOTIFICATION_PREFS, morningOn: true }),
    );

    await refreshScheduledNotifications();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(morningCalls().length).toBeGreaterThanOrEqual(6);
  });

  it('is a no-op when notification permission was never granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });

    await refreshScheduledNotifications();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
