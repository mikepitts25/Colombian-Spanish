import { cardMatchesRegion, getCardRegion, REGION_FILTERS } from '../../src/utils/regions';
import { FlashCard } from '../../src/types';

const NOW = 1_700_000_000_000;

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'card',
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

describe('region filters', () => {
  it('exposes the expected Colombian region chips', () => {
    expect(REGION_FILTERS.map((region) => region.id)).toEqual([
      'all',
      'general',
      'paisa',
      'rolo',
      'costeno',
      'valluno',
    ]);
  });

  it('matches cards by regional tags and deck metadata', () => {
    expect(cardMatchesRegion(makeCard({ tags: ['paisa'] }), 'paisa', 'Any deck')).toBe(true);
    expect(cardMatchesRegion(makeCard({ tags: ['Bogotá'] }), 'rolo', 'Any deck')).toBe(true);
    expect(cardMatchesRegion(makeCard({ tags: ['Caribe'] }), 'costeno', 'Any deck')).toBe(true);
    expect(cardMatchesRegion(makeCard({ tags: ['Cali'] }), 'valluno', 'Any deck')).toBe(true);
    expect(cardMatchesRegion(makeCard(), 'paisa', 'Paisa Slang (Medellín)')).toBe(true);
  });

  it('treats general Colombian Spanish as cards without a specific region marker', () => {
    expect(cardMatchesRegion(makeCard({ tags: ['slang', 'Colombia'] }), 'general', 'Slang')).toBe(true);
    expect(cardMatchesRegion(makeCard({ tags: ['paisa'] }), 'general', 'Slang')).toBe(false);
  });

  it('returns a display label for the first matching region', () => {
    expect(getCardRegion(makeCard({ tags: ['valluno', 'Cali'] }), 'Valluno Slang')).toBe('Valluno');
    expect(getCardRegion(makeCard({ tags: ['food'] }), 'Food')).toBe('General');
  });
});
