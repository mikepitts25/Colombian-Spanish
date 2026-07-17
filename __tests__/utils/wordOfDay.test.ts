import { pickWordOfDay, dateKey, hashKey } from '../../src/utils/wordOfDay';
import { Deck, FlashCard } from '../../src/types';

const NOW = 1_700_000_000_000;

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: `front-${id}`,
    back: `back-${id}`,
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

function makeDeck(id: string, name: string, cards: FlashCard[]): Deck {
  return { id, name, cards };
}

describe('dateKey', () => {
  it('formats as YYYY-MM-DD with zero padding', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});

describe('hashKey', () => {
  it('is deterministic and non-negative', () => {
    expect(hashKey('2026-07-11')).toBe(hashKey('2026-07-11'));
    expect(hashKey('2026-07-11')).toBeGreaterThanOrEqual(0);
  });

  it('differs across nearby dates', () => {
    expect(hashKey('2026-07-11')).not.toBe(hashKey('2026-07-12'));
  });
});

describe('pickWordOfDay', () => {
  const slangDeck = makeDeck(
    'deck-slang',
    'Jerga Colombiana',
    Array.from({ length: 10 }, (_, i) => makeCard(`s${i}`, { tags: ['slang'] })),
  );
  const plainDeck = makeDeck(
    'deck-numbers',
    'Numbers',
    Array.from({ length: 10 }, (_, i) => makeCard(`n${i}`)),
  );

  it('returns undefined when there are no cards', () => {
    expect(pickWordOfDay([], new Date())).toBeUndefined();
    expect(pickWordOfDay([makeDeck('d', 'Empty', [])], new Date())).toBeUndefined();
  });

  it('is stable for the same date', () => {
    const a = pickWordOfDay([slangDeck, plainDeck], new Date(2026, 6, 11));
    const b = pickWordOfDay([slangDeck, plainDeck], new Date(2026, 6, 11));
    expect(a?.card.id).toBe(b?.card.id);
  });

  it('rotates across days', () => {
    const picks = new Set(
      Array.from(
        { length: 14 },
        (_, i) => pickWordOfDay([slangDeck, plainDeck], new Date(2026, 6, 1 + i))?.card.id,
      ),
    );
    // 14 days over a 10-card pool must produce more than one distinct pick
    expect(picks.size).toBeGreaterThan(1);
  });

  it('prefers Colombian-tagged content', () => {
    for (let day = 1; day <= 14; day += 1) {
      const pick = pickWordOfDay([slangDeck, plainDeck], new Date(2026, 6, day));
      expect(pick?.deckId).toBe('deck-slang');
    }
  });

  it('falls back to the full pool when nothing matches the Colombian filter', () => {
    const pick = pickWordOfDay([plainDeck], new Date(2026, 6, 11));
    expect(pick).toBeDefined();
    expect(pick?.deckId).toBe('deck-numbers');
  });

  it('is independent of deck order', () => {
    const a = pickWordOfDay([slangDeck, plainDeck], new Date(2026, 6, 11));
    const b = pickWordOfDay([plainDeck, slangDeck], new Date(2026, 6, 11));
    expect(a?.card.id).toBe(b?.card.id);
  });

  it('uses the provided deck name resolver', () => {
    const pick = pickWordOfDay([slangDeck], new Date(2026, 6, 11), () => 'Custom Name');
    expect(pick?.deckName).toBe('Custom Name');
  });
});
