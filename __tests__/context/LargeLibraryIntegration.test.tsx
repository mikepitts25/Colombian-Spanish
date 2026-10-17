import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { Deck } from '../../src/types';
import { getDailyProgress, loadDecks } from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { restoreBackup } from '../../src/storage/backupRestore';
import { selectDifficultCards } from '../../src/utils/srs';

// Isolate the custom-library contract from seed editorial/content revisions.
jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [] }));
const NOW = 1_792_310_400_000;
const LONG_TEXT = '¿Qué más, Medellín? 🧳 Café, pingüino y corazón. '.repeat(200);
let current: ReturnType<typeof useDeckContext>;
function Probe() {
  const context = useDeckContext();
  React.useLayoutEffect(() => {
    current = context;
  }, [context]);
  return null;
}
function mountLibrary() {
  return render(
    <DeckProvider>
      <Probe />
    </DeckProvider>,
  );
}
function library(): Deck[] {
  return Array.from({ length: 100 }, (_, d) => ({
    id: `custom-${d}`,
    name: `Biblioteca ${d}`,
    description: d === 99 ? LONG_TEXT : undefined,
    cards: Array.from({ length: 100 }, (_, c) => ({
      id: `custom-${d}-${String(c).padStart(3, '0')}`,
      front: d === 99 && c === 99 ? LONG_TEXT : `Palabra ${d}/${c}`,
      back: d === 99 && c === 99 ? `English ${LONG_TEXT}` : `Meaning ${d}/${c}`,
      example: d === 99 && c === 99 ? LONG_TEXT : undefined,
      createdAt: 0,
      due: c % 4 === 2 ? NOW + 86_400_000 : NOW - 1000,
      reps: c % 4 === 0 ? 0 : 2,
      interval: c % 4 === 0 ? 0 : c % 4 === 3 ? 1 : 4,
      ease: c % 4 === 3 ? 2 : 2.5,
      favorite: c === 99,
      flagged: c === 98,
      reviewStatus: 'reviewed' as const,
      reviewedAt: NOW - 5000,
      regions: ['paisa' as const],
      tags: ['custom', 'fixture'],
    })),
  }));
}
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => jest.restoreAllMocks());

test('loads and remounts all 10,000 cards with due/new/future/difficult membership intact', async () => {
  const original = library();
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(original));
  let screen = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toEqual(original);
  expect(current.decks.flatMap((deck) => deck.cards)).toHaveLength(10_000);
  act(() => current.setActiveDeckId('custom-99'));
  await waitFor(() => expect(current.activeDeckId).toBe('custom-99'));
  expect(current.getStudyBatch(5).map((card) => card.id)).toEqual([
    'custom-99-001',
    'custom-99-003',
    'custom-99-005',
    'custom-99-007',
    'custom-99-009',
  ]);
  expect(selectDifficultCards(current.activeDeck!.cards).map((card) => card.id)).toEqual(
    Array.from({ length: 25 }, (_, i) => `custom-99-${String(i * 4 + 3).padStart(3, '0')}`),
  );
  const extended = current.getStudyBatch(100);
  expect(extended).toHaveLength(60); // 50 due reviews, then the daily cap of 10 new cards.
  expect(extended.slice(50).map((card) => card.id)).toEqual(
    Array.from({ length: 10 }, (_, i) => `custom-99-${String(i * 4).padStart(3, '0')}`),
  );
  expect(extended.some((card) => card.reps > 0 && card.due > NOW)).toBe(false);
  screen.unmount();
  screen = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toEqual(original);
  expect(await loadDecks()).toEqual(original);
  expect(await getLearningEvents()).toEqual([]);
  expect(await getDailyProgress()).toMatchObject({ count: 0, newCount: 0 });
  screen.unmount();
});

test('grades one new card exactly once while preserving all other 9,999 cards', async () => {
  const original = library();
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(original));
  const screen = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  const options = {
    attemptId: 'large-library-grade',
    sessionId: 'large-library-session',
    durationMs: 2300,
  };
  await act(async () => {
    await current.recordAnswer('custom-99-000', 4, options);
    await current.recordAnswer('custom-99-000', 4, options);
  });
  const stored = await loadDecks();
  expect(stored[99].cards[0]).toEqual({
    ...original[99].cards[0],
    reps: 1,
    interval: 1,
    due: NOW + 86_400_000,
  });
  expect(stored.slice(0, 99)).toEqual(original.slice(0, 99));
  expect(stored[99].cards.slice(1)).toEqual(original[99].cards.slice(1));
  expect(current.decks).toEqual(stored);
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
  expect(await getLearningEvents()).toEqual([
    expect.objectContaining({
      id: options.attemptId,
      cardId: 'custom-99-000',
      quality: 4,
      modality: 'recall',
      evidence: 'self-rated',
      durationMs: 2300,
    }),
  ]);
  screen.unmount();
  const resumed = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toEqual(stored);
  resumed.unmount();
});

test('round-trips every card, long Unicode field and graded progress through portable backup', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify(library()));
  const screen = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  await act(async () =>
    current.recordAnswer('custom-99-000', 4, {
      attemptId: 'backup-grade',
      sessionId: 'backup-session',
    }),
  );
  const source = await captureBackupSnapshot();
  const text = JSON.stringify(source);
  expect(text.length).toBeLessThan(10_000_000);
  const parsed = parseBackupText(text);
  expect(parsed).toEqual(source);
  screen.unmount();
  // Jest's mock store only. Never clear a simulator/device to install a fixture.
  await AsyncStorage.clear();
  await restoreBackup(
    parsed.decks,
    parsed.learningEvents,
    'replace-state',
    parsed.applicationState,
  );
  const restored = mountLibrary();
  await waitFor(() => expect(current.ready).toBe(true));
  expect(current.decks).toEqual(source.decks);
  expect(current.decks.flatMap((deck) => deck.cards)).toHaveLength(10_000);
  expect(current.decks[99].cards[99].front).toBe(LONG_TEXT);
  expect(current.decks[99].cards[99].back).toBe(`English ${LONG_TEXT}`);
  expect(current.decks[99].cards[99].example).toBe(LONG_TEXT);
  const roundTrip = await captureBackupSnapshot();
  expect(roundTrip.decks).toEqual(source.decks);
  // Missing source keys intentionally restore to canonical empty state.
  expect(roundTrip.applicationState).toEqual({
    ...source.applicationState,
    dailyPlan: { schemaVersion: 1, current: null },
    missions: { schemaVersion: 1, runs: [] },
    prefs: {},
    quizHistory: [],
    lastSession: {},
    notificationPrefs: {},
  });
  expect(roundTrip.learningEvents).toEqual(source.learningEvents);
  expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
  restored.unmount();
});
