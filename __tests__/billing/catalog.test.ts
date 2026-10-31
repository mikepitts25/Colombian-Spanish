import { ALL_DECKS } from '../../src/data/decks';
import { accessibleDecks, FREE_DECK_IDS } from '../../src/billing/catalog';
import { Deck } from '../../src/types';

it('keeps ten useful starter decks including emergency phrases free', () => {
  const free = accessibleDecks(ALL_DECKS, false);
  expect(free).toHaveLength(10);
  expect(free.map((d) => d.id)).toContain('deck-medical-phrases');
  expect(free.reduce((n, d) => n + d.cards.length, 0)).toBeGreaterThan(250);
  expect(FREE_DECK_IDS.size).toBe(10);
});
it('unlocks every bundled collection without changing stored cards or progress', () => {
  expect(accessibleDecks(ALL_DECKS, true)).toEqual(ALL_DECKS);
  expect(accessibleDecks(ALL_DECKS, false).some((d) => d.id === 'deck-paisa')).toBe(false);
});
it('preserves custom decks and custom cards inside locked bundled decks', () => {
  const paid = ALL_DECKS.find((d) => !FREE_DECK_IDS.has(d.id))!;
  const own = { ...paid.cards[0], id: 'my-own-card', reps: 8 };
  const custom: Deck = { id: 'my-deck', name: 'My phrases', cards: [own] };
  const input = [{ ...paid, cards: [...paid.cards, own] }, custom];
  const free = accessibleDecks(input, false);
  expect(free[0].cards).toEqual([own]);
  expect(free[1]).toEqual(custom);
  expect(input[0].cards.length).toBe(paid.cards.length + 1);
});
