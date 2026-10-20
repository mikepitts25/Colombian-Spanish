import AsyncStorage from '../storage/durableStorage';
import * as Notifications from 'expo-notifications';
import { ALL_DECKS } from '../data/decks';
import { getPrefs, UiLanguage } from '../storage/prefs';
import { pickWordOfDay } from '../utils/wordOfDay';
import { localDayAtHour } from '../utils/calendarDay';

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
    const parsed: unknown = JSON.parse(raw);
    const result = { ...DEFAULT_NOTIFICATION_PREFS };
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key of Object.keys(result) as (keyof NotificationPreferences)[]) {
        const value = (parsed as Record<string, unknown>)[key];
        if (typeof value === 'boolean') result[key] = value;
      }
    }
    return result;
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  if (current.canAskAgain === false) return false;

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
    const fireAt = localDayAtHour(now, offset, MORNING_HOUR);
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

async function applyNotificationPreferences(
  prefs: NotificationPreferences,
  { requestPermission = true }: { requestPermission?: boolean } = {},
): Promise<NotificationScheduleResult> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs.masterOn || (!prefs.morningOn && !prefs.nightOn)) return 'off';
  if (requestPermission) {
    const allowed = await ensureNotificationPermission();
    if (!allowed) return 'denied';
  } else {
    const current = await Notifications.getPermissionsAsync();
    if (current.status !== 'granted') return 'denied';
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
  return 'scheduled';
}

export type NotificationScheduleResult = 'scheduled' | 'off' | 'denied' | 'error';

// A startup refresh and a later settings change must finish in intent order.
// Storage serialization alone cannot protect asynchronous native scheduling.
let scheduling: Promise<unknown> = Promise.resolve();
function ordered<T>(operation: () => Promise<T>): Promise<T> {
  const result = scheduling.then(operation);
  scheduling = result.catch(() => {});
  return result;
}

async function scheduleSafely(
  prefs: NotificationPreferences,
  options?: { requestPermission?: boolean },
): Promise<NotificationScheduleResult> {
  try {
    return await applyNotificationPreferences(prefs, options);
  } catch {
    // Avoid retaining a partially created morning window when the OS rejects
    // one request. A cleanup failure remains an error, never a success claim.
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
    return 'error';
  }
}

export function scheduleNotificationPreferences(
  prefs: NotificationPreferences,
  options?: { requestPermission?: boolean },
): Promise<NotificationScheduleResult> {
  const intent = { ...prefs };
  return ordered(() => scheduleSafely(intent, options));
}

export function saveAndScheduleNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<NotificationScheduleResult> {
  const intent = { ...prefs };
  return ordered(async () => {
    // Failed persistence rejects without modifying the existing OS requests.
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(intent));
    return scheduleSafely(intent);
  });
}

/** Refresh the rolling window on launch, without a permission prompt. */
export function refreshScheduledNotifications(): Promise<NotificationScheduleResult> {
  return ordered(async () => {
    // Read inside the queue so a refresh cannot carry stale saved choices.
    const prefs = await getNotificationPreferences();
    return scheduleSafely(prefs, { requestPermission: false });
  });
}
