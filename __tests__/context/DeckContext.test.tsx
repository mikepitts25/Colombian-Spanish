import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { Deck, FlashCard } from '../../src/types';

// ── Seed data mock ────────────────────────────────────────────────────────────

const NOW = Date.now();

const SEED_CARD: FlashCard = {
  id: 's001',
  front: 'hola',
  back: 'hello',
  createdAt: 0,
  due: 0,
  reps: 0,
  interval: 0,
  ease: 2.5,
};

const SEED_DECK: Deck = {
  id: 'deck-seed',
  name: 'Seed Deck',
  cards: [SEED_CARD],
};

jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [SEED_DECK] }));

// ── helpers ───────────────────────────────────────────────────────────────────

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: 'chimba',
    back: 'awesome',
    createdAt: NOW,
    due: NOW - 1000,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

function makeStoredDeck(id: string, cards: FlashCard[] = []): Deck {
  return { id, name: `Deck ${id}`, cards };
}

function Consumer({ onReady }: { onReady?: (ctx: ReturnType<typeof useDeckContext>) => void }) {
  const ctx = useDeckContext();
  React.useEffect(() => {
    if (ctx.ready && onReady) onReady(ctx);
  }, [ctx.ready]);
  return (
    <>
      <Text testID="ready">{String(ctx.ready)}</Text>
      <Text testID="deck-count">{ctx.decks.length}</Text>
      <Text testID="active-deck-id">{ctx.activeDeckId ?? 'none'}</Text>
    </>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<DeckProvider>{ui}</DeckProvider>);
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

// ── Initialization ────────────────────────────────────────────────────────────

describe('DeckProvider initialization', () => {
  it('sets ready=true after mounting', async () => {
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('ready').props.children).toBe('true'), { timeout: 10000 });
  });

  it('seeds from ALL_DECKS when storage is empty', async () => {
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), { timeout: 10000 });
    const stored = await AsyncStorage.getItem('SRS_DECKS_V3');
    const parsed = JSON.parse(stored!);
    expect(parsed[0].id).toBe('deck-seed');
  });

  it('does not duplicate existing seed decks on re-mount', async () => {
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([SEED_DECK]));
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), { timeout: 10000 });
  });

  it('merges a new seed deck without removing existing user data', async () => {
    const userDeck = makeStoredDeck('user-custom', [makeCard('uc1')]);
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([userDeck, SEED_DECK]));
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(2), { timeout: 10000 });
  });

  it('sets activeDeckId to first deck', async () => {
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('active-deck-id').props.children).toBe('deck-seed'), { timeout: 10000 });
  });
});

// ── getStudyBatch ─────────────────────────────────────────────────────────────

describe('getStudyBatch', () => {
  it('returns due cards from the active deck', async () => {
    const cards = [makeCard('c1'), makeCard('c2'), makeCard('c3')];
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', cards)]));

    let batch: FlashCard[] = [];
    renderWithProvider(<Consumer onReady={(ctx) => { batch = ctx.getStudyBatch(); }} />);
    await waitFor(() => expect(batch.length).toBeGreaterThan(0), { timeout: 10000 });
  });

  it('respects size parameter', async () => {
    const cards = Array.from({ length: 10 }, (_, i) => makeCard(`c${i}`));
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', cards)]));

    let batch: FlashCard[] = [];
    renderWithProvider(<Consumer onReady={(ctx) => { batch = ctx.getStudyBatch(3); }} />);
    await waitFor(() => expect(batch).toHaveLength(3), { timeout: 10000 });
  });
});

// ── recordAnswer ──────────────────────────────────────────────────────────────

describe('recordAnswer', () => {
  it('updates card progress fields after grading', async () => {
    const card = makeCard('grade-me', { reps: 0, ease: 2.5 });
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [card])]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.recordAnswer('grade-me', 5); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const updatedCard = stored[0].cards[0];
    expect(updatedCard.reps).toBe(1);
    expect(updatedCard.due).toBeGreaterThan(Date.now());
  });

  it('does nothing for an unknown cardId', async () => {
    const card = makeCard('real-id');
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [card])]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.recordAnswer('does-not-exist', 5); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0].reps).toBe(0);
  });
});

// ── toggleFavorite ────────────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  it('sets favorite=true on first toggle', async () => {
    const card = makeCard('fav-card', { favorite: false });
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [card])]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.toggleFavorite('fav-card'); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0].favorite).toBe(true);
  });

  it('sets favorite=false on second toggle', async () => {
    const card = makeCard('fav-card', { favorite: true });
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [card])]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.toggleFavorite('fav-card'); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0].favorite).toBe(false);
  });
});

// ── createDeck ────────────────────────────────────────────────────────────────

describe('createDeck', () => {
  it('adds a new deck with an empty cards array', async () => {
    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    let newDeck: Deck | undefined;
    await act(async () => { newDeck = await ctx!.createDeck('Mi Vocabulario', 'Custom deck'); });

    expect(newDeck).toBeDefined();
    expect(newDeck!.cards).toHaveLength(0);
    expect(newDeck!.name).toBe('Mi Vocabulario');
  });

  it('persists the new deck to AsyncStorage', async () => {
    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.createDeck('Saved Deck'); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored.some((d: Deck) => d.name === 'Saved Deck')).toBe(true);
  });
});

// ── deleteDeck ────────────────────────────────────────────────────────────────

describe('deleteDeck', () => {
  it('removes the deck from state and storage', async () => {
    const extraDeck: Deck = { id: 'extra', name: 'Extra', cards: [] };
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([SEED_DECK, extraDeck]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    const { getByTestId } = renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(2), { timeout: 10000 });

    await act(async () => { await ctx!.deleteDeck('extra'); });

    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), { timeout: 10000 });
  });
});

// ── resetDeckProgress ─────────────────────────────────────────────────────────

describe('resetDeckProgress', () => {
  it('resets all card progress in the target deck', async () => {
    const studiedCard = makeCard('studied', { reps: 5, interval: 14, ease: 2.9 });
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [studiedCard])]));

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(<Consumer onReady={(c) => { ctx = c; }} />);
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => { await ctx!.resetDeckProgress('deck-seed'); });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const card = stored[0].cards[0];
    expect(card.reps).toBe(0);
    expect(card.interval).toBe(0);
    expect(card.ease).toBe(2.5);
  });
});
