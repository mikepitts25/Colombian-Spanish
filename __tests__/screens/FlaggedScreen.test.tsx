import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import FlaggedScreen from '../../src/screens/FlaggedScreen';
import { useDeck } from '../../src/hooks/useDeck';

jest.mock('../../src/hooks/useDeck', () => ({ useDeck: jest.fn() }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
const mockPreventRemove = jest.fn();
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: (...args: unknown[]) => mockPreventRemove(...args),
}));
const mockUseDeck = useDeck as jest.Mock;
const mockCopy = Clipboard.setStringAsync as jest.Mock;
const clear = jest.fn();
const decks = [
  {
    id: 'd',
    name: 'Deck "quoted"',
    cards: [
      { id: 'c', front: 'Hola, amigo', back: 'Hello\nfriend', example: 'Example', flagged: true },
    ],
  },
];
const originalWindow = Dimensions.get('window');
function invokePress(screen: ReturnType<typeof render>, label: string) {
  let node = screen.getByText(label);
  while (typeof node.props.onPress !== 'function' && node.parent) node = node.parent;
  return node.props.onPress();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDeck.mockReturnValue({ ready: true, decks, clearAllFlags: clear });
  mockCopy.mockReset().mockResolvedValue(undefined);
  clear.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => Dimensions.set({ window: originalWindow }));
  jest.restoreAllMocks();
});

it('catches clipboard failure, reports no success, and permits a deliberate retry', async () => {
  const alerts = jest.spyOn(Alert, 'alert');
  mockCopy.mockRejectedValueOnce(new Error('clipboard unavailable'));
  const screen = render(<FlaggedScreen />);
  await act(async () => {
    await expect(invokePress(screen, '📋 Copiar CSV')).resolves.toBeUndefined();
  });
  expect(alerts).not.toHaveBeenCalled();
  expect(screen.getByText('No se pudo copiar el CSV. Inténtalo de nuevo.')).toBeTruthy();
  fireEvent.press(screen.getByText('📋 Copiar CSV'));
  await waitFor(() => expect(alerts).toHaveBeenCalledWith('¡Copiado!', expect.any(String)));
  expect(mockCopy).toHaveBeenCalledTimes(2);
});

it('exports one exact quoted snapshot and blocks overlap until acknowledged', async () => {
  let release!: () => void;
  mockCopy.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const alerts = jest.spyOn(Alert, 'alert');
  const screen = render(<FlaggedScreen />);
  fireEvent.press(screen.getByText('📋 Copiar CSV'));
  fireEvent.press(screen.getByText('📋 Copiar CSV'));
  fireEvent.press(screen.getByText('Borrar todo'));
  expect(mockCopy).toHaveBeenCalledTimes(1);
  expect(alerts).not.toHaveBeenCalled();
  expect(mockPreventRemove).toHaveBeenLastCalledWith(true, expect.any(Function));
  expect(mockCopy).toHaveBeenCalledWith(
    'Deck,Card ID,Spanish,English,Example\n"Deck ""quoted""","c","Hola, amigo","Hello\nfriend","Example"',
  );
  await act(async () => release());
  expect(mockPreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));
});

it('holds a single clear across duplicate confirmations and font changes', async () => {
  let release!: () => void;
  clear.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const alerts = jest.spyOn(Alert, 'alert');
  const screen = render(<FlaggedScreen />);
  fireEvent.press(screen.getByText('Borrar todo'));
  const confirm = alerts.mock.calls[0][2]![1].onPress!;
  act(() => {
    confirm();
    confirm();
  });
  act(() => Dimensions.set({ window: { ...originalWindow, fontScale: 2 } }));
  fireEvent.press(screen.getByText('📋 Copiar CSV'));
  expect(clear).toHaveBeenCalledTimes(1);
  expect(mockCopy).not.toHaveBeenCalled();
  expect(mockPreventRemove).toHaveBeenLastCalledWith(true, expect.any(Function));
  await act(async () => release());
  expect(mockPreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));
});

it('handles uncertain clear failure without automatic replay and requires fresh confirmation', async () => {
  const alerts = jest.spyOn(Alert, 'alert');
  clear.mockRejectedValueOnce(new Error('storage unavailable'));
  const screen = render(<FlaggedScreen />);
  fireEvent.press(screen.getByText('Borrar todo'));
  await act(async () => {
    await expect(alerts.mock.calls[0][2]![1].onPress!()).resolves.toBeUndefined();
  });
  expect(
    screen.getByText(
      'No se pudo confirmar el borrado de marcas. Revisa la lista antes de intentarlo de nuevo.',
    ),
  ).toBeTruthy();
  expect(clear).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByText('Borrar todo'));
  expect(alerts).toHaveBeenCalledTimes(2);
  expect(clear).toHaveBeenCalledTimes(1);
  await act(async () => {
    await alerts.mock.calls[1][2]![1].onPress!();
  });
  expect(clear).toHaveBeenCalledTimes(2);
});

it('does not show a late export alert after screen removal', async () => {
  let release!: () => void;
  mockCopy.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  const alerts = jest.spyOn(Alert, 'alert');
  const screen = render(<FlaggedScreen />);
  fireEvent.press(screen.getByText('📋 Copiar CSV'));
  screen.unmount();
  await act(async () => release());
  expect(mockCopy).toHaveBeenCalledTimes(1);
  expect(alerts).not.toHaveBeenCalled();
});
