import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = 'SRS_WRITE_JOURNAL_V1';
const DATA_KEYS = new Set([
  'SRS_DECKS_V3',
  'SRS_DAILY_PROGRESS_V1',
  'SRS_LAST_STUDY_SESSION_V1',
  'SRS_STUDY_STREAK_V1',
  'SRS_STREAK_V1',
  'SRS_SEEN_WORDS_V1',
  'SRS_QUIZ_HISTORY_V1',
  'SRS_LEARNING_EVENTS_V1',
  'SRS_PREFS_V1',
  'SRS_NOTIFICATION_PREFS_V1',
]);
export interface StorageAccess {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
let operations: Promise<unknown> = Promise.resolve();

function assertKey(key: string) {
  if (!DATA_KEYS.has(key)) throw new Error('Unsupported application storage key');
}

async function apply(entries: [string, string][]) {
  for (const [key, value] of entries) await AsyncStorage.setItem(key, value);
  await AsyncStorage.removeItem(JOURNAL_KEY);
}

async function recover() {
  const raw = await AsyncStorage.getItem(JOURNAL_KEY);
  if (raw === null) return;
  const journal = JSON.parse(raw);
  if (journal?.schemaVersion !== 1 || !Array.isArray(journal.entries) || !journal.entries.length) {
    throw new Error('Invalid storage recovery journal');
  }
  const seen = new Set<string>();
  // Check every entry before applying any of them. Never discard a bad journal.
  for (const entry of journal.entries) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== 'string' ||
      typeof entry[1] !== 'string' ||
      seen.has(entry[0])
    ) {
      throw new Error('Invalid storage recovery entry');
    }
    assertKey(entry[0]);
    seen.add(entry[0]);
  }
  await apply(journal.entries);
}

function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const result = operations.then(async () => {
    await recover();
    return operation();
  });
  operations = result.catch(() => {});
  return result;
}

// All app storage access passes recovery first, including startup and event writes.
const storage: StorageAccess = {
  getItem: (key) =>
    serialized(async () => {
      assertKey(key);
      return AsyncStorage.getItem(key);
    }),
  setItem: (key, value) =>
    serialized(async () => {
      assertKey(key);
      await AsyncStorage.setItem(key, value);
    }),
};
export default storage;

/** Buffer a single intent; a durable journal is rolled forward before later access. */
export function withStorageTransaction<T>(
  operation: (tx: StorageAccess) => Promise<T>,
): Promise<T> {
  return serialized(async () => {
    const buffered = new Map<string, string>();
    let open = true;
    const check = (key: string) => {
      if (!open) throw new Error('Storage transaction is closed');
      assertKey(key);
    };
    const tx: StorageAccess = {
      getItem: async (key) => {
        check(key);
        return buffered.get(key) ?? AsyncStorage.getItem(key);
      },
      setItem: async (key, value) => {
        check(key);
        if (typeof value !== 'string') throw new Error('Invalid storage value');
        buffered.set(key, value);
      },
    };
    let result: T;
    try {
      result = await operation(tx);
    } finally {
      open = false;
    }
    if (buffered.size) {
      const entries = [...buffered.entries()];
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify({ schemaVersion: 1, entries }));
      await apply(entries);
    }
    return result;
  });
}
