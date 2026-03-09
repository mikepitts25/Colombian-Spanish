import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadDecks,
  saveDecks,
  upsertDeck,
  addCard,
  removeDeckById,
  renameDeckById,
  resetDeckProgressById,
  getDailyProgress,
  incrementDailyProgress,
  setDailyTarget,
  getStudyStreak,
  recordStudySession,
} from '../../src/storage/storage';
import { Deck, FlashCard } from '../../src/types';

// ── helpers ──────────────────────────────────────────────────────────────────

const NOW = 1_700_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'hola',
    back: 'hello',
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

function makeDeck(id: string, overrides: Partial<Deck> = {}): Deck {
  return {
    id,
    name: `Deck ${id}`,
    cards: [makeCard(`${id}-c1`)],
    ...overrides,
  };
}

/** Return an ISO midnight string for today */
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Return an ISO midnight string for yesterday */
function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Return an ISO midnight string for two days ago */
function twoDaysAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ── loadDecks ─────────────────────────────────────────────────────────────────

describe('loadDecks', () => {
  it('returns [] when storage is empty', async () => {
    const result = await loadDecks();
    expect(result).toEqual([]);
  });

  it('returns parsed decks when storage has valid JSON', async () => {
    const decks = [makeDeck('d1'), makeDeck('d2')];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(decks));
    const result = await loadDecks();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('d1');
  });

  it('returns [] when storage contains invalid JSON (corrupted recovery)', async () => {
    await AsyncStorage.setItem('SRS_DECKS_V3', '{not valid json{{');
    const result = await loadDecks();
    expect(result).toEqual([]);
  });

  it('returns [] when storage has null value', async () => {
    // AsyncStorage.getItem returns null when key absent
    const result = await loadDecks();
    expect(result).toEqual([]);
  });
});

// ── saveDecks / loadDecks round-trip ──────────────────────────────────────────

describe('saveDecks + loadDecks round-trip', () => {
  it('saves and re-loads the exact same decks', async () => {
    const decks = [makeDeck('alpha'), makeDeck('beta')];
    await saveDecks(decks);
    const loaded = await loadDecks();
    expect(loaded).toEqual(decks);
  });

  it('overwrites previous data on second save', async () => {
    await saveDecks([makeDeck('old')]);
    await saveDecks([makeDeck('new1'), makeDeck('new2')]);
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe('new1');
  });
});

// ── upsertDeck ────────────────────────────────────────────────────────────────

describe('upsertDeck', () => {
  it('inserts a deck when its id is not present', async () => {
    await upsertDeck(makeDeck('fresh'));
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('fresh');
  });

  it('replaces an existing deck when its id matches', async () => {
    await saveDecks([makeDeck('existing', { name: 'Old Name' })]);
    await upsertDeck(makeDeck('existing', { name: 'New Name' }));
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('New Name');
  });

  it('does not remove other decks when upserting one', async () => {
    await saveDecks([makeDeck('d1'), makeDeck('d2')]);
    await upsertDeck(makeDeck('d2', { name: 'Updated D2' }));
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(2);
    expect(loaded.find((d) => d.id === 'd1')).toBeDefined();
  });
});

// ── addCard ───────────────────────────────────────────────────────────────────

describe('addCard', () => {
  it('appends a card to the target deck', async () => {
    await saveDecks([makeDeck('d1', { cards: [] })]);
    const newCard = makeCard('new-card', { front: 'parcero', back: 'buddy' });
    await addCard('d1', newCard);
    const loaded = await loadDecks();
    const deck = loaded.find((d) => d.id === 'd1')!;
    expect(deck.cards).toHaveLength(1);
    expect(deck.cards[0].id).toBe('new-card');
  });

  it('does nothing if the deckId is not found', async () => {
    await saveDecks([makeDeck('d1')]);
    await addCard('nonexistent', makeCard('orphan'));
    const loaded = await loadDecks();
    expect(loaded[0].cards).toHaveLength(1); // unchanged
  });
});

// ── removeDeckById ────────────────────────────────────────────────────────────

describe('removeDeckById', () => {
  it('removes the deck with the matching id', async () => {
    await saveDecks([makeDeck('keep'), makeDeck('remove-me')]);
    await removeDeckById('remove-me');
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('keep');
  });

  it('does nothing if the id is not found', async () => {
    await saveDecks([makeDeck('d1')]);
    await removeDeckById('ghost');
    const loaded = await loadDecks();
    expect(loaded).toHaveLength(1);
  });
});

// ── renameDeckById ────────────────────────────────────────────────────────────

describe('renameDeckById', () => {
  it('updates only the name field of the matching deck', async () => {
    await saveDecks([makeDeck('d1', { name: 'Original' })]);
    await renameDeckById('d1', 'Renamed');
    const loaded = await loadDecks();
    expect(loaded[0].name).toBe('Renamed');
  });

  it('preserves all other deck properties', async () => {
    const original = makeDeck('d1', { description: 'some desc', cards: [makeCard('c1')] });
    await saveDecks([original]);
    await renameDeckById('d1', 'New Name');
    const loaded = await loadDecks();
    expect(loaded[0].description).toBe('some desc');
    expect(loaded[0].cards).toHaveLength(1);
  });

  it('does not affect other decks', async () => {
    await saveDecks([makeDeck('d1', { name: 'D1' }), makeDeck('d2', { name: 'D2' })]);
    await renameDeckById('d1', 'D1 Updated');
    const loaded = await loadDecks();
    expect(loaded.find((d) => d.id === 'd2')!.name).toBe('D2');
  });
});

// ── resetDeckProgressById ─────────────────────────────────────────────────────

