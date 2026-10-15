import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import StorageGate from '../../src/components/StorageGate';
import storage from '../../src/storage/durableStorage';
jest.mock('../../src/storage/durableStorage', () => ({
  __esModule: true,
  default: { getItem: jest.fn() },
}));

it('does not mount the app until storage recovery succeeds', async () => {
  let release!: (value: null) => void;
  (storage.getItem as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const screen = render(
    <StorageGate>
      <Text>App mounted</Text>
    </StorageGate>,
  );
  expect(screen.queryByText('App mounted')).toBeNull();
  await act(async () => release(null));
  expect(await screen.findByText('App mounted')).toBeTruthy();
});

it('offers retry after a failed recovery without mounting or resetting the app', async () => {
  (storage.getItem as jest.Mock)
    .mockRejectedValueOnce(new Error('storage unavailable'))
    .mockResolvedValueOnce(null);
  const screen = render(
    <StorageGate>
      <Text>App mounted</Text>
    </StorageGate>,
  );
  const retry = await screen.findByText('Reintentar / Try again');
  expect(screen.queryByText('App mounted')).toBeNull();
  fireEvent.press(retry);
  expect(await screen.findByText('App mounted')).toBeTruthy();
});
