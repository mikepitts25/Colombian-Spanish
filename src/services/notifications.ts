import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_PREFS_KEY = 'SRS_NOTIFICATION_PREFS_V1';

export type NotificationPreferences = {
  masterOn: boolean;
  morningOn: boolean;
  nightOn: boolean;
  streakOn: boolean;
  achieveOn: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  masterOn: true,
  morningOn: true,
  nightOn: false,
  streakOn: true,
  achieveOn: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (!raw) return DEFAULT_NOTIFICATION_PREFS;

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...parsed,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleNotificationPreferences(prefs: NotificationPreferences) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs.masterOn) return;
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;

  if (prefs.morningOn) {
    await scheduleDailyReminder(
      8,
      0,
      'Time to study Colombian Spanish',
      'A short review now keeps the words fresh.',
    );
  }

  if (prefs.nightOn) {
    await scheduleDailyReminder(
      21,
      0,
      'Keep your Spanish streak alive',
      'Review a few cards before the day ends.',
    );
  }
}

export async function saveAndScheduleNotificationPreferences(prefs: NotificationPreferences) {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  await scheduleNotificationPreferences(prefs);
}
