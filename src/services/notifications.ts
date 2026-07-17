import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ALL_DECKS } from '../data/decks';
import { getPrefs, UiLanguage } from '../storage/prefs';
import { pickWordOfDay } from '../utils/wordOfDay';

const NOTIFICATION_PREFS_KEY = 'SRS_NOTIFICATION_PREFS_V1';

// The morning reminder embeds that day's Word of the Day, so it can't be a
// single repeating notification — we schedule a rolling window of one-shot
// notifications instead and refresh it on every app launch.
const WORD_OF_DAY_WINDOW_DAYS = 7;
const MORNING_HOUR = 8;

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

function morningCopy(language: UiLanguage, date: Date): { title: string; body: string } {
  const word = pickWordOfDay(ALL_DECKS, date);
  if (!word) {
    return language === 'es'
      ? {
          title: 'Hora de estudiar español colombiano',
          body: 'Un repaso corto mantiene las palabras frescas.',
        }
      : {
          title: 'Time to study Colombian Spanish',
          body: 'A short review now keeps the words fresh.',
        };
  }

  return language === 'es'
    ? {
        title: `🇨🇴 Palabra del día: ${word.card.front}`,
        body: `¿Recuerdas qué significa "${word.card.front}"? Repásala y mantén tu racha.`,
      }
    : {
        title: `🇨🇴 Word of the day: ${word.card.front}`,
        body: `Do you remember what "${word.card.front}" means? Review it and keep your streak.`,
      };
}

async function scheduleMorningWordOfDayWindow(language: UiLanguage) {
  const now = new Date();
  for (let offset = 0; offset < WORD_OF_DAY_WINDOW_DAYS; offset += 1) {
    const fireAt = new Date(now);
    fireAt.setDate(now.getDate() + offset);
    fireAt.setHours(MORNING_HOUR, 0, 0, 0);
    if (fireAt.getTime() <= Date.now()) continue; // this morning already passed

    const { title, body } = morningCopy(language, fireAt);
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
  }
}

export async function scheduleNotificationPreferences(
  prefs: NotificationPreferences,
  { requestPermission = true }: { requestPermission?: boolean } = {},
) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs.masterOn) return;
  if (requestPermission) {
    const allowed = await ensureNotificationPermission();
    if (!allowed) return;
  } else {
    const current = await Notifications.getPermissionsAsync();
    if (current.status !== 'granted') return;
  }

  const { uiLanguage } = await getPrefs();

  if (prefs.morningOn) {
    await scheduleMorningWordOfDayWindow(uiLanguage);
  }

  if (prefs.nightOn) {
    await scheduleDailyReminder(
      21,
      0,
      uiLanguage === 'es' ? 'Mantén viva tu racha de español' : 'Keep your Spanish streak alive',
      uiLanguage === 'es'
        ? 'Repasa unas tarjetas antes de que termine el día.'
        : 'Review a few cards before the day ends.',
    );
  }
}

export async function saveAndScheduleNotificationPreferences(prefs: NotificationPreferences) {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  await scheduleNotificationPreferences(prefs);
}

/**
 * Re-schedule the rolling word-of-day window using saved preferences.
 * Called on app launch. Never prompts for permission — if the user hasn't
 * granted notifications yet, this is a no-op.
 */
export async function refreshScheduledNotifications() {
  const prefs = await getNotificationPreferences();
  await scheduleNotificationPreferences(prefs, { requestPermission: false });
}
