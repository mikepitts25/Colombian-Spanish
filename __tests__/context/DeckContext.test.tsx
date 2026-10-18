import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { Deck, FlashCard } from '../../src/types';

// ── Seed data mock ────────────────────────────────────────────────────────────

const NOW = Date.now();

const SEED_CARD: FlashCard = {
  id: 's001',
  front: 'hola',
  back: 'hello',
  example: 'Hola, ¿cómo estás? | Hello, how are you?',
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

jest.mock('../../src/data/decks', () => ({
  ALL_DECKS: [
    {
      id: 'deck-seed',
      name: 'Seed Deck',
      cards: [
        {
          id: 's001',
          front: 'hola',
          back: 'hello',
          example: 'Hola, ¿cómo estás? | Hello, how are you?',
          createdAt: 0,
          due: 0,
          reps: 0,
          interval: 0,
          ease: 2.5,
        },
      ],
    },
  ],
}));

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
  }, [ctx, onReady]);
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
    await waitFor(() => expect(getByTestId('ready').props.children).toBe('true'), {
      timeout: 10000,
    });
  });

  it('seeds from ALL_DECKS when storage is empty', async () => {
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), {
      timeout: 10000,
    });
    const stored = await AsyncStorage.getItem('SRS_DECKS_V3');
    const parsed = JSON.parse(stored!);
    expect(parsed[0].id).toBe('deck-seed');
  });

  it('does not duplicate existing seed decks on re-mount', async () => {
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([SEED_DECK]));
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), {
      timeout: 10000,
    });
  });

  it('merges a new seed deck without removing existing user data', async () => {
    const userDeck = makeStoredDeck('user-custom', [makeCard('uc1')]);
    await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([userDeck, SEED_DECK]));
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(2), {
      timeout: 10000,
    });
  });

  it('refreshes updated seed card content while preserving stored progress', async () => {
    const oldStoredCard: FlashCard = {
      ...SEED_CARD,
      example: 'Hola, ¿cómo estás?',
      regions: ['general', 'rolo'],
      due: 12345,
      reps: 7,
      interval: 21,
      ease: 2.8,
      favorite: true,
    };
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [oldStoredCard])]),
    );

    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), {
      timeout: 10000,
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0]).toEqual(
      expect.objectContaining({
        example: 'Hola, ¿cómo estás? | Hello, how are you?',
        regions: ['general', 'rolo'],
        due: 12345,
        reps: 7,
        interval: 21,
        ease: 2.8,
        favorite: true,
      }),
    );
  });

  it('preserves reviewed translation edits during seed content refreshes', async () => {
    const reviewedStoredCard = {
      ...SEED_CARD,
      back: 'custom hello',
      example: 'Hola. | Custom hello.',
      reviewStatus: 'reviewed' as const,
      reviewedAt: 12345,
      due: 12345,
      reps: 7,
    };
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [reviewedStoredCard])]),
    );

    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), {
      timeout: 10000,
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0]).toEqual(
      expect.objectContaining({
        back: 'custom hello',
        example: 'Hola. | Custom hello.',
        reviewStatus: 'reviewed',
        reviewedAt: 12345,
        due: 12345,
        reps: 7,
      }),
    );
  });

  it('sets activeDeckId to first deck', async () => {
    const { getByTestId } = renderWithProvider(<Consumer />);
    await waitFor(() => expect(getByTestId('active-deck-id').props.children).toBe('deck-seed'), {
      timeout: 10000,
    });
  });
});

// ── getStudyBatch ─────────────────────────────────────────────────────────────

describe('getStudyBatch', () => {
  it('returns due cards from the active deck', async () => {
    const cards = [makeCard('c1'), makeCard('c2'), makeCard('c3')];
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', cards)]),
    );

    let batch: FlashCard[] = [];
    renderWithProvider(
      <Consumer
        onReady={(ctx) => {
          batch = ctx.getStudyBatch();
        }}
      />,
    );
    await waitFor(() => expect(batch.length).toBeGreaterThan(0), { timeout: 10000 });
  });

  it('respects size parameter', async () => {
    const cards = Array.from({ length: 10 }, (_, i) => makeCard(`c${i}`));
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', cards)]),
    );

    let batch: FlashCard[] = [];
    renderWithProvider(
      <Consumer
        onReady={(ctx) => {
          batch = ctx.getStudyBatch(3);
        }}
      />,
    );
    await waitFor(() => expect(batch).toHaveLength(3), { timeout: 10000 });
  });
});

// ── recordAnswer ──────────────────────────────────────────────────────────────

