import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PhrasesScreen from '../../src/screens/PhrasesScreen';
import { Deck, FlashCard } from '../../src/types';

const mockNavigate = jest.fn();
const mockToggleFavorite = jest.fn();
const mockSpeakCard = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/services/tts', () => ({
  speakCard: (...args: unknown[]) => mockSpeakCard(...args),
}));

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      t: (key: any, values?: Record<string, string | number>) => translate('en', key, values),
    }),
  };
});

import { useDeck } from '../../src/hooks/useDeck';

const mockUseDeck = useDeck as jest.Mock;
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
    makeCard('weather-heat', {
      front: 'Hace mucho calor hoy',
      back: 'It is very hot today.',
      tags: ['weather', 'phrase'],
    }),
    makeCard('weather-sweat', {
      front: 'Estoy sudando',
      back: "I'm sweating.",
      tags: ['weather', 'phrase'],
    }),
    makeCard('weather-rain', {
      front: 'Está lloviendo afuera',
      back: "It's raining outside.",
      tags: ['weather', 'phrase'],
    }),
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [CONVERSATION_DECK, WEATHER_DECK],
    toggleFavorite: mockToggleFavorite,
  });
});

describe('PhrasesScreen', () => {
  it('browses requested Weather phrases by topic', () => {
    const { getByText, queryByText } = render(<PhrasesScreen />);

    expect(getByText('Everyday conversation')).toBeTruthy();
    expect(getByText('Weather today')).toBeTruthy();
    expect(queryByText('Hace mucho calor hoy')).toBeNull();

    fireEvent.press(getByText('Weather today'));

    expect(getByText('Hace mucho calor hoy')).toBeTruthy();
    expect(getByText('Estoy sudando')).toBeTruthy();
    expect(getByText('Está lloviendo afuera')).toBeTruthy();
    expect(queryByText('nublado')).toBeNull();
  });

  it('plays, saves, studies, and opens Favorites from a selected topic', () => {
    const { getByLabelText, getByText } = render(<PhrasesScreen />);

    fireEvent.press(getByText('Weather today'));
    fireEvent.press(getByLabelText('Play Hace mucho calor hoy'));
    fireEvent.press(getByLabelText('Save Hace mucho calor hoy'));
    fireEvent.press(getByText('Study weather'));
    fireEvent.press(getByLabelText('Open Favorites'));

    expect(mockSpeakCard).toHaveBeenCalledWith(expect.objectContaining({ id: 'weather-heat' }));
    expect(mockToggleFavorite).toHaveBeenCalledWith('weather-heat');
    expect(mockNavigate).toHaveBeenCalledWith('Root', {
      screen: 'Study',
      params: { autoStartDeckId: 'deck-weather' },
    });
    expect(mockNavigate).toHaveBeenCalledWith('Phrasebook');
  });
});
