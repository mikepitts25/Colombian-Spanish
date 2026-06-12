import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ManageDecksScreen from '../../src/screens/ManageDecksScreen';
import { useDeck } from '../../src/hooks/useDeck';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

const mockUseDeck = useDeck as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [],
    renameDeck: jest.fn(),
    deleteDeck: jest.fn(),
    resetDeckProgress: jest.fn(),
    setActiveDeckId: jest.fn(),
  });
});

describe('ManageDecksScreen navigation', () => {
  it('navigates directly to the Home tab', () => {
    const { getByText } = render(<ManageDecksScreen />);

    fireEvent.press(getByText('Home'));

    expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' });
  });

  it('opens the translation review screen', () => {
    const { getByText } = render(<ManageDecksScreen />);

    fireEvent.press(getByText('🚩 Review Translations'));

    expect(mockNavigate).toHaveBeenCalledWith('Review');
  });
});
