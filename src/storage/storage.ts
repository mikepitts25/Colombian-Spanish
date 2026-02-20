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

export async function getStudyStreak(): Promise<number> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  if (!raw) return 0;
  try {
    const { streak, lastStudyDate } = JSON.parse(raw);
    const today = todayISO();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayISO = yesterday.toISOString();

    // If last study was today, return current streak
    if (lastStudyDate === today) return streak || 0;
    // If last study was yesterday, streak is still valid
    if (lastStudyDate === yesterdayISO) return streak || 0;
    // Otherwise, streak is broken
    return 0;
  } catch {
    return 0;
  }
}

export async function recordStudySession(): Promise<number> {
  const currentStreak = await getStudyStreak();
  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayISO = yesterday.toISOString();

  const raw = await AsyncStorage.getItem(STREAK_KEY);
  let lastStudyDate = '';
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      lastStudyDate = parsed.lastStudyDate;
    } catch {}
  }

  // Already studied today, don't increment
  if (lastStudyDate === today) return currentStreak;

  // Check if we should increment or reset
  let newStreak = 1;
  if (lastStudyDate === yesterdayISO) {
    newStreak = currentStreak + 1;
  }

  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({
    streak: newStreak,
    lastStudyDate: today,
  }));

  return newStreak;
}