describe('recordAnswer', () => {
  it('updates card progress fields after grading', async () => {
    const card = makeCard('grade-me', { reps: 0, ease: 2.5 });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.recordAnswer('grade-me', 5);
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const updatedCard = stored[0].cards.find((card: FlashCard) => card.id === 'grade-me');
    expect(updatedCard.reps).toBe(1);
    expect(updatedCard.due).toBeGreaterThan(Date.now());
  });

  it('records the reviewed card as a seen word for quiz sessions', async () => {
    const card = makeCard('quiz-word', {
      front: 'parce',
      back: 'friend / buddy',
    });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.recordAnswer('quiz-word', 4);
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_SEEN_WORDS_V1'))!);
    expect(stored).toEqual([
      expect.objectContaining({
        cardId: 'quiz-word',
        deckId: 'deck-seed',
        front: 'parce',
        back: 'friend / buddy',
        spanish: 'parce',
        english: 'friend / buddy',
        correctCount: 1,
        incorrectCount: 0,
      }),
    ]);
  });

  it('updates the study streak when a card is reviewed', async () => {
    const card = makeCard('streak-word');
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.recordAnswer('streak-word', 4);
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_STUDY_STREAK_V1'))!);
    expect(stored.streak).toBe(1);
    expect(stored.lastStudyDate).toBeTruthy();
  });

  it('does nothing for an unknown cardId', async () => {
    const card = makeCard('real-id');
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.recordAnswer('does-not-exist', 5);
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    expect(stored[0].cards[0].reps).toBe(0);
  });

  it('updates a matching card even when it is not in the active deck', async () => {
    const activeCard = makeCard('active-card');
    const difficultCard = makeCard('other-card');
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([
        makeStoredDeck('deck-seed', [activeCard]),
        makeStoredDeck('deck-other', [difficultCard]),
      ]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.recordAnswer('other-card', 4);
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const otherDeck = stored.find((deck: Deck) => deck.id === 'deck-other');
    expect(otherDeck.cards[0].reps).toBe(1);
  });
});

// ── toggleFavorite ────────────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  it('sets favorite=true on first toggle', async () => {
    const card = makeCard('fav-card', { favorite: false });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.toggleFavorite('fav-card');
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const updatedCard = stored[0].cards.find((card: FlashCard) => card.id === 'fav-card');
    expect(updatedCard.favorite).toBe(true);
  });

  it('sets favorite=false on second toggle', async () => {
    const card = makeCard('fav-card', { favorite: true });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.toggleFavorite('fav-card');
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const updatedCard = stored[0].cards.find((card: FlashCard) => card.id === 'fav-card');
    expect(updatedCard.favorite).toBe(false);
  });
});

// ── updateCardReview ─────────────────────────────────────────────────────────

describe('updateCardReview', () => {
  it('updates translation fields and review status for a matching card', async () => {
    const card = makeCard('review-card', {
      front: 'parce',
      back: 'dude',
      example: 'Hola, parce. | Hi, dude.',
    });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [card])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.updateCardReview('review-card', {
        back: 'buddy / friend',
        example: 'Hola, parce. | Hi, buddy.',
        reviewStatus: 'reviewed',
        reviewedAt: 12345,
      });
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const updatedCard = stored[0].cards.find((card: FlashCard) => card.id === 'review-card');
    expect(updatedCard).toEqual(
      expect.objectContaining({
        back: 'buddy / friend',
        example: 'Hola, parce. | Hi, buddy.',
        reviewStatus: 'reviewed',
        reviewedAt: 12345,
      }),
    );
  });
});

// ── createDeck ────────────────────────────────────────────────────────────────

describe('createDeck', () => {
  it('adds a new deck with an empty cards array', async () => {
    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    let newDeck: Deck | undefined;
    await act(async () => {
      newDeck = await ctx!.createDeck('Mi Vocabulario', 'Custom deck');
    });

    expect(newDeck).toBeDefined();
    expect(newDeck!.cards).toHaveLength(0);
    expect(newDeck!.name).toBe('Mi Vocabulario');
  });

  it('persists the new deck to AsyncStorage', async () => {
    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.createDeck('Saved Deck');
    });

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
    const { getByTestId } = renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(2), {
      timeout: 10000,
    });

    await act(async () => {
      await ctx!.deleteDeck('extra');
    });

    await waitFor(() => expect(getByTestId('deck-count').props.children).toBe(1), {
      timeout: 10000,
    });
  });
});

// ── resetDeckProgress ─────────────────────────────────────────────────────────

