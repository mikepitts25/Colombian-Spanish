import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AddCardScreen from '../../src/screens/AddCardScreen';

let mockLanguage: 'es' | 'en' = 'en';

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      language: mockLanguage,
      setLanguage: jest.fn(),
      toggleLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) =>
        translate(mockLanguage, key, values),
    }),
  };
});

import { useDeck } from '../../src/hooks/useDeck';

const mockUseDeck = useDeck as jest.Mock;

beforeEach(() => {
  mockLanguage = 'en';
  mockUseDeck.mockReturnValue({
    decks: [{ id: 'deck-a', name: 'Saludos', cards: [] }],
    activeDeckId: 'deck-a',
    addCardToDeck: jest.fn().mockResolvedValue(undefined),
    createDeck: jest.fn().mockResolvedValue({ id: 'deck-new', name: 'New deck', cards: [] }),
  });
});

describe('AddCardScreen localization', () => {
  it('renders Add Card labels in English by default', async () => {
    const { getByText, getByPlaceholderText } = render(<AddCardScreen />);

    await waitFor(() => expect(getByText('Add new card')).toBeTruthy());
    expect(getByText('Front (Colombian Spanish)')).toBeTruthy();
    expect(getByText('Back (English)')).toBeTruthy();
    expect(getByPlaceholderText('What’s up?')).toBeTruthy();
  });

  it('renders Add Card labels in Spanish when UI language is Spanish', async () => {
    mockLanguage = 'es';

    const { getByText, getByPlaceholderText } = render(<AddCardScreen />);

    await waitFor(() => expect(getByText('Agregar tarjeta')).toBeTruthy());
    expect(getByText('Frente (español colombiano)')).toBeTruthy();
    expect(getByText('Reverso (inglés)')).toBeTruthy();
    expect(getByPlaceholderText('¿Qué más pues?')).toBeTruthy();
  });
});
