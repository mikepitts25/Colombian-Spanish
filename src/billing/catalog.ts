import { ALL_DECKS } from '../data/decks';
import { Deck } from '../types';

export const FREE_DECK_IDS: ReadonlySet<string> = new Set([
  'deck-greetings',
  'deck-food',
  'deck-transport',
  'deck-travel',
  'deck-medical-phrases',
  'deck-numbers',
  'deck-useful-phrases',
  'deck-conversation',
  'deck-restaurant-phrases',
  'deck-accommodation-phrases',
]);
const bundled = new Map(ALL_DECKS.map((deck) => [deck.id, new Set(deck.cards.map((c) => c.id))]));

const paidCardIds = new Set(
  ALL_DECKS.filter((deck) => !FREE_DECK_IDS.has(deck.id)).flatMap((deck) =>
    deck.cards.map((card) => card.id),
  ),
);
export function isPaidBundledCard(cardId: string): boolean {
  return paidCardIds.has(cardId);
}

/** Filter learning access, never the stored library or its backups. */
export function accessibleDecks(decks: readonly Deck[], fullLibrary: boolean): Deck[] {
  if (fullLibrary) return [...decks];
  return decks.flatMap((deck) => {
    const seedIds = bundled.get(deck.id);
    if (!seedIds || FREE_DECK_IDS.has(deck.id)) return [deck];
    // User-created cards stay available even if added to a paid collection.
    const cards = deck.cards.filter((card) => !seedIds.has(card.id));
    return cards.length ? [{ ...deck, cards }] : [];
  });
}
