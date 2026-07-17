import { ALL_DECKS } from '../../src/data/decks';
import { WeatherDeck } from '../../src/data/decks/weather';

describe('topic phrase content', () => {
  it('seeds every dedicated phrase deck', () => {
    expect(ALL_DECKS.map((deck) => deck.id)).toEqual(
      expect.arrayContaining([
        'deck-conversation',
        'deck-useful-phrases',
        'deck-social-phrases',
        'deck-restaurant-phrases',
        'deck-transport-phrases',
        'deck-accommodation-phrases',
        'deck-medical-phrases',
      ]),
    );
  });

  it('includes everyday conversational Weather phrases', () => {
    const phrases = WeatherDeck.cards.filter((card) => card.tags?.includes('phrase'));

    expect(phrases.map((card) => card.front)).toEqual(
      expect.arrayContaining(['Hace mucho calor hoy', 'Estoy sudando', 'Está lloviendo afuera']),
    );
    expect(phrases.every((card) => card.tags?.includes('weather'))).toBe(true);
  });
});
