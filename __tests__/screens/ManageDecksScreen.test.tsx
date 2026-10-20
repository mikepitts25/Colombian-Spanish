import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  View,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import ManageDecksScreen from '../../src/screens/ManageDecksScreen';
import { useDeck } from '../../src/hooks/useDeck';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  usePreventRemove: jest.fn(),
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

    fireEvent.press(getByText('Inicio'));

    expect(mockNavigate).toHaveBeenCalledWith('Root', { screen: 'Home' }, { pop: true });
  });

  it('opens the translation review screen', () => {
    const { getByText } = render(<ManageDecksScreen />);

    fireEvent.press(getByText('🚩 Revisar Traducciones'));

    expect(mockNavigate).toHaveBeenCalledWith('Review');
  });
});

const originalWindow = Dimensions.get('window');
afterEach(() => {
  act(() => Dimensions.set({ window: originalWindow }));
  jest.restoreAllMocks();
});
const oneDeck = { id: 'd1', name: 'Prueba', cards: [] };

test('keeps one rename and its draft across pending writes and live font changes', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const rename = jest.fn(() => pending);
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), decks: [oneDeck], renameDeck: rename });
  const ui = render(<ManageDecksScreen />);
  fireEvent.press(ui.getByText('Renombrar'));
  fireEvent.changeText(ui.getByPlaceholderText('Nombre del deck'), 'Nombre nuevo');
  fireEvent.press(ui.getByText('Guardar'));
  fireEvent.press(ui.getByText('Guardar'));
  expect(rename).toHaveBeenCalledTimes(1);
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 3.2 } }));
  expect(ui.getByDisplayValue('Nombre nuevo').props.editable).toBe(false);
  expect(ui.getByRole('button', { name: 'Cancelar', disabled: true })).toBeTruthy();
  await act(async () => release());
  await waitFor(() => expect(ui.queryByDisplayValue('Nombre nuevo')).toBeNull());
  expect(rename).toHaveBeenCalledWith('d1', 'Nombre nuevo');
});

test('retains rejected rename text for exact retry and preserves the list query', async () => {
  let rejectFirst!: (error: Error) => void;
  let finishRetry!: () => void;
  const rename = jest
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectFirst = reject;
        }),
    )
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishRetry = resolve;
        }),
    );
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), decks: [oneDeck], renameDeck: rename });
  const ui = render(<ManageDecksScreen />);
  fireEvent.changeText(ui.getByPlaceholderText('Buscar decks...'), 'Prueba');
  fireEvent.press(ui.getByText('Renombrar'));
  fireEvent.changeText(ui.getByPlaceholderText('Nombre del deck'), 'Nombre nuevo');
  fireEvent.press(ui.getByText('Guardar'));
  expect(rename).toHaveBeenCalledTimes(1);
  await act(async () => rejectFirst(new Error('disk full')));
  expect(
    ui.getByText(
      'No se pudo confirmar el guardado. Tu borrador se conserva. Reintenta el mismo guardado.',
    ),
  ).toBeTruthy();
  expect(ui.getByDisplayValue('Nombre nuevo')).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: 'Reintentar guardado', disabled: false }));
  expect(rename).toHaveBeenCalledTimes(2);
  expect(ui.getByDisplayValue('Nombre nuevo').props.editable).toBe(false);
  await act(async () => finishRetry());
  expect(ui.queryByDisplayValue('Nombre nuevo')).toBeNull();
  expect(rename.mock.calls).toEqual([
    ['d1', 'Nombre nuevo'],
    ['d1', 'Nombre nuevo'],
  ]);
  expect(ui.getByDisplayValue('Prueba')).toBeTruthy();
});

test.each([
  ['Eliminar', 'deleteDeck'],
  ['Reiniciar', 'resetDeckProgress'],
])(
  'handles failed confirmed %s and ignores duplicate confirmation callbacks',
  async (label, method) => {
    const operation = jest.fn().mockRejectedValue(new Error('disk full'));
    mockUseDeck.mockReturnValue({ ...mockUseDeck(), decks: [oneDeck], [method]: operation });
    const ui = render(<ManageDecksScreen />);
    fireEvent.press(ui.getByText(label));
    const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)![2];
    const confirm = buttons.find((button: any) => button.style === 'destructive').onPress;
    await act(async () => {
      await Promise.allSettled([confirm(), confirm()]);
    });
    expect(operation).toHaveBeenCalledTimes(1);
    await ui.findByText(
      'No se pudo confirmar el cambio. Revisa el deck antes de intentarlo otra vez.',
    );
    expect(ui.getByRole('button', { name: 'Inicio', disabled: false })).toBeTruthy();
  },
);

test('Android Rename retains an unsaved name within the keyboard-reduced dialog', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  mockUseDeck.mockReturnValue({ ...mockUseDeck(), decks: [oneDeck] });
  const ui = render(<ManageDecksScreen />);
  fireEvent.press(ui.getByText('Renombrar'));
  fireEvent.changeText(ui.getByPlaceholderText('Nombre del deck'), 'Prueba q');
  const avoiding = ui.UNSAFE_getByType(KeyboardAvoidingView);
  const viewport = avoiding.findAllByType(View)[0];
  await act(async () => {
    fireEvent(viewport, 'layout', {
      persist: jest.fn(),
      nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 700 } },
    });
    DeviceEventEmitter.emit('keyboardDidShow', {
      endCoordinates: { screenX: 0, screenY: 400, width: 360, height: 300 },
    });
  });
  expect(StyleSheet.flatten(viewport.props.style).height).toBe(400);
  expect(ui.getByDisplayValue('Prueba q')).toBeTruthy();
  fireEvent.press(ui.getByText('Cancelar'));
  expect(mockUseDeck().renameDeck).not.toHaveBeenCalled();
});