describe('resetDeckProgress', () => {
  it('resets all card progress in the target deck', async () => {
    const studiedCard = makeCard('studied', { reps: 5, interval: 14, ease: 2.9 });
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([makeStoredDeck('deck-seed', [studiedCard])]),
    );

    let ctx: ReturnType<typeof useDeckContext> | null = null;
    renderWithProvider(
      <Consumer
        onReady={(c) => {
          ctx = c;
        }}
      />,
    );
    await waitFor(() => expect(ctx?.ready).toBe(true), { timeout: 10000 });

    await act(async () => {
      await ctx!.resetDeckProgress('deck-seed');
    });

    const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
    const card = stored[0].cards[0];
    expect(card.reps).toBe(0);
    expect(card.interval).toBe(0);
    expect(card.ease).toBe(2.5);
  });
});

it('keeps provider state unchanged when the grade journal cannot be saved', async () => {
  const card = makeCard('write-failure');
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([makeStoredDeck('deck-seed', [card])]));
  let ctx: ReturnType<typeof useDeckContext> | undefined;
  renderWithProvider(
    <Consumer
      onReady={(value) => {
        ctx = value;
      }}
    />,
  );
  await waitFor(() => expect(ctx?.ready).toBe(true));
  const prior = ctx!.decks;
  const write = AsyncStorage.setItem as jest.Mock;
  write.mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await expect(
      ctx!.recordAnswer('write-failure', 4, { attemptId: 'failed-attempt', sessionId: 'session' }),
    ).rejects.toThrow('disk full');
  });
  expect(ctx!.decks).toEqual(prior);
});

it('keeps concurrent favorite toggles and review/flag patches without losing grades', async () => {
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([makeStoredDeck('custom', [makeCard('concurrent')])]),
  );
  let ctx: ReturnType<typeof useDeckContext> | undefined;
  renderWithProvider(
    <Consumer
      onReady={(value) => {
        ctx = value;
      }}
    />,
  );
  await waitFor(() => expect(ctx?.ready).toBe(true));
  await act(async () => {
    await Promise.all([ctx!.toggleFavorite('concurrent'), ctx!.toggleFavorite('concurrent')]);
  });
  let stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
  expect(stored.find((d: Deck) => d.id === 'custom').cards[0].favorite).toBe(false);
  await act(async () => {
    await Promise.all([
      ctx!.recordAnswer('concurrent', 4, { attemptId: 'concurrent-a', sessionId: 'concurrent-s' }),
      ctx!.flagCard('concurrent', true),
      ctx!.updateCardReview('concurrent', { back: 'editor correction', reviewStatus: 'reviewed' }),
    ]);
  });
  stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
  expect(stored.find((d: Deck) => d.id === 'custom').cards[0]).toMatchObject({
    reps: 1,
    flagged: true,
    back: 'editor correction',
    reviewStatus: 'reviewed',
    favorite: false,
  });
});

it('offers a retry after startup merge fails without discarding stored decks', async () => {
  const raw = JSON.stringify([makeStoredDeck('custom', [makeCard('keep')])]);
  await AsyncStorage.setItem('SRS_DECKS_V3', raw);
  const write = AsyncStorage.setItem as jest.Mock;
  write.mockRejectedValueOnce(new Error('disk full'));
  const { findByText, getByText } = renderWithProvider(<Consumer />);
  await findByText('Reintentar / Try again');
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe(raw);
  await act(async () => {
    fireEvent.press(getByText('Reintentar / Try again'));
  });
  await waitFor(() => expect(getByText('true')).toBeTruthy());
  const stored = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!);
  expect(stored.find((d: Deck) => d.id === 'custom').cards[0].id).toBe('keep');
});

it('keeps corrupt startup decks and shows a recovery error instead of reseeding', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', 'corrupt');
  const { findByText } = renderWithProvider(<Consumer />);
  await findByText('Reintentar / Try again');
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe('corrupt');
});

test('regional provider queues retain due reviews and enforce the stored daily new-card budget', async () => {
  const cards = [
    makeCard('due-other', { reps: 2, interval: 3, due: Date.now() - 1000, regions: ['rolo'] }),
    makeCard('other-new', { createdAt: 0, regions: ['rolo'] }),
    makeCard('general-new', { createdAt: 1, regions: ['general'] }),
    makeCard('local-new', { createdAt: 2, regions: ['paisa'] }),
  ];
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([makeStoredDeck('custom-regional', cards)]),
  );
  await AsyncStorage.setItem('SRS_PREFS_V1', JSON.stringify({ newCardsPerDay: 1 }));
  let context!: ReturnType<typeof useDeckContext>;
  const screen = renderWithProvider(
    <Consumer
      onReady={(ctx) => {
        context = ctx;
      }}
    />,
  );
  try {
    await waitFor(() => expect(context?.ready).toBe(true));
    expect(context.getStudyBatch(4, { preferredRegion: 'paisa' }).map((card) => card.id)).toEqual([
      'due-other',
      'local-new',
    ]);
    expect(context.getStudyBatch(4).map((card) => card.id)).toEqual(['due-other', 'other-new']);
  } finally {
    screen.unmount();
  }
});

