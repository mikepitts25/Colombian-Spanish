import { isValidCardRegions } from '../utils/regionMetadata';
import { Deck } from '../types';

// Bound clipboard parsing work before JSON.parse allocates a second object tree.
// Measured in JavaScript UTF-16 code units, not bytes or grapheme clusters.
export const MAX_BACKUP_CHARACTERS = 10_000_000;

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const nonnegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function validConjugation(value: unknown): boolean {
  return (
    record(value) &&
    ['present', 'past', 'future'].every((tense) => {
      const table = value[tense];
      return (
        record(table) &&
        ['yo', 'tu', 'el', 'nosotros', 'ellos'].every((person) => typeof table[person] === 'string')
      );
    })
  );
}

/** Validate without coercing or dropping custom card content and scheduling data. */
export function validateBackupDecks(value: unknown): asserts value is Deck[] {
  if (!Array.isArray(value)) throw new Error('Invalid decks');
  const deckIds = new Set<string>();
  const cardIds = new Set<string>();
  for (const deck of value) {
    if (
      !record(deck) ||
      !text(deck.id) ||
      !text(deck.name) ||
      !Array.isArray(deck.cards) ||
      (deck.description !== undefined && typeof deck.description !== 'string')
    ) {
      throw new Error('Invalid deck');
    }
    const deckId = deck.id as string;
    if (deckIds.has(deckId)) throw new Error('Duplicate deck ID');
    deckIds.add(deckId);
    for (const card of deck.cards) {
      if (
        !record(card) ||
        !text(card.id) ||
        !text(card.front) ||
        !text(card.back) ||
        !nonnegative(card.createdAt) ||
        !nonnegative(card.due) ||
        !nonnegative(card.reps) ||
        !Number.isInteger(card.reps) ||
        !nonnegative(card.interval) ||
        !nonnegative(card.ease) ||
        card.ease === 0 ||
        ['example', 'ipa'].some(
          (key) => card[key] !== undefined && typeof card[key] !== 'string',
        ) ||
        ['favorite', 'flagged'].some(
          (key) => card[key] !== undefined && typeof card[key] !== 'boolean',
        ) ||
        (card.tags !== undefined &&
          (!Array.isArray(card.tags) || !card.tags.every((tag) => typeof tag === 'string'))) ||
        (card.register !== undefined &&
          !['formal', 'casual', 'vulgar', 'flirty'].includes(card.register as string)) ||
        (card.reviewStatus !== undefined &&
          !['unreviewed', 'reviewed', 'needs_native'].includes(card.reviewStatus as string)) ||
        (card.reviewedAt !== undefined && !nonnegative(card.reviewedAt)) ||
        (card.regions !== undefined && !isValidCardRegions(card.regions)) ||
        (card.conjugation !== undefined && !validConjugation(card.conjugation))
      ) {
        throw new Error('Invalid card');
      }
      const cardId = card.id as string;
      if (cardIds.has(cardId)) throw new Error('Duplicate card ID');
      cardIds.add(cardId);
    }
  }
}
