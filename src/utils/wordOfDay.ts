// src/utils/wordOfDay.ts
// Deterministic, date-seeded Word of the Day so it rotates daily
// but stays stable for the whole day (and can be precomputed for
// future days, e.g. to schedule push notifications).

import { Deck, FlashCard } from '../types';

export type WordOfDayPick = {
  deckId: string;
  deckName: string;
  card: FlashCard;
};

// Prefer distinctly Colombian content for the daily word.
const COLOMBIAN_PATTERN = /(slang|jerga|coloquial|colombia|paisa|coste[nñ]o|rolo|valluno)/;

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// FNV-1a — small, stable string hash; good enough spread for daily rotation.
export function hashKey(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickWordOfDay(
  decks: Deck[],
  date: Date = new Date(),
  getDeckName: (deck: Deck) => string = (deck) => deck.name,
): WordOfDayPick | undefined {
  const rows: WordOfDayPick[] = (decks || []).flatMap((deck) =>
    (deck.cards || []).map((card) => ({
      deckId: deck.id,
      deckName: getDeckName(deck),
      card,
    })),
  );
  if (rows.length === 0) return undefined;

  const colombian = rows.filter((row) => {
    const text = `${(row.card.tags || []).join(' ')} ${row.deckName}`.toLowerCase();
    return COLOMBIAN_PATTERN.test(text);
  });
  const pool = colombian.length > 0 ? colombian : rows;

  // Sort by card id so the pick is independent of deck/storage order.
  const sorted = [...pool].sort((a, b) => a.card.id.localeCompare(b.card.id));
  return sorted[hashKey(dateKey(date)) % sorted.length];
}
