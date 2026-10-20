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

test('a newer disable waits for an in-flight launch refresh and leaves no stale reminders', async () => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let started!: () => void;
  const firstSchedule = new Promise<void>((resolve) => {
    started = resolve;
  });
  const active: unknown[] = [];
  mockCancelAll.mockImplementation(async () => {
    active.length = 0;
  });
  mockSchedule.mockImplementation(async (request) => {
    if (!active.length) {
      started();
      await held;
    }
    active.push(request);
    return 'id';
  });
  try {
    const refreshing = refreshScheduledNotifications();
    await firstSchedule;
    const disabling = saveAndScheduleNotificationPreferences({
      ...DEFAULT_NOTIFICATION_PREFS,
      masterOn: false,
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
    release();
    await Promise.all([refreshing, disabling]);
    expect(active).toEqual([]);
    expect((await getNotificationPreferences()).masterOn).toBe(false);
  } finally {
    mockCancelAll.mockResolvedValue(undefined);
    mockSchedule.mockResolvedValue('notification-id');
  }
});

test('retains saved choices on partial OS scheduling failure, cancels partial requests and recovers on retry', async () => {
  mockSchedule
    .mockResolvedValueOnce('morning-1')
    .mockResolvedValueOnce('morning-2')
    .mockRejectedValueOnce(new Error('OS schedule failure'));
  const choices = { ...DEFAULT_NOTIFICATION_PREFS, nightOn: true };
  await expect(saveAndScheduleNotificationPreferences(choices)).resolves.toBe('error');
  expect(await getNotificationPreferences()).toEqual(choices);
  expect(mockSchedule).toHaveBeenCalledTimes(3);
  expect(mockCancelAll).toHaveBeenCalledTimes(2);
  await expect(saveAndScheduleNotificationPreferences(choices)).resolves.toBe('scheduled');
});

test('a failed durable write does not touch the OS schedule and does not poison later saves', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  await expect(
    saveAndScheduleNotificationPreferences({ ...DEFAULT_NOTIFICATION_PREFS, masterOn: false }),
  ).rejects.toThrow('disk full');
  expect(mockCancelAll).not.toHaveBeenCalled();
  await expect(
    saveAndScheduleNotificationPreferences({ ...DEFAULT_NOTIFICATION_PREFS, masterOn: false }),
  ).resolves.toBe('off');
});

test('denied permission with cannot-ask-again preserves choices without another prompt', async () => {
  mockGetPermissions.mockResolvedValue({ status: 'denied', canAskAgain: false });
  await expect(saveAndScheduleNotificationPreferences(DEFAULT_NOTIFICATION_PREFS)).resolves.toBe(
    'denied',
  );
  expect(mockRequestPermissions).not.toHaveBeenCalled();
  expect(mockSchedule).not.toHaveBeenCalled();
  expect(await getNotificationPreferences()).toEqual(DEFAULT_NOTIFICATION_PREFS);
});

test('no enabled reminder choices clears requests without asking for permission', async () => {
  await expect(
    saveAndScheduleNotificationPreferences({
      ...DEFAULT_NOTIFICATION_PREFS,
      morningOn: false,
      nightOn: false,
    }),
  ).resolves.toBe('off');
  expect(mockGetPermissions).not.toHaveBeenCalled();
  expect(mockSchedule).not.toHaveBeenCalled();
});

test('normalizes known stored boolean fields and ignores malformed field values', async () => {
  await AsyncStorage.setItem(
    'SRS_NOTIFICATION_PREFS_V1',
    JSON.stringify({
      masterOn: 'false',
      morningOn: false,
      nightOn: null,
      streakOn: false,
      achieveOn: 1,
      extra: true,
    }),
  );
  expect(await getNotificationPreferences()).toEqual({
    masterOn: true,
    morningOn: false,
    nightOn: false,
    streakOn: false,
    achieveOn: true,
  });
});

test('morning window includes the next seven local calendar mornings before 08:00, and six after', async () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date(2026, 9, 18, 7, 59));
    await saveAndScheduleNotificationPreferences(DEFAULT_NOTIFICATION_PREFS);
    expect(morningCalls().map(([arg]) => arg.trigger.date.getDate())).toEqual([
      18, 19, 20, 21, 22, 23, 24,
    ]);
    mockSchedule.mockClear();
    jest.setSystemTime(new Date(2026, 9, 18, 8, 0));
    await saveAndScheduleNotificationPreferences(DEFAULT_NOTIFICATION_PREFS);
    expect(morningCalls().map(([arg]) => arg.trigger.date.getDate())).toEqual([
      19, 20, 21, 22, 23, 24,
    ]);
  } finally {
    jest.useRealTimers();
  }
});

test('morning window uses current-zone calendar dates when native Date getters are stale', async () => {
  const now = new Date(2026, 0, 5, 7);
  jest.useFakeTimers({ now });
  const getter = jest.spyOn(Date.prototype, 'getDate').mockReturnValue(6);
  try {
    await saveAndScheduleNotificationPreferences(DEFAULT_NOTIFICATION_PREFS);
    const dates = morningCalls().map(([arg]) => arg.trigger.date as Date);
    expect(dates).toHaveLength(7);
    expect(require('../../src/utils/calendarDay').localDayKey(dates[0])).toBe('2026-01-05');
    expect(require('../../src/utils/calendarDay').localHour(dates[0])).toBe(8);
  } finally {
    getter.mockRestore();
    jest.useRealTimers();
  }
});
