import { ALL_DECKS } from '../data/decks';
import { RELEASE_CATALOGUE } from '../data/catalogueScope';
import { Deck } from '../types';

const starterDeckIds = [
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
];
export const isFreeOnlyRelease = RELEASE_CATALOGUE !== undefined;
export const FREE_DECK_IDS: ReadonlySet<string> = new Set(
  isFreeOnlyRelease ? ALL_DECKS.map((deck) => deck.id) : starterDeckIds,
);
const bundledDeckIds = new Set(ALL_DECKS.map((deck) => deck.id));
const stockDeckIds = new Set(RELEASE_CATALOGUE?.stockDeckIds);
const stockCardIds = new Set(RELEASE_CATALOGUE?.stockCardIds);
const publishedCards = new Map(
  ALL_DECKS.flatMap((deck) => deck.cards.map((card) => [card.id, card] as const)),
);

const paidCardIds = new Set(
  ALL_DECKS.filter((deck) => !FREE_DECK_IDS.has(deck.id)).flatMap((deck) =>
    deck.cards.map((card) => card.id),
  ),
);
export function isPaidBundledCard(cardId: string): boolean {
  return paidCardIds.has(cardId);
}

export function canStudyCard(cardId: string, fullLibrary: boolean): boolean {
  if (isFreeOnlyRelease) return !stockCardIds.has(cardId) || publishedCards.has(cardId);
  return fullLibrary || !isPaidBundledCard(cardId);
}

/** Filter learning access, never the stored library or its backups. */
export function accessibleDecks(decks: readonly Deck[], fullLibrary: boolean): Deck[] {
  if (isFreeOnlyRelease) {
    return decks.flatMap((deck) => {
      const cards = deck.cards
        .filter((card) => canStudyCard(card.id, fullLibrary))
        .map((card) => {
          const published = publishedCards.get(card.id);
          if (!published || published === card) return card;
          return {
            ...published,
            createdAt: card.createdAt,
            due: card.due,
            reps: card.reps,
            interval: card.interval,
            ease: card.ease,
            favorite: card.favorite,
            flagged: card.flagged,
          };
        });
      if (cards.length === 0 && stockDeckIds.has(deck.id) && !bundledDeckIds.has(deck.id))
        return [];
      return [{ ...deck, cards }];
    });
  }
  if (fullLibrary) return [...decks];
  return decks.flatMap((deck) => {
    // A backup can move a seed card, but access follows its stable bundled ID.
    const cards = deck.cards.filter((card) => !isPaidBundledCard(card.id));
    const lockedCollection = bundledDeckIds.has(deck.id) && !FREE_DECK_IDS.has(deck.id);
    if (lockedCollection && cards.length === 0) return [];
    return [cards.length === deck.cards.length ? deck : { ...deck, cards }];
  });
}
