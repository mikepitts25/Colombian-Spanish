import type { Deck, FlashCard } from '../types';

export type PhraseTopicId =
  | 'conversation'
  | 'essentials'
  | 'social'
  | 'dining'
  | 'transport'
  | 'accommodation'
  | 'medical'
  | 'weather';

export type PhraseTopic = {
  id: PhraseTopicId;
  deckId: string;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  studyKey: string;
  cardTag?: string;
};

export type AvailablePhraseTopic = PhraseTopic & {
  deck: Deck;
  cards: FlashCard[];
};

export const PHRASE_TOPICS: readonly PhraseTopic[] = [
  {
    id: 'conversation',
    deckId: 'deck-conversation',
    emoji: '💬',
    titleKey: 'phrases.topic.conversation.title',
    descriptionKey: 'phrases.topic.conversation.sub',
    studyKey: 'phrases.study.conversation',
  },
  {
    id: 'essentials',
    deckId: 'deck-useful-phrases',
    emoji: '⭐',
    titleKey: 'phrases.topic.essentials.title',
    descriptionKey: 'phrases.topic.essentials.sub',
    studyKey: 'phrases.study.essentials',
  },
  {
    id: 'social',
    deckId: 'deck-social-phrases',
    emoji: '🪩',
    titleKey: 'phrases.topic.social.title',
    descriptionKey: 'phrases.topic.social.sub',
    studyKey: 'phrases.study.social',
  },
  {
    id: 'dining',
    deckId: 'deck-restaurant-phrases',
    emoji: '🍽️',
    titleKey: 'phrases.topic.dining.title',
    descriptionKey: 'phrases.topic.dining.sub',
    studyKey: 'phrases.study.dining',
  },
  {
    id: 'transport',
    deckId: 'deck-transport-phrases',
    emoji: '🚌',
    titleKey: 'phrases.topic.transport.title',
    descriptionKey: 'phrases.topic.transport.sub',
    studyKey: 'phrases.study.transport',
  },
  {
    id: 'accommodation',
    deckId: 'deck-accommodation-phrases',
    emoji: '🏨',
    titleKey: 'phrases.topic.accommodation.title',
    descriptionKey: 'phrases.topic.accommodation.sub',
    studyKey: 'phrases.study.accommodation',
  },
  {
    id: 'medical',
    deckId: 'deck-medical-phrases',
    emoji: '🩺',
    titleKey: 'phrases.topic.medical.title',
    descriptionKey: 'phrases.topic.medical.sub',
    studyKey: 'phrases.study.medical',
  },
  {
    id: 'weather',
    deckId: 'deck-weather',
    emoji: '🌦️',
    titleKey: 'phrases.topic.weather.title',
    descriptionKey: 'phrases.topic.weather.sub',
    studyKey: 'phrases.study.weather',
    cardTag: 'phrase',
  },
];

export function getPhraseTopicCards(topic: PhraseTopic, deck: Deck): FlashCard[] {
  const cardTag = topic.cardTag;
  if (!cardTag) return deck.cards;
  return deck.cards.filter((card) => card.tags?.includes(cardTag));
}

export function getAvailablePhraseTopics(decks: readonly Deck[]): AvailablePhraseTopic[] {
  return PHRASE_TOPICS.flatMap((topic) => {
    const deck = decks.find((candidate) => candidate.id === topic.deckId);
    if (!deck) return [];

    const cards = getPhraseTopicCards(topic, deck);
    return cards.length > 0 ? [{ ...topic, deck, cards }] : [];
  });
}
