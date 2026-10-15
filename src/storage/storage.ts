import AsyncStorage, { StorageAccess, withStorageTransaction } from './durableStorage';
import { Deck, FlashCard } from '../types';
import { localDayKey, storedDayKey, dayDistance } from '../utils/calendarDay';
import { createLearningSessionId } from './learningEvents';
import { validateBackupDecks } from './backupValidation';

const KEY = 'SRS_DECKS_V3';
const DAILY_KEY = 'SRS_DAILY_PROGRESS_V1';
const LAST_STUDY_SESSION_KEY = 'SRS_LAST_STUDY_SESSION_V1';
type DailyProgress = { date: string; count: number; target: number; newCount: number };

export interface LastStudySession {
  deckId: string;
  cardId?: string;
  updatedAt: number;
}

export async function loadDecks(access: StorageAccess = AsyncStorage): Promise<Deck[]> {
  const raw = await access.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveDecks(decks: Deck[], access: StorageAccess = AsyncStorage) {
  await access.setItem(KEY, JSON.stringify(decks));
}

export async function getLastStudySession(): Promise<LastStudySession | undefined> {
  const raw = await AsyncStorage.getItem(LAST_STUDY_SESSION_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as LastStudySession;
    if (!parsed?.deckId || typeof parsed.updatedAt !== 'number') return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export async function saveLastStudySession(
  session: Omit<LastStudySession, 'updatedAt'>,
  access: StorageAccess = AsyncStorage,
): Promise<LastStudySession> {
  const next = {
    ...session,
    updatedAt: Date.now(),
  };
  await access.setItem(LAST_STUDY_SESSION_KEY, JSON.stringify(next));
  return next;
}

/** Read fresh decks and journal one edit without racing grades, restores or other editors. */
export function mutateDecks(edit: (decks: Deck[]) => Deck[]): Promise<Deck[]> {
  return withStorageTransaction(async (tx) => {
    const raw = await tx.getItem(KEY);
    const current: unknown = raw === null ? [] : JSON.parse(raw);
    validateBackupDecks(current);
    const next = edit(current);
    validateBackupDecks(next);
    await saveDecks(next, tx);
    return next;
  });
}

export async function upsertDeck(deck: Deck) {
  const snapshot = JSON.parse(JSON.stringify(deck)) as Deck;
  await mutateDecks((decks) => {
    const idx = decks.findIndex((d) => d.id === snapshot.id);
    if (idx === -1) decks.push(snapshot);
    else decks[idx] = snapshot;
    return decks;
  });
}

export async function addCard(deckId: string, card: FlashCard) {
  const snapshot = JSON.parse(JSON.stringify(card)) as FlashCard;
  await mutateDecks((decks) => {
    const deck = decks.find((d) => d.id === deckId);
    if (deck) deck.cards.push(snapshot);
    return decks;
  });
}

export async function removeDeckById(deckId: string) {
  await mutateDecks((decks) => decks.filter((d) => d.id !== deckId));
}

export async function renameDeckById(deckId: string, name: string) {
  await mutateDecks((decks) => decks.map((d) => (d.id === deckId ? { ...d, name } : d)));
}

export async function resetDeckProgressById(deckId: string) {
  await mutateDecks((decks) => {
    const now = Date.now();
    return decks.map((d) =>
      d.id !== deckId
        ? d
        : {
            ...d,
            cards: d.cards.map((c) => ({ ...c, due: now, reps: 0, interval: 0, ease: 2.5 })),
          },
    );
  });
}

function todayISO(): string {
  return localDayKey();
}

export async function getDailyProgress(
  access: StorageAccess = AsyncStorage,
): Promise<DailyProgress> {
  if (access === AsyncStorage) return withStorageTransaction((tx) => getDailyProgress(tx));
  const raw = await access.getItem(DAILY_KEY);
  const today = todayISO();
  if (!raw) {
    const fresh: DailyProgress = { date: today, count: 0, target: 10, newCount: 0 };
    await access.setItem(DAILY_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as DailyProgress;
    if (!parsed || !parsed.date) throw new Error('bad');
    if (storedDayKey(parsed.date) !== today) {
      const fresh: DailyProgress = {
        date: today,
        count: 0,
        target: parsed.target ?? 10,
        newCount: 0,
      };
      await access.setItem(DAILY_KEY, JSON.stringify(fresh));
      return fresh;
    }
    if (!parsed.target) parsed.target = 10;
    if (typeof parsed.newCount !== 'number') parsed.newCount = 0;
    if (parsed.date !== today) {
      parsed.date = today;
      await access.setItem(DAILY_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    const fresh: DailyProgress = { date: today, count: 0, target: 10, newCount: 0 };
    await access.setItem(DAILY_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export async function incrementDailyProgress(
  delta: number = 1,
  access: StorageAccess = AsyncStorage,
): Promise<DailyProgress> {
  if (access === AsyncStorage)
    return withStorageTransaction((tx) => incrementDailyProgress(delta, tx));
  const current = await getDailyProgress(access);
  const next: DailyProgress = { ...current, count: current.count + delta };
  await access.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

export async function incrementDailyNewCount(
  delta: number = 1,
  access: StorageAccess = AsyncStorage,
): Promise<DailyProgress> {
  if (access === AsyncStorage)
    return withStorageTransaction((tx) => incrementDailyNewCount(delta, tx));
  const current = await getDailyProgress(access);
  const next: DailyProgress = { ...current, newCount: (current.newCount ?? 0) + delta };
  await access.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

export async function setDailyTarget(
  target: number,
  access: StorageAccess = AsyncStorage,
): Promise<DailyProgress> {
  if (access === AsyncStorage) return withStorageTransaction((tx) => setDailyTarget(target, tx));
  const current = await getDailyProgress(access);
  const next: DailyProgress = { ...current, target: Math.max(1, Math.floor(target)) };
  await access.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

const STREAK_KEY = 'SRS_STUDY_STREAK_V1';
const LEGACY_STREAK_KEY = 'SRS_STREAK_V1';

// Streak freezes: earn one per 7 consecutive study days (bank up to MAX_FREEZES).
// Missing a single day consumes a freeze instead of resetting the streak.
const MAX_FREEZES = 2;
const FREEZE_EARN_EVERY = 7;

export type StreakState = { streak: number; freezes: number };

type StoredStreak = { streak?: number; lastStudyDate?: string; freezes?: number };

function daysSince(lastStudyDate: string | undefined): number | undefined {
  const last = storedDayKey(lastStudyDate);
  return last ? dayDistance(last, todayISO()) : undefined;
}

async function readStoredStreak(
  access: StorageAccess = AsyncStorage,
): Promise<StoredStreak | undefined> {
  const raw = (await access.getItem(STREAK_KEY)) ?? (await access.getItem(LEGACY_STREAK_KEY));
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as StoredStreak;
  } catch {
    return undefined;
  }
}

export async function getStreakState(): Promise<StreakState> {
  const parsed = await readStoredStreak();
  if (!parsed) return { streak: 0, freezes: 0 };

  const streak = parsed.streak || 0;
  const freezes = parsed.freezes ?? 0;
  if (!parsed.lastStudyDate) return { streak, freezes };

  const diffDays = daysSince(parsed.lastStudyDate);
  if (diffDays === undefined) return { streak, freezes };
  if (diffDays <= 1) return { streak, freezes };
  // A single missed day is survivable while a freeze is banked.
  if (diffDays === 2 && freezes > 0) return { streak, freezes };
  return { streak: 0, freezes };
}

export async function getStudyStreak(): Promise<number> {
  return (await getStreakState()).streak;
}

export async function recordStudySession(access: StorageAccess = AsyncStorage): Promise<number> {
  if (access === AsyncStorage) return withStorageTransaction((tx) => recordStudySession(tx));
  const parsed = (await readStoredStreak(access)) ?? {};
  const today = todayISO();
  const prevStreak = parsed.streak || 0;
  let freezes = parsed.freezes ?? 0;
  const diffDays = daysSince(parsed.lastStudyDate);

  let nextStreak = 1;
  let advanced = true;
  if (diffDays === 0) {
    nextStreak = prevStreak || 1;
    advanced = false;
  } else if (diffDays === 1) {
    nextStreak = prevStreak + 1;
  } else if (diffDays === 2 && freezes > 0) {
    // Consume a freeze to cover the missed day.
    freezes -= 1;
    nextStreak = prevStreak + 1;
  }

  if (advanced && nextStreak > 0 && nextStreak % FREEZE_EARN_EVERY === 0) {
    freezes = Math.min(MAX_FREEZES, freezes + 1);
  }

  await access.setItem(
    STREAK_KEY,
    JSON.stringify({ streak: nextStreak, lastStudyDate: today, freezes }),
  );
  return nextStreak;
}

export interface SeenWord {
  cardId: string;
  deckId: string;
  front: string;
  back: string;
  spanish: string;
  english: string;
  lastSeen: number;
  correctCount: number;
  incorrectCount: number;
}

const SEEN_WORDS_KEY = 'SRS_SEEN_WORDS_V1';
const QUIZ_HISTORY_KEY = 'SRS_QUIZ_HISTORY_V1';

export async function getSeenWords(access: StorageAccess = AsyncStorage): Promise<SeenWord[]> {
  const raw = await access.getItem(SEEN_WORDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSeenWords(words: SeenWord[], access: StorageAccess = AsyncStorage) {
  await access.setItem(SEEN_WORDS_KEY, JSON.stringify(words));
}

export async function recordSeenWord(
  params: {
    cardId: string;
    deckId: string;
    front: string;
    back: string;
    correct: boolean;
  },
  access: StorageAccess = AsyncStorage,
): Promise<SeenWord[]> {
  if (access === AsyncStorage) {
    const snapshot = { ...params };
    return withStorageTransaction((tx) => recordSeenWord(snapshot, tx));
  }
  const words = await getSeenWords(access);
  const now = Date.now();
  const existingIndex = words.findIndex((word) => word.cardId === params.cardId);
  const existing = existingIndex >= 0 ? words[existingIndex] : undefined;
  const nextWord: SeenWord = {
    cardId: params.cardId,
    deckId: params.deckId,
    front: params.front,
    back: params.back,
    spanish: params.front,
    english: params.back,
    lastSeen: now,
    correctCount: (existing?.correctCount ?? 0) + (params.correct ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (params.correct ? 0 : 1),
  };

  const nextWords =
    existingIndex >= 0
      ? words.map((word, index) => (index === existingIndex ? nextWord : word))
      : [...words, nextWord];

  await saveSeenWords(nextWords, access);
  return nextWords;
}

export interface QuizResult {
  id: string;
  createdAt: number;
  score: number;
  total: number;
  missedCardIds: string[];
  region: string;
}

export async function getQuizHistory(access: StorageAccess = AsyncStorage): Promise<QuizResult[]> {
  const raw = await access.getItem(QUIZ_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveQuizHistory(results: QuizResult[], access: StorageAccess = AsyncStorage) {
  await access.setItem(QUIZ_HISTORY_KEY, JSON.stringify(results.slice(0, 10)));
}

export async function recordQuizResult(
  params: {
    id?: string;
    score: number;
    total: number;
    missedCardIds: string[];
    region: string;
  },
  access: StorageAccess = AsyncStorage,
): Promise<QuizResult[]> {
  if (access === AsyncStorage) {
    const snapshot = { ...params, missedCardIds: [...params.missedCardIds] };
    return withStorageTransaction((tx) => recordQuizResult(snapshot, tx));
  }
  const history = await getQuizHistory(access);
  if (params.id && history.some((result) => result.id === params.id)) return history;
  const now = Date.now();
  const result: QuizResult = {
    id: params.id ?? `quiz-${createLearningSessionId()}`,
    createdAt: now,
    score: params.score,
    total: params.total,
    missedCardIds: params.missedCardIds,
    region: params.region,
  };
  const next = [result, ...history].slice(0, 10);
  await saveQuizHistory(next, access);
  return next;
}
