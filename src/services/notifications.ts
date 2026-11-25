import AsyncStorage from '../storage/durableStorage';
import DeviceStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { accessibleDecks } from '../billing/catalog';
import { ALL_DECKS } from '../data/decks';
import { getPrefs, UiLanguage } from '../storage/prefs';
import { pickWordOfDay } from '../utils/wordOfDay';
import { localDayAtHour, localDayKey, storedDayKey } from '../utils/calendarDay';

const NOTIFICATION_PREFS_KEY = 'SRS_NOTIFICATION_PREFS_V1';
const OFFER_DISMISSED_KEY = 'SRS_LOCAL_REMINDER_OFFER_DISMISSED_V1';

// The morning reminder embeds that day's Word of the Day, so it can't be a
// single repeating notification — we schedule a rolling window of one-shot
// notifications instead and refresh it on every app launch.
const WORD_OF_DAY_WINDOW_DAYS = 7;
const MORNING_HOUR = 8;
const EVENING_HOUR = 21;

const MORNING_WORD_TITLES = ['🇨🇴 Palabra del día:', '🇨🇴 Word of the day:'];
const MORNING_PRACTICE_TITLES = [
  'Hora de estudiar español colombiano',
  'Time to study Colombian Spanish',
];
const EVENING_TITLES = ['Mantén viva tu racha de español', 'Keep your Spanish streak alive'];

export type ReminderTap =
  | { kind: 'word'; day: string; deckId: string; cardId: string; front: string }
  | { kind: 'wordUnavailable' }
  | { kind: 'evening' | 'practice' };

function parseReminderContent(
  content: Pick<Notifications.NotificationContent, 'data' | 'title'>,
): ReminderTap | undefined {
  const data = content.data;
  if (data?.reminder === 'evening') return { kind: 'evening' };
  if (data?.reminder === 'practice') return { kind: 'practice' };
  if (data?.reminder === 'word') {
    const { day, deckId, cardId, front } = data;
    if (
      typeof day === 'string' &&
      storedDayKey(day) === day &&
      typeof deckId === 'string' &&
      typeof cardId === 'string' &&
      typeof front === 'string' &&
      deckId &&
      cardId &&
      front
    )
      return { kind: 'word', day, deckId, cardId, front };
    return { kind: 'wordUnavailable' };
  }
  // Installed versions before reminder payloads can still have delivered alerts.
  const title = content.title ?? '';
  if (MORNING_WORD_TITLES.some((prefix) => title.startsWith(prefix)))
    return { kind: 'wordUnavailable' };
  if (MORNING_PRACTICE_TITLES.includes(title)) return { kind: 'practice' };
  if (EVENING_TITLES.includes(title)) return { kind: 'evening' };
}

function reminderResponseKey(response: Notifications.NotificationResponse) {
  return JSON.stringify([
    response.notification.request.identifier,
    response.notification.date,
    response.actionIdentifier,
  ]);
}

export function watchReminderResponses(open: (intent: ReminderTap) => boolean) {
  const waiting = new Map<string, ReminderTap>();
  const handled = new Set<string>();
  let active = true;
  let flushing = false;
  function flush() {
    if (!active || flushing) return;
    flushing = true;
    try {
      for (const [key, intent] of waiting) {
        if (!open(intent)) break;
        waiting.delete(key);
        handled.add(key);
        try {
          const latest = Notifications.getLastNotificationResponse();
          if (latest && reminderResponseKey(latest) === key)
            Notifications.clearLastNotificationResponse();
        } catch {
          // Native cache support varies by platform. In-process deduplication still applies.
        }
      }
    } finally {
      flushing = false;
    }
  }
  function receive(response: Notifications.NotificationResponse) {
    if (!active || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const intent = parseReminderContent(response.notification.request.content);
    if (!intent) return;
    const key = reminderResponseKey(response);
    if (waiting.has(key) || handled.has(key)) return;
    waiting.set(key, intent);
    flush();
  }

  let subscription:
    | ReturnType<typeof Notifications.addNotificationResponseReceivedListener>
    | undefined;
  try {
    subscription = Notifications.addNotificationResponseReceivedListener(receive);
    const initial = Notifications.getLastNotificationResponse();
    if (initial) receive(initial);
  } catch {
    // Reminder entry is optional on platforms without notification response APIs.
  }
  return {
    flush,
    remove() {
      active = false;
      subscription?.remove();
      waiting.clear();
    },
  };
}

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

function permissionAllowsReminders(
  permission: Notifications.NotificationPermissionsStatus,
): boolean {
  return (
    permission.granted ||
    permission.status === 'granted' ||
    (!!permission.ios && permission.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL)
  );
}

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (permissionAllowsReminders(current)) return true;
  if (current.canAskAgain === false) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return permissionAllowsReminders(requested);
}

