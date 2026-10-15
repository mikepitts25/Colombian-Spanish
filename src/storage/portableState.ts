import { StorageAccess } from './durableStorage';

const FIELDS = {
  prefs: { key: 'SRS_PREFS_V1', empty: {} },
  daily: {
    key: 'SRS_DAILY_PROGRESS_V1',
    empty: { date: '1970-01-01T00:00:00.000Z', count: 0, target: 10, newCount: 0 },
  },
  streak: { key: 'SRS_STUDY_STREAK_V1', empty: { streak: 0, freezes: 0 } },
  seenWords: { key: 'SRS_SEEN_WORDS_V1', empty: [] },
  quizHistory: { key: 'SRS_QUIZ_HISTORY_V1', empty: [] },
  lastSession: { key: 'SRS_LAST_STUDY_SESSION_V1', empty: {} },
  notificationPrefs: { key: 'SRS_NOTIFICATION_PREFS_V1', empty: {} },
} as const;
export type PortableState = Record<keyof typeof FIELDS, unknown | null>;
const names = Object.keys(FIELDS) as (keyof PortableState)[];
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const integer = (v: unknown) => number(v) && Number.isInteger(v);
const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const optional = (v: Record<string, unknown>, k: string, test: (x: unknown) => boolean) =>
  v[k] === undefined || test(v[k]);
const only = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).every((k) => keys.includes(k));
const strings = (v: unknown) => Array.isArray(v) && Array.from(v).every(text);
function uniqueRows(
  v: unknown,
  key: string,
  check: (row: Record<string, unknown>) => boolean,
  max = Infinity,
) {
  if (!Array.isArray(v) || v.length > max) return false;
  const ids = new Set();
  for (const row of v) {
    if (!record(row) || !text(row[key]) || ids.has(row[key]) || !check(row)) return false;
    ids.add(row[key]);
  }
  return true;
}
function valid(name: keyof PortableState, value: unknown): boolean {
  if (value === null) return true;
  if (name === 'seenWords')
    return uniqueRows(
      value,
      'cardId',
      (r) =>
        ['deckId', 'front', 'back', 'spanish', 'english'].every((k) => typeof r[k] === 'string') &&
        number(r.lastSeen) &&
        integer(r.correctCount) &&
        integer(r.incorrectCount),
    );
  if (name === 'quizHistory')
    return uniqueRows(
      value,
      'id',
      (r) =>
        number(r.createdAt) &&
        integer(r.score) &&
        integer(r.total) &&
        (r.score as number) <= (r.total as number) &&
        strings(r.missedCardIds) &&
        typeof r.region === 'string',
      10,
    );
  if (!record(value)) return false;
  if (name === 'prefs')
    return (
      only(value, [
        'autoSpeak',
        'speechRate',
        'uiLanguage',
        'newCardsPerDay',
        'onboardingDone',
        'learningReason',
        'homeRegion',
      ]) &&
      ['autoSpeak', 'onboardingDone'].every((k) =>
        optional(value, k, (v) => typeof v === 'boolean'),
      ) &&
      optional(
        value,
        'speechRate',
        (v) => number(v) && (v as number) >= 0.5 && (v as number) <= 1.5,
      ) &&
      optional(
        value,
        'newCardsPerDay',
        (v) => integer(v) && (v as number) >= 1 && (v as number) <= 100,
      ) &&
      optional(value, 'uiLanguage', (v) => ['en', 'es'].includes(v as string)) &&
      optional(
        value,
        'learningReason',
        (v) =>
          v === null ||
          ['travel', 'move', 'love', 'work', 'culture', 'general'].includes(v as string),
      ) &&
      optional(
        value,
        'homeRegion',
        (v) =>
          v === null ||
          ['all', 'paisa', 'rolo', 'costeno', 'valluno', 'llanero'].includes(v as string),
      )
    );
  if (name === 'daily')
    return (
      only(value, ['date', 'count', 'target', 'newCount']) &&
      date(value.date) &&
      integer(value.count) &&
      integer(value.target) &&
      (value.target as number) > 0 &&
      optional(value, 'newCount', integer)
    );
  if (name === 'streak')
    return (
      only(value, ['streak', 'lastStudyDate', 'freezes']) &&
      optional(value, 'streak', integer) &&
      optional(value, 'lastStudyDate', date) &&
      optional(value, 'freezes', (v) => integer(v) && (v as number) <= 2)
    );
  if (name === 'lastSession')
    return (
      only(value, ['deckId', 'cardId', 'updatedAt']) &&
      (Object.keys(value).length === 0 ||
        (text(value.deckId) && number(value.updatedAt) && optional(value, 'cardId', text)))
    );
  return (
    only(value, ['masterOn', 'morningOn', 'nightOn', 'streakOn', 'achieveOn']) &&
    Object.values(value).every((v) => typeof v === 'boolean')
  );
}
export function validatePortableState(value: unknown): asserts value is PortableState {
  if (
    !record(value) ||
    Object.keys(value).length !== names.length ||
    !names.every(
      (name) => Object.prototype.hasOwnProperty.call(value, name) && valid(name, value[name]),
    )
  )
    throw new Error('Invalid portable application state');
}
export async function readPortableState(tx: StorageAccess): Promise<PortableState> {
  const result = {} as PortableState;
  for (const name of names) {
    let raw = await tx.getItem(FIELDS[name].key);
    if (name === 'streak' && raw === null) raw = await tx.getItem('SRS_STREAK_V1');
    result[name] = raw === null ? null : JSON.parse(raw);
  }
  validatePortableState(result);
  return result;
}
export async function writePortableState(tx: StorageAccess, state: PortableState): Promise<void> {
  validatePortableState(state);
  for (const name of names)
    await tx.setItem(FIELDS[name].key, JSON.stringify(state[name] ?? FIELDS[name].empty));
}
