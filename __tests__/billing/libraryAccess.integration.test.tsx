import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { ALL_DECKS } from '../../src/data/decks';
import { saveDecks } from '../../src/storage/storage';

let mockFullLibrary = false;
let mockBillingReady = true;
jest.mock('../../src/context/PurchaseContext', () => ({
  usePurchases: () => ({ ready: mockBillingReady, fullLibrary: mockFullLibrary }),
}));
let current: ReturnType<typeof useDeckContext>;
function Probe() {
  const value = useDeckContext();
  React.useEffect(() => {
    current = value;
  });
  return <Text>{value.ready ? value.decks.length : 'loading'}</Text>;
}
beforeEach(async () => {
  await AsyncStorage.clear();
  mockFullLibrary = false;
});
it('starts free, survives restart and does not treat an imported backup as an old installation', async () => {
  const view = render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toHaveLength(10);
  view.unmount();
  await saveDecks(ALL_DECKS);
  const again = render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toHaveLength(10);
  expect(current.allDecks).toHaveLength(47);
  again.unmount();
});
it('keeps the existing installation library and exact learned progress', async () => {
  const old = JSON.parse(JSON.stringify(ALL_DECKS));
  old[0].cards[0].reps = 7;
  await saveDecks(old);
  render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toHaveLength(47);
  expect(current.hasFullLibrary).toBe(true);
  expect(current.decks[0].cards[0].reps).toBe(7);
});
it('purchase then revocation changes all learning access without deleting stored progress', async () => {
  const view = render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  await waitFor(() => expect(current.ready).toBe(true));
  mockFullLibrary = true;
  view.rerender(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  expect(current.decks).toHaveLength(47);
  const paid = current.decks.find((d) => d.id === 'deck-business')!;
  act(() => current.setActiveDeckId(paid.id));
  expect(current.activeDeck?.id).toBe(paid.id);
  mockFullLibrary = false;
  view.rerender(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  expect(current.decks).toHaveLength(10);
  expect(current.activeDeck?.id).not.toBe(paid.id);
  expect(current.getStudyBatch().every((c) => !paid.cards.some((p) => p.id === c.id))).toBe(true);
  await expect(current.recordAnswer(paid.cards[0].id, 4)).rejects.toThrow('Library access');
  expect(current.allDecks).toHaveLength(47);
});

it('does not block free learning on a slow or offline billing startup', async () => {
  mockBillingReady = false;
  render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toHaveLength(10);
  mockBillingReady = true;
});