describe('custom create intent recovery', () => {
  async function provider() {
    let current!: ReturnType<typeof useDeckContext>;
    renderWithProvider(
      <Consumer
        onReady={(value) => {
          current = value;
        }}
      />,
    );
    await waitFor(() => expect(current?.ready).toBe(true));
    return () => current;
  }

  it('rejects adding a card when the selected deck no longer exists', async () => {
    const context = await provider();
    await act(async () => {
      await expect(
        context().addCardToDeck('removed', { id: 'custom-missing', front: 'hola', back: 'hello' }),
      ).rejects.toThrow();
    });
    expect(
      context()
        .decks.flatMap((d) => d.cards)
        .map((c) => c.id),
    ).toEqual(['s001']);
  });

  it('retries the same card once after journal recovery without resetting later edits or grading', async () => {
    const context = await provider();
    const write = AsyncStorage.setItem as jest.Mock;
    const original = write.getMockImplementation()!;
    let failed = false;
    write.mockImplementation(async (key, value) => {
      if (key === 'SRS_DECKS_V3' && !failed) {
        failed = true;
        throw new Error('interrupted apply');
      }
      return original(key, value);
    });
    const card = { id: 'custom-retry', front: 'parce', back: 'friend', tags: ['custom'] };
    try {
      await act(async () => {
        await expect(context().addCardToDeck('deck-seed', card)).rejects.toThrow(
          'interrupted apply',
        );
      });
    } finally {
      write.mockImplementation(original);
    }
    const { commitFlashcardAnswer } = require('../../src/storage/flashcardAnswer');
    const { mutateDecks, loadDecks } = require('../../src/storage/storage');
    await commitFlashcardAnswer({
      cardId: 'custom-retry',
      quality: 4,
      attemptId: 'custom-grade',
      sessionId: 'custom-session',
    });
    await mutateDecks((decks: Deck[]) =>
      decks.map((deck) => ({
        ...deck,
        cards: deck.cards.map((item) =>
          item.id === card.id ? { ...item, back: 'edited friend' } : item,
        ),
      })),
    );
    await act(async () => {
      await context().addCardToDeck('deck-seed', card);
    });
    const stored = await loadDecks();
    expect(stored[0].cards).toHaveLength(2);
    expect(stored[0].cards[1]).toMatchObject({
      id: 'custom-retry',
      back: 'edited friend',
      reps: 1,
    });
    expect(context().decks).toEqual(stored);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
  });

  it('creates distinct decks when independent intents share a name, clock and random sample', async () => {
    const context = await provider();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1792288000000);
    const random = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    try {
      await act(async () => {
        await context().createDeck('Repeated name');
        await context().createDeck('Repeated name');
      });
      const custom = context().decks.filter((d) => d.name === 'Repeated name');
      expect(custom).toHaveLength(2);
      expect(new Set(custom.map((d) => d.id)).size).toBe(2);
    } finally {
      clock.mockRestore();
      random.mockRestore();
    }
  });

  it('reuses a supplied deck intent without replacing cards or subsequent rename', async () => {
    const context = await provider();
    let first!: Deck;
    await act(async () => {
      first = (await (context().createDeck as any)('Original', '', 'custom-deck-intent'))!;
    });
    await act(async () => {
      await context().addCardToDeck(first.id, {
        id: 'inside-custom',
        front: 'hola',
        back: 'hello',
      });
      await context().renameDeck(first.id, 'Later name');
    });
    let retried!: Deck;
    await act(async () => {
      retried = (await (context().createDeck as any)('Original', '', 'custom-deck-intent'))!;
    });
    const { loadDecks } = require('../../src/storage/storage');
    const stored = await loadDecks();
    expect(stored).toHaveLength(2);
    expect(retried).toMatchObject({
      id: first.id,
      name: 'Later name',
      cards: [{ id: 'inside-custom' }],
    });
    expect(context().decks).toEqual(stored);
  });
});

test('rename rejects a removed target rather than confirming a no-op', async () => {
  let current!: ReturnType<typeof useDeckContext>;
  renderWithProvider(
    <Consumer
      onReady={(value) => {
        current = value;
      }}
    />,
  );
  await waitFor(() => expect(current?.ready).toBe(true));
  await act(async () => {
    await expect(current.renameDeck('removed-target', 'New name')).rejects.toThrow();
  });
  expect(current.decks[0].name).toBe('Seed Deck');
});
