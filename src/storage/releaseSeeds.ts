import { RELEASE_CATALOGUE } from '../data/catalogueScope';
import { ALL_DECKS } from '../data/decks';
import type { Deck } from '../types';

/** Keep historical records exactly as stored and add only globally missing release cards. */
export function addMissingReleaseSeeds(decks: Deck[]): Deck[] {
  if (!RELEASE_CATALOGUE) return decks;

  const existingIds = new Set(decks.flatMap((deck) => deck.cards.map((card) => card.id)));
  const additions = new Map(
    ALL_DECKS.flatMap((deck) => {
      const cards = deck.cards.filter((card) => !existingIds.has(card.id));
      return cards.length ? [[deck.id, { ...deck, cards }] as const] : [];
    }),
  );
  if (!additions.size) return decks;
  const updated = decks.map((deck) => {
    const addition = additions.get(deck.id);
    if (!addition) return deck;
    additions.delete(deck.id);
    return { ...deck, cards: [...deck.cards, ...addition.cards] };
  });
  return [...updated, ...additions.values()];
}