async function scheduleEveningReminder(language: UiLanguage) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: EVENING_TITLES[language === 'es' ? 0 : 1],
      body:
        language === 'es'
          ? 'Vuelve a tu práctica de hoy cuando tengas un momento.'
          : 'Come back to today’s practice when you have a moment.',
      sound: true,
      data: { reminder: 'evening' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: EVENING_HOUR,
      minute: 0,
    },
  });
}

function morningCopy(language: UiLanguage, date: Date) {
  const word = pickWordOfDay(accessibleDecks(ALL_DECKS, false), date);
  const spanish = language === 'es';
  if (!word) {
    return {
      title: MORNING_PRACTICE_TITLES[spanish ? 0 : 1],
      body: spanish ? 'Vuelve a tu práctica de hoy.' : 'Come back to today’s practice.',
      data: { reminder: 'practice' },
    };
  }

  return {
    title: `${MORNING_WORD_TITLES[spanish ? 0 : 1]} ${word.card.front}`,
    body: spanish
      ? `¿Recuerdas qué significa «${word.card.front}»? Toca para ver la palabra.`
      : `Do you remember what “${word.card.front}” means? Tap to see the word.`,
    data: {
      reminder: 'word',
      deckId: word.deckId,
      cardId: word.card.id,
      day: localDayKey(date),
      front: word.card.front,
    },
  };
}

async function scheduleMorningWordOfDayWindow(language: UiLanguage) {
  const now = new Date();
  for (let offset = 0; offset < WORD_OF_DAY_WINDOW_DAYS; offset += 1) {
    const fireAt = localDayAtHour(now, offset, MORNING_HOUR);
    if (fireAt.getTime() <= Date.now()) continue; // this morning already passed

    const copy = morningCopy(language, fireAt);
    await Notifications.scheduleNotificationAsync({
      content: { ...copy, sound: true },
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
    if (!permissionAllowsReminders(current)) return 'denied';
  }

  const { uiLanguage } = await getPrefs();

  if (prefs.morningOn) {
    await scheduleMorningWordOfDayWindow(uiLanguage);
  }

  if (prefs.nightOn) await scheduleEveningReminder(uiLanguage);
  return 'scheduled';
}

export type NotificationScheduleResult = 'scheduled' | 'off' | 'denied' | 'unscheduled' | 'error';

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
  options?: { requestPermission?: boolean },
): Promise<NotificationScheduleResult> {
  const intent = { ...prefs };
  return ordered(async () => {
    // Failed persistence rejects without modifying the existing OS requests.
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(intent));
    return scheduleSafely(intent, options);
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

/** Read the native permission and confirmed pending schedules without asking or editing. */
export function getNotificationScheduleStatus(
  prefs: NotificationPreferences,
): Promise<NotificationScheduleResult> {
  const intent = { ...prefs };
  return ordered(async (): Promise<NotificationScheduleResult> => {
    if (!intent.masterOn || (!intent.morningOn && !intent.nightOn)) return 'off';
    if (!permissionAllowsReminders(await Notifications.getPermissionsAsync())) return 'denied';
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    const kinds = requests.map((request) => parseReminderContent(request.content)?.kind);
    const morning = kinds.some(
      (kind) => kind === 'word' || kind === 'practice' || kind === 'wordUnavailable',
    );
    const evening = kinds.includes('evening');
    return (!intent.morningOn || morning) && (!intent.nightOn || evening)
      ? 'scheduled'
      : 'unscheduled';
  }).catch(() => 'error');
}

async function hasReminderChoices() {
  const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
  return raw !== null && raw !== '{}';
}

export async function canOfferReminders() {
  const [chosen, dismissed] = await Promise.all([
    hasReminderChoices(),
    DeviceStorage.getItem(OFFER_DISMISSED_KEY),
  ]);
  if (chosen || dismissed) return false;
  return !permissionAllowsReminders(await Notifications.getPermissionsAsync());
}

export function dismissReminderOffer() {
  return DeviceStorage.setItem(OFFER_DISMISSED_KEY, '1');
}

export function enableFirstReminder(): Promise<NotificationScheduleResult> {
  return ordered(async () => {
    // A Settings change made while Home was open takes precedence.
    if (await hasReminderChoices()) return 'off';
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(DEFAULT_NOTIFICATION_PREFS));
    return scheduleSafely(DEFAULT_NOTIFICATION_PREFS);
  });
}
