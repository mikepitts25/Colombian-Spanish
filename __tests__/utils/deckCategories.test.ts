import { ALL_DECKS } from '../../src/data/decks';
import {
  CategoryKey,
  getCategoryForDeck,
  getDeckDisplayName,
  getPreferredDeckForCategory,
} from '../../src/utils/deckCategories';

function deckById(id: string) {
  const deck = ALL_DECKS.find((candidate) => candidate.id === id);
  if (!deck) throw new Error(`Missing test deck: ${id}`);
  return deck;
}

describe('deck category mapping', () => {
  it('maps loaded seed decks to their intended browse categories', () => {
    expect(getCategoryForDeck(deckById('deck-family'))).toBe('People & Relationships');
    expect(getCategoryForDeck(deckById('deck-body'))).toBe('Health');
    expect(getCategoryForDeck(deckById('deck-colombian-food'))).toBe('Food & Drink');
    expect(getCategoryForDeck(deckById('deck-business'))).toBe('Work & School');
    expect(getCategoryForDeck(deckById('deck-professions'))).toBe('Work & School');
    expect(getCategoryForDeck(deckById('deck-routines'))).toBe('Home & Daily Life');
    expect(getCategoryForDeck(deckById('deck-slang'))).toBe('Colombianisms');
  });

  it('prefers the family deck over related non-family decks for the people category', () => {
    const preferredDeck = getPreferredDeckForCategory(
      [deckById('deck-body'), deckById('deck-family')],
      'People & Relationships',
    );

    expect(preferredDeck?.id).toBe('deck-family');
  });

  it('uses canonical English display names for seed decks', () => {
    expect(getDeckDisplayName(deckById('deck-greetings'))).toBe('Greetings');
    expect(getDeckDisplayName(deckById('deck-technology'))).toBe('Tech');
    expect(getDeckDisplayName(deckById('deck-transport'))).toBe('Transportation');
    expect(getDeckDisplayName(deckById('deck-health'))).toBe('Health');
  });

  it('aligns preferred category deck titles with English browse category labels', () => {
    const expectedTitles: [CategoryKey, string][] = [
      ['Colombianisms', 'Colombian Slang'],
      ['Essentials', 'Essentials'],
      ['People & Relationships', 'Family'],
      ['Places & Travel', 'Transportation'],
      ['Home & Daily Life', 'Home & Daily Life'],
      ['Food & Drink', 'Food & Drink'],
      ['Communication', 'Communication'],
      ['Health', 'Health'],
      ['Nature', 'Nature'],
      ['Work & School', 'Business'],
      ['Numbers & Time', 'Numbers & Time'],
      ['Fun & Culture', 'Music & Culture'],
      ['Tech', 'Tech'],
    ];

    expectedTitles.forEach(([category, title]) => {
      const preferredDeck = getPreferredDeckForCategory(ALL_DECKS, category);
      expect(preferredDeck).toBeTruthy();
      expect(getDeckDisplayName(preferredDeck!)).toBe(title);
    });
  });
});
