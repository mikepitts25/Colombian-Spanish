import { ALL_DECKS } from '../../src/data/decks';

describe('deck example translations', () => {
  it('has English translations for every example sentence', () => {
    const missing = ALL_DECKS.flatMap((deck) =>
      deck.cards
        .filter((card) => card.example && !card.example.includes('|'))
        .map((card) => `${deck.id}:${card.id}:${card.front}`),
    );

    expect(missing).toEqual([]);
  });
});