describe('resetDeckProgressById', () => {
  it('resets all card progress fields in the target deck', async () => {
    const studied = makeCard('c1', { reps: 5, interval: 10, ease: 2.8, due: NOW + DAY_MS });
    await saveDecks([makeDeck('d1', { cards: [studied] })]);
    await resetDeckProgressById('d1');
    const loaded = await loadDecks();
    const card = loaded[0].cards[0];
    expect(card.reps).toBe(0);
    expect(card.interval).toBe(0);
    expect(card.ease).toBe(2.5);
    expect(card.due).toBeGreaterThanOrEqual(Date.now() - 100);
  });

  it('does not affect other decks', async () => {
    const studiedCard = makeCard('c1', { reps: 7 });
    await saveDecks([makeDeck('target', { cards: [studiedCard] }), makeDeck('other', { cards: [makeCard('c2', { reps: 3 })] })]);
    await resetDeckProgressById('target');
    const loaded = await loadDecks();
    const other = loaded.find((d) => d.id === 'other')!;
    expect(other.cards[0].reps).toBe(3); // untouched
  });
});

// ── getDailyProgress ──────────────────────────────────────────────────────────

describe('getDailyProgress', () => {
  it('creates a fresh record (count=0, target=10) when storage is empty', async () => {
    const dp = await getDailyProgress();
    expect(dp.count).toBe(0);
    expect(dp.target).toBe(10);
    expect(dp.date).toBe(todayISO());
  });

  it('returns existing progress when the stored date is today', async () => {
    const existing = { date: todayISO(), count: 7, target: 15 };
    await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', JSON.stringify(existing));
    const dp = await getDailyProgress();
    expect(dp.count).toBe(7);
    expect(dp.target).toBe(15);
  });

  it('resets count to 0 (preserving target) when the stored date is yesterday', async () => {
    const yesterday = { date: yesterdayISO(), count: 12, target: 20 };
    await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', JSON.stringify(yesterday));
    const dp = await getDailyProgress();
    expect(dp.count).toBe(0);
    expect(dp.target).toBe(20);
    expect(dp.date).toBe(todayISO());
  });

  it('returns default target=10 when parsed target is falsy', async () => {
    const bad = { date: todayISO(), count: 5, target: 0 };
    await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', JSON.stringify(bad));
    const dp = await getDailyProgress();
    expect(dp.target).toBe(10);
  });

  it('recovers from corrupted JSON by returning a fresh record', async () => {
    await AsyncStorage.setItem('SRS_DAILY_PROGRESS_V1', '{{broken}}');
    const dp = await getDailyProgress();
    expect(dp.count).toBe(0);
    expect(dp.target).toBe(10);
  });
});

// ── incrementDailyProgress ────────────────────────────────────────────────────

describe('incrementDailyProgress', () => {
  it('increments count by 1 by default', async () => {
    const dp = await incrementDailyProgress();
    expect(dp.count).toBe(1);
  });

  it('increments by a custom delta', async () => {
    await incrementDailyProgress(3);
    const dp = await incrementDailyProgress(4);
    expect(dp.count).toBe(7);
  });

  it('starts from 0 when no prior data', async () => {
    const dp = await incrementDailyProgress(5);
    expect(dp.count).toBe(5);
  });
});

// ── setDailyTarget ────────────────────────────────────────────────────────────

describe('setDailyTarget', () => {
  it('updates the target value', async () => {
    const dp = await setDailyTarget(25);
    expect(dp.target).toBe(25);
  });

  it('clamps target=0 to 1 (minimum)', async () => {
    const dp = await setDailyTarget(0);
    expect(dp.target).toBe(1);
  });

  it('floors a float target to an integer', async () => {
    const dp = await setDailyTarget(7.9);
    expect(dp.target).toBe(7);
  });
});

// ── getStudyStreak ────────────────────────────────────────────────────────────

describe('getStudyStreak', () => {
  it('returns 0 when no streak data exists', async () => {
    expect(await getStudyStreak()).toBe(0);
  });

  it('returns the stored streak when lastStudyDate is today', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 5, lastStudyDate: todayISO() }),
    );
    expect(await getStudyStreak()).toBe(5);
  });

  it('returns the stored streak when lastStudyDate is yesterday (still valid)', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 3, lastStudyDate: yesterdayISO() }),
    );
    expect(await getStudyStreak()).toBe(3);
  });

  it('returns 0 when lastStudyDate is 2+ days ago (streak broken)', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 10, lastStudyDate: twoDaysAgoISO() }),
    );
    expect(await getStudyStreak()).toBe(0);
  });

  it('returns 0 on corrupted JSON', async () => {
    await AsyncStorage.setItem('SRS_STUDY_STREAK_V1', 'notjson');
    expect(await getStudyStreak()).toBe(0);
  });
});

// ── recordStudySession ────────────────────────────────────────────────────────

describe('recordStudySession', () => {
  it('starts a streak of 1 on the very first call', async () => {
    const streak = await recordStudySession();
    expect(streak).toBe(1);
  });

  it('increments streak when last study was yesterday', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 4, lastStudyDate: yesterdayISO() }),
    );
    const streak = await recordStudySession();
    expect(streak).toBe(5);
  });

  it('does not double-increment when already studied today', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 3, lastStudyDate: todayISO() }),
    );
    const streak = await recordStudySession();
    expect(streak).toBe(3);
  });

  it('resets to 1 when gap is more than one day', async () => {
    await AsyncStorage.setItem(
      'SRS_STUDY_STREAK_V1',
      JSON.stringify({ streak: 12, lastStudyDate: twoDaysAgoISO() }),
    );
    const streak = await recordStudySession();
    expect(streak).toBe(1);
  });
});
