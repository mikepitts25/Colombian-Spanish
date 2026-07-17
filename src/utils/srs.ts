// src/utils/srs.ts
// Minimal SM-2–style scheduler with sensible bounds.

import { FlashCard } from '../types';

const DAY = 24 * 60 * 60 * 1000;

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

// Clamp helper
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * gradeCard:
 * - Adjusts ease (E-factor)
 * - Sets next interval (in days)
 * - Updates due (timestamp)
 * - Increments reps when quality >= 3
 */
export function gradeCard(card: FlashCard, quality: Quality): FlashCard {
  const now = Date.now();
  const c = { ...card };

  // Initialize defaults if missing
  c.ease = c.ease ?? 2.5;
  c.interval = c.interval ?? 0;
  c.reps = c.reps ?? 0;
  c.due = c.due ?? now;

  // Map qualities: 1=Again, 2=Hard, 3=OK, 4=Good, 5=Easy
  // We’ll treat 0 like 1 (complete miss)
  const q = quality === 0 ? 1 : quality;

  // Update ease (SM-2 tweak)
  // E' = E + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  c.ease = clamp((c.ease ?? 2.5) + delta, 1.3, 2.8);

  // Interval logic
  if (q < 3) {
    // “Again/Hard miss”: quick relearn laps
    c.interval = q === 1 ? 0 : 0.5; // 0 days ≈ 10–15 min; 0.5 ≈ ~12h
  } else if (c.reps <= 0) {
    c.interval = 1; // first success → 1 day
  } else if (c.reps === 1) {
    c.interval = q === 5 ? 4 : 3; // second success → 3–4 days
  } else {
    // subsequent reviews
    c.interval = (c.interval || 1) * c.ease;
    // Slight push for “Easy”
    if (q === 5) c.interval *= 1.15;
    // Slight dampener for “Hard but passed”
    if (q === 3) c.interval *= 0.85;
  }

  // Bound intervals
  c.interval = clamp(c.interval, 0, 365); // don’t exceed a year
  // Translate interval to due date
  const addMs =
    c.interval === 0
      ? 15 * 60 * 1000 // 15 minutes for immediate recheck
      : Math.round(c.interval * DAY);

  c.due = now + addMs;

  // reps count only for passing grades
  if (q >= 3) c.reps = (c.reps || 0) + 1;
  else c.reps = Math.max(0, (c.reps || 0) - 1);

  return c;
}

/**
 * isNewCard:
 * A card is "new" until it has been graded at least once.
 * gradeCard always changes ease (any quality) or reps/interval (passing),
 * so untouched SRS state means the card was never studied.
 */
export function isNewCard(card: FlashCard): boolean {
  return (card.reps ?? 0) === 0 && (card.interval ?? 0) === 0 && (card.ease ?? 2.5) === 2.5;
}

/**
 * previewInterval:
 * The interval (in days) a card would get if graded with `quality` right now.
 * Used to show honest scheduling info on the grade buttons (like Anki).
 */
export function previewInterval(card: FlashCard, quality: Quality): number {
  return gradeCard(card, quality).interval;
}

/**
 * formatIntervalShort:
 * Compact human label for an interval in days: 15m / 12h / 3d / 1.2mo / 1y+.
 */
export function formatIntervalShort(days: number): string {
  if (days <= 0) return '15m';
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 60) return `${(days / 30).toFixed(1)}mo`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return '1y';
}

export type SessionQueueOptions = {
  size?: number;
  /** Max never-studied cards to introduce in this batch (after due reviews). */
  newLimit?: number;
  now?: number;
};

/**
 * buildSessionQueue:
 * - Due reviews first (studied cards with due <= now), oldest due first
 * - Then new cards (never studied), capped by newLimit, oldest created first
 * - Never includes scheduled cards that are not yet due — reviewing early
 *   without adjusting for the shorter gap would corrupt the SRS intervals.
 */
export function buildSessionQueue(cards: FlashCard[], opts: SessionQueueOptions = {}): FlashCard[] {
  const { size = 15, newLimit = 10, now = Date.now() } = opts;
  if (size <= 0) return [];

  const dueReviews = cards
    .filter((c) => !isNewCard(c) && (c.due ?? 0) <= now)
    .sort((a, b) => (a.due ?? 0) - (b.due ?? 0) || a.id.localeCompare(b.id));

  if (dueReviews.length >= size) return dueReviews.slice(0, size);

  const fresh = cards
    .filter((c) => isNewCard(c))
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, Math.min(newLimit, size - dueReviews.length)));

  return [...dueReviews, ...fresh];
}

export function selectDifficultCards(cards: FlashCard[], size = 30): FlashCard[] {
  const now = Date.now();

  return [...cards]
    .filter((card) => {
      const reps = card.reps ?? 0;
      const ease = card.ease ?? 2.5;
      const interval = card.interval ?? 0;
      const due = card.due ?? 0;
      const hasStudyHistory = reps > 0 || ease < 2.5 || interval > 0;

      if (!hasStudyHistory) return false;
      if (ease <= 2.2) return true;
      return reps > 0 && due <= now && interval <= 1;
    })
    .sort(
      (a, b) =>
        (a.ease ?? 2.5) - (b.ease ?? 2.5) ||
        (a.due ?? Number.MAX_SAFE_INTEGER) - (b.due ?? Number.MAX_SAFE_INTEGER) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, size);
}
