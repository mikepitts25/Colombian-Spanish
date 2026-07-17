import { Deck, FlashCard } from '../../src/types';
import { getAvailablePhraseTopics, getPhraseTopicCards } from '../../src/utils/phraseTopics';

const NOW = Date.now();

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'Hola',
    back: 'Hello',
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const CONVERSATION_DECK: Deck = {
  id: 'deck-conversation',
  name: 'Conversation',
  cards: [makeCard('conversation-1')],
};

const WEATHER_DECK: Deck = {
  id: 'deck-weather',
  name: 'Weather',
  cards: [
    makeCard('weather-word', { front: 'nublado', tags: ['weather'] }),
    makeCard('weather-phrase', { front: 'Está lloviendo afuera', tags: ['weather', 'phrase'] }),
  ],
};

describe('phrase topics', () => {
  it('returns only topics whose source decks are available', () => {
    expect(
      getAvailablePhraseTopics([CONVERSATION_DECK, WEATHER_DECK]).map((topic) => topic.id),
    ).toEqual(['conversation', 'weather']);
  });

  it('keeps Weather browsing focused on conversational phrase cards', () => {
    const weatherTopic = getAvailablePhraseTopics([WEATHER_DECK])[0];

    expect(getPhraseTopicCards(weatherTopic, WEATHER_DECK).map((card) => card.id)).toEqual([
      'weather-phrase',
    ]);
  });
});
