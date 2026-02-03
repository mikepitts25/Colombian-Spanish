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
 * nextBatch:
 * - Return ready/overdue cards first (due <= now)
 * - If not enough, include a few “new” or not-yet-due cards
 * - Stable order by due ascending, then id
 */
export function nextBatch(cards: FlashCard[], size = 15): FlashCard[] {
  const now = Date.now();
  const copy = [...cards];

  const ready = copy
    .filter((c) => (c.due ?? 0) <= now)
    .sort((a, b) => (a.due ?? 0) - (b.due ?? 0) || a.id.localeCompare(b.id));

  if (ready.length >= size) return ready.slice(0, size);

  const notYet = copy
    .filter((c) => (c.due ?? 0) > now || c.due == null)
    .sort(
      (a, b) =>
        (a.due ?? Number.MAX_SAFE_INTEGER) - (b.due ?? Number.MAX_SAFE_INTEGER) ||
        a.id.localeCompare(b.id),
    );

  return [...ready, ...notYet.slice(0, Math.max(0, size - ready.length))];
}
