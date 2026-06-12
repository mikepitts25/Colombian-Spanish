import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, FlashCard } from '../types';

const KEY = 'SRS_DECKS_V3';
const DAILY_KEY = 'SRS_DAILY_PROGRESS_V1';
type DailyProgress = { date: string; count: number; target: number };

export async function loadDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveDecks(decks: Deck[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(decks));
}

export async function upsertDeck(deck: Deck) {
  const decks = await loadDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx === -1) decks.push(deck);
  else decks[idx] = deck;
  await saveDecks(decks);
}

export async function addCard(deckId: string, card: FlashCard) {
  const decks = await loadDecks();
  const d = decks.find((dd) => dd.id === deckId);
  if (!d) return;
  d.cards.push(card);
  await saveDecks(decks);
}

export async function removeDeckById(deckId: string) {
  const decks = await loadDecks();
  const next = decks.filter((d) => d.id !== deckId);
  await saveDecks(next);
}

export async function renameDeckById(deckId: string, name: string) {
  const decks = await loadDecks();
  const next = decks.map((d) => (d.id === deckId ? { ...d, name } : d));
  await saveDecks(next);
}

export async function resetDeckProgressById(deckId: string) {
  const decks = await loadDecks();
  const now = Date.now();
  const next = decks.map((d) => {
    if (d.id !== deckId) return d;
    return {
      ...d,
      cards: (d.cards || []).map((c) => ({
        ...c,
        due: now,
        reps: 0,
        interval: 0,
        ease: 2.5,
      })),
    };
  });
  await saveDecks(next);
}

function todayISO(): string {
  const d = new Date();
  // local midnight boundary
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDailyProgress(): Promise<DailyProgress> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  const today = todayISO();
  if (!raw) {
    const fresh: DailyProgress = { date: today, count: 0, target: 10 };
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as DailyProgress;
    if (!parsed || !parsed.date) throw new Error('bad');
    if (parsed.date !== today) {
      const fresh: DailyProgress = { date: today, count: 0, target: parsed.target ?? 10 };
      await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(fresh));
      return fresh;
    }
    if (!parsed.target) parsed.target = 10;
    return parsed;
  } catch {
    const fresh: DailyProgress = { date: today, count: 0, target: 10 };
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export async function incrementDailyProgress(delta: number = 1): Promise<DailyProgress> {
  const current = await getDailyProgress();
  const next: DailyProgress = { ...current, count: current.count + delta };
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

export async function setDailyTarget(target: number): Promise<DailyProgress> {
  const current = await getDailyProgress();
  const next: DailyProgress = { ...current, target: Math.max(1, Math.floor(target)) };
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(next));
  return next;
}

const STREAK_KEY = 'SRS_STUDY_STREAK_V1';
const LEGACY_STREAK_KEY = 'SRS_STREAK_V1';

export async function getStudyStreak(): Promise<number> {
  const raw = (await AsyncStorage.getItem(STREAK_KEY)) ?? (await AsyncStorage.getItem(LEGACY_STREAK_KEY));
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.lastStudyDate) return parsed.streak || 0;
    const lastStudyDate = new Date(parsed.lastStudyDate);
    const today = new Date(todayISO());
    const diffDays = Math.floor((today.getTime() - lastStudyDate.getTime()) / (24 * 60 * 60 * 1000));
    return diffDays <= 1 ? parsed.streak || 0 : 0;
  } catch {
    return 0;
  }
}

export async function recordStudySession(): Promise<number> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  const today = todayISO();
  let nextStreak = 1;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const lastStudyDate = parsed?.lastStudyDate ? new Date(parsed.lastStudyDate) : undefined;
      if (lastStudyDate) {
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastStudyDate.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 0) nextStreak = parsed.streak || 1;
        else if (diffDays === 1) nextStreak = (parsed.streak || 0) + 1;
      }
    } catch {}
  }

  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ streak: nextStreak, lastStudyDate: today }));
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

export async function getSeenWords(): Promise<SeenWord[]> {
  const raw = await AsyncStorage.getItem(SEEN_WORDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSeenWords(words: SeenWord[]) {
  await AsyncStorage.setItem(SEEN_WORDS_KEY, JSON.stringify(words));
}

export async function recordSeenWord(params: {
  cardId: string;
  deckId: string;
  front: string;
  back: string;
  correct: boolean;
}): Promise<SeenWord[]> {
  const words = await getSeenWords();
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

  await saveSeenWords(nextWords);
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

export async function getQuizHistory(): Promise<QuizResult[]> {
  const raw = await AsyncStorage.getItem(QUIZ_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveQuizHistory(results: QuizResult[]) {
  await AsyncStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(results.slice(0, 10)));
}

export async function recordQuizResult(params: {
  score: number;
  total: number;
  missedCardIds: string[];
  region: string;
}): Promise<QuizResult[]> {
  const history = await getQuizHistory();
  const now = Date.now();
  const result: QuizResult = {
    id: `quiz-${now}`,
    createdAt: now,
    score: params.score,
    total: params.total,
    missedCardIds: params.missedCardIds,
    region: params.region,
  };
  const next = [result, ...history].slice(0, 10);
  await saveQuizHistory(next);
  return next;
}
