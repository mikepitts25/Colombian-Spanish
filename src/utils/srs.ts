import { CardQuality, FlashCard } from '../types';

const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

export function gradeCard(card: FlashCard, quality: CardQuality, now = Date.now()): FlashCard {
  // Based on SM-2 with light tweaks for mobile cadence
  let ease = card.ease ?? 2.5;
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease = clamp(1.3, 2.8, ease);

  let reps = card.reps || 0;
  let interval = card.interval || 0;

  if (quality < 3) {
    reps = 0;
    interval = 1; // relearn tomorrow
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }

  const due = now + interval * 24 * 60 * 60 * 1000;

  return { ...card, ease, reps, interval, due };
}

export function isDue(card: FlashCard, now = Date.now()) {
  return card.due <= now;
}

export function nextBatch(cards: FlashCard[], size = 15, now = Date.now()): FlashCard[] {
  // Interleave due + a few new ones for variety (interleaving effect)
  const due = cards.filter(c => isDue(c, now));
  const newOnes = cards.filter(c => c.reps === 0).slice(0, 5);
  const pool = [...due, ...newOnes];
  return pool
    .sort((a, b) => (a.due - b.due))
    .slice(0, size);
}