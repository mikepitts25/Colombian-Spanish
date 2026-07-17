import { recommendDeckId } from '../../src/screens/OnboardingScreen';
import { Deck } from '../../src/types';

function deck(id: string): Deck {
  return { id, name: id, cards: [] };
}

const ALL = [
  deck('deck-travel'),
  deck('deck-useful-phrases'),
  deck('deck-dating'),
  deck('deck-business'),
  deck('deck-culture'),
  deck('deck-greetings'),
  deck('deck-paisa'),
  deck('deck-rolo'),
  deck('deck-costeno'),
  deck('deck-valluno'),
  deck('deck-slang'),
];

describe('recommendDeckId', () => {
  it('prioritizes the concrete need for dating/work/travel reasons', () => {
    expect(recommendDeckId('love', 'paisa', ALL)).toBe('deck-dating');
    expect(recommendDeckId('work', 'rolo', ALL)).toBe('deck-business');
    expect(recommendDeckId('travel', 'costeno', ALL)).toBe('deck-travel');
  });

  it('prioritizes regional slang for move/culture/general reasons', () => {
    expect(recommendDeckId('move', 'paisa', ALL)).toBe('deck-paisa');
    expect(recommendDeckId('culture', 'valluno', ALL)).toBe('deck-valluno');
    expect(recommendDeckId('general', 'rolo', ALL)).toBe('deck-rolo');
  });

  it('uses the general slang deck when no region is chosen', () => {
    expect(recommendDeckId('move', 'all', ALL)).toBe('deck-slang');
  });

  it('falls back through the candidate chain when decks are missing', () => {
    const noDating = ALL.filter((d) => d.id !== 'deck-dating');
    expect(recommendDeckId('love', 'paisa', noDating)).toBe('deck-paisa');

    const onlyGreetings = [deck('deck-greetings')];
    expect(recommendDeckId('love', 'paisa', onlyGreetings)).toBe('deck-greetings');
  });

  it('falls back to the first available deck as a last resort', () => {
    expect(recommendDeckId('general', 'all', [deck('custom-1')])).toBe('custom-1');
  });

  it('returns undefined with no decks at all', () => {
    expect(recommendDeckId('general', 'all', [])).toBeUndefined();
  });
});
