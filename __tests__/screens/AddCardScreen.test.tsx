import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Dimensions } from 'react-native';
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
    ready: true,
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

const originalWindow = Dimensions.get('window');
afterEach(() => act(() => Dimensions.set({ window: originalWindow })));
function fillCard(ui: ReturnType<typeof render>) {
  fireEvent.changeText(ui.getByPlaceholderText('¿Qué más pues?'), '¿Listo?');
  fireEvent.changeText(ui.getByPlaceholderText('What’s up?'), 'Ready?');
}

test('keeps one pending card intent and blocks edits through live resizing until confirmed saved', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const save = jest.fn(() => pending);
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), addCardToDeck: save });
  const ui = render(<AddCardScreen />);
  fillCard(ui);
  fireEvent.press(ui.getByText('Save card ✓'));
  fireEvent.press(ui.getByText('Save card ✓'));
  expect(save).toHaveBeenCalledTimes(1);
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByDisplayValue('¿Listo?').props.editable).toBe(false);
  expect(ui.getByRole('button', { name: 'Choose a deck', disabled: true })).toBeTruthy();
  await act(async () => release());
  expect(ui.queryByDisplayValue('¿Listo?')).toBeNull();
  expect(Alert.alert).toHaveBeenCalledWith('Added', 'Card added to Saludos');
});

test('retains the exact failed card payload and identity for retry instead of losing or duplicating it', async () => {
  const save = jest.fn().mockRejectedValueOnce(new Error('disk full')).mockResolvedValue(undefined);
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), addCardToDeck: save });
  const ui = render(<AddCardScreen />);
  fillCard(ui);
  fireEvent.press(ui.getByText('Save card ✓'));
  await ui.findByText('Could not confirm the save. Your draft is kept. Retry the same save.');
  expect(ui.getByDisplayValue('¿Listo?')).toBeTruthy();
  const first = save.mock.calls[0];
  fireEvent.changeText(ui.getByDisplayValue('¿Listo?'), 'ignored pending edit');
  fireEvent.press(ui.getByRole('button', { name: 'Retry save' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1]).toEqual(first);
  expect(first[1]).toMatchObject({ front: '¿Listo?', back: 'Ready?' });
  await waitFor(() => expect(ui.queryByDisplayValue('¿Listo?')).toBeNull());
});

test('blocks missing selected deck without discarding entered card fields', () => {
  const ui = render(<AddCardScreen />);
  fillCard(ui);
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), decks: [] });
  ui.rerender(<AddCardScreen />);
  fireEvent.press(ui.getByText('Save card ✓'));
  expect(mockUseDeck().addCardToDeck).not.toHaveBeenCalled();
  expect(ui.getByDisplayValue('¿Listo?')).toBeTruthy();
});

test('new-deck retry retains one identity and modal draft through failure and resizing', async () => {
  const create = jest
    .fn()
    .mockRejectedValueOnce(new Error('disk full'))
    .mockResolvedValue({ id: 'new', name: 'Practice', cards: [] });
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), createDeck: create });
  const ui = render(<AddCardScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'Choose a deck' }));
  fireEvent.press(ui.getByText('➕ New deck'));
  fireEvent.changeText(ui.getByPlaceholderText('Name (e.g., Colombianisms)'), 'Practice');
  fireEvent.press(ui.getByRole('button', { name: 'Create' }));
  await ui.findByText('Could not confirm the save. Your draft is kept. Retry the same save.');
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByDisplayValue('Practice').props.editable).toBe(false);
  fireEvent.press(ui.getByRole('button', { name: 'Retry save' }));
  await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
  expect(create.mock.calls[1]).toEqual(create.mock.calls[0]);
  expect(create.mock.calls[0][2]).toEqual(expect.any(String));
  await waitFor(() => expect(ui.queryByDisplayValue('Practice')).toBeNull());
});

test('can return to the retained draft after a target disappears without automatically submitting another create', async () => {
  const save = jest.fn().mockRejectedValue(new Error('deck removed'));
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), addCardToDeck: save });
  const ui = render(<AddCardScreen />);
  fillCard(ui);
  fireEvent.press(ui.getByText('Save card ✓'));
  await ui.findByText('Could not confirm the save. Your draft is kept. Retry the same save.');
  fireEvent.press(ui.getByRole('button', { name: 'Return to editing' }));
  expect(ui.getByDisplayValue('¿Listo?').props.editable).toBe(true);
  expect(save).toHaveBeenCalledTimes(1);
  expect(ui.queryByRole('button', { name: 'Retry save' })).toBeNull();
});
