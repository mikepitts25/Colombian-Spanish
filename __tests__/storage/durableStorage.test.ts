import AsyncStorage from '@react-native-async-storage/async-storage';
import storage, { withStorageTransaction } from '../../src/storage/durableStorage';

const JOURNAL = 'SRS_WRITE_JOURNAL_V1';
const DECKS = 'SRS_DECKS_V3';
const EVENTS = 'SRS_LEARNING_EVENTS_V1';
const journal = (entries: [string, string][]) => JSON.stringify({ schemaVersion: 1, entries });
const originalSet = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
const originalRemove = (AsyncStorage.removeItem as jest.Mock).getMockImplementation()!;

beforeEach(async () => {
  (AsyncStorage.setItem as jest.Mock).mockImplementation(originalSet);
  (AsyncStorage.removeItem as jest.Mock).mockImplementation(originalRemove);
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

it('persists intent before data and removes it only after all writes', async () => {
  await withStorageTransaction(async (tx) => {
    await tx.setItem(DECKS, 'new decks');
    await tx.setItem(EVENTS, 'new events');
    expect(await AsyncStorage.getItem(DECKS)).toBeNull();
    expect(await tx.getItem(DECKS)).toBe('new decks');
  });
  const writes = (AsyncStorage.setItem as jest.Mock).mock.calls;
  const index = writes.findIndex(([key]) => key === JOURNAL);
  expect(index).toBeGreaterThanOrEqual(0);
  expect(writes.slice(index).map(([key]) => key)).toEqual([JOURNAL, DECKS, EVENTS]);
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
  expect(await storage.getItem(DECKS)).toBe('new decks');
});

it('does not change any data when preparing the journal fails', async () => {
  await AsyncStorage.setItem(DECKS, 'old');
  (AsyncStorage.setItem as jest.Mock).mockImplementationOnce(async () => {
    throw new Error('full');
  });
  await expect(withStorageTransaction(async (tx) => tx.setItem(DECKS, 'new'))).rejects.toThrow(
    'full',
  );
  expect(await AsyncStorage.getItem(DECKS)).toBe('old');
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
});

it('finishes partial writes before serving a read and replays absolute values once', async () => {
  let fail = true;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => {
    if (key === EVENTS && fail) {
      fail = false;
      throw new Error('interrupted');
    }
    return originalSet(key, value);
  });
  await expect(
    withStorageTransaction(async (tx) => {
      await tx.setItem(DECKS, 'new decks');
      await tx.setItem(EVENTS, 'new events');
    }),
  ).rejects.toThrow('interrupted');
  expect(await AsyncStorage.getItem(JOURNAL)).not.toBeNull();
  expect(await storage.getItem(EVENTS)).toBe('new events');
  expect(await storage.getItem(DECKS)).toBe('new decks');
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
});

it('recovers a persisted journal without an in-memory transaction', async () => {
  await AsyncStorage.setItem(JOURNAL, journal([[DECKS, 'restored']]));
  expect(await storage.getItem(DECKS)).toBe('restored');
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
});

it('retains the journal when cleanup fails and recovers before the next write', async () => {
  (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('cleanup'));
  await expect(withStorageTransaction(async (tx) => tx.setItem(DECKS, 'restored'))).rejects.toThrow(
    'cleanup',
  );
  expect(await AsyncStorage.getItem(JOURNAL)).not.toBeNull();
  await storage.setItem(DECKS, 'later edit');
  expect(await storage.getItem(DECKS)).toBe('later edit');
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
});

it.each([
  '{broken',
  JSON.stringify({ schemaVersion: 99, entries: [] }),
  journal([['foreign-key', 'value']]),
  journal([
    [DECKS, 'first'],
    [DECKS, 'second'],
  ]),
  JSON.stringify({ schemaVersion: 1, entries: [[DECKS, null]] }),
])('fails closed for a malformed journal %s', async (raw) => {
  await AsyncStorage.setItem(DECKS, 'safe');
  await AsyncStorage.setItem(JOURNAL, raw);
  await expect(storage.getItem(DECKS)).rejects.toThrow();
  expect(await AsyncStorage.getItem(DECKS)).toBe('safe');
  expect(await AsyncStorage.getItem(JOURNAL)).toBe(raw);
});

it('serializes a queued write behind a transaction snapshot', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const first = withStorageTransaction(async (tx) => {
    await tx.setItem(DECKS, 'transaction');
    await pending;
  });
  const later = storage.setItem(DECKS, 'later');
  release();
  await Promise.all([first, later]);
  expect(await storage.getItem(DECKS)).toBe('later');
});

it('does not commit buffered values when the operation rejects', async () => {
  await expect(
    withStorageTransaction(async (tx) => {
      await tx.setItem(DECKS, 'bad');
      throw new Error('invalid');
    }),
  ).rejects.toThrow('invalid');
  expect(await storage.getItem(DECKS)).toBeNull();
  expect(await AsyncStorage.getItem(JOURNAL)).toBeNull();
});
