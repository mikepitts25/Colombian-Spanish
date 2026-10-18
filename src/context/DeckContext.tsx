import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  loadDecks,
  mutateDecks,
  removeDeckById,
  resetDeckProgressById,
  getDailyProgress,
} from '../storage/storage';
import { getPrefs } from '../storage/prefs';
import { commitFlashcardAnswer, AnswerOptions } from '../storage/flashcardAnswer';
import { createLearningSessionId } from '../storage/learningEvents';
import { Deck, FlashCard } from '../types';
import { createLocalId } from '../utils/localId';
import { StorageStatus } from '../components/StorageGate';
import { buildSessionQueue } from '../utils/srs';
import type { RegionFilterId } from '../utils/regions';

// Try to import ALL_DECKS from src/data/decks (static build-time import)
let SEED_DECKS: Deck[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const decksIndex = require('../data/decks');
  if (decksIndex && Array.isArray(decksIndex.ALL_DECKS)) {
    SEED_DECKS = decksIndex.ALL_DECKS as Deck[];
  }
} catch {}

type Ctx = {
  ready: boolean;
  decks: Deck[];
  activeDeck: Deck | undefined;
  activeDeckId: string | undefined;
  setActiveDeckId: (id: string) => void;
  getStudyBatch: (size?: number, options?: { preferredRegion?: RegionFilterId }) => FlashCard[];
  recordAnswer: (
    cardId: string,
    quality: 0 | 1 | 2 | 3 | 4 | 5,
    options?: AnswerOptions,
  ) => Promise<void>;
  toggleFavorite: (cardId: string) => Promise<void>;
  flagCard: (cardId: string, flagged: boolean) => Promise<void>;
  updateCardReview: (
    cardId: string,
    patch: Partial<Pick<FlashCard, 'back' | 'example' | 'flagged' | 'reviewStatus' | 'reviewedAt'>>,
  ) => Promise<void>;
  clearAllFlags: () => Promise<void>;
  addCardToDeck: (
    deckId: string,
    card: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>,
  ) => Promise<void>;
  createDeck: (name: string, description?: string, intentId?: string) => Promise<Deck | undefined>;
  renameDeck: (deckId: string, name: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  resetDeckProgress: (deckId: string) => Promise<void>;
  reload: (options?: { requireFreshBudget?: boolean }) => Promise<void>;
};

const DeckContext = createContext<Ctx | undefined>(undefined);

function mergeSeedDeckContent(storedDeck: Deck, seedDeck: Deck): Deck {
  const storedCards = (storedDeck.cards || []).filter(Boolean);
  const seedCards = (seedDeck.cards || []).filter(Boolean);
  const storedCardsById = new Map(storedCards.map((card) => [card.id, card]));
  const seedCardIds = new Set(seedCards.map((card) => card.id));

  const mergedSeedCards = seedCards.map((seedCard) => {
    const storedCard = storedCardsById.get(seedCard.id);
    if (!storedCard) return seedCard;
    const hasReviewedTranslation =
      storedCard.reviewStatus === 'reviewed' || storedCard.reviewStatus === 'needs_native';

    return {
      ...seedCard,
      back: hasReviewedTranslation ? storedCard.back : seedCard.back,
      example: hasReviewedTranslation ? storedCard.example : seedCard.example,
      createdAt: storedCard.createdAt,
      due: storedCard.due,
      reps: storedCard.reps,
      interval: storedCard.interval,
      ease: storedCard.ease,
      favorite: storedCard.favorite,
      flagged: storedCard.flagged,
      reviewStatus: storedCard.reviewStatus,
      reviewedAt: storedCard.reviewedAt,
      regions: storedCard.regions ?? seedCard.regions,
    };
  });

  const storedOnlyCards = storedCards.filter((card) => !seedCardIds.has(card.id));

  return {
    ...storedDeck,
    cards: [...mergedSeedCards, ...storedOnlyCards],
  };
}

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState(false);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(undefined);
  const [newCardsPerDay, setNewCardsPerDay] = useState(10);
  const [newIntroducedToday, setNewIntroducedToday] = useState(0);

  async function seedOrMerge() {
    const working = await mutateDecks((stored) => {
      if (!stored.length) return JSON.parse(JSON.stringify(SEED_DECKS)) as Deck[];
      const seedsById = new Map(SEED_DECKS.map((d) => [d.id, d]));
      const merged = stored.map((deck) => {
        const seedDeck = seedsById.get(deck.id);
        return seedDeck ? mergeSeedDeckContent(deck, seedDeck) : deck;
      });
      const present = new Set(merged.map((d) => d.id));
      for (const deck of SEED_DECKS) {
        if (!present.has(deck.id)) merged.push(JSON.parse(JSON.stringify(deck)) as Deck);
      }
      return merged;
    });
    setDecks(working);
    if (!activeDeckId && working.length > 0) setActiveDeckId(working[0].id);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await seedOrMerge();
        try {
          const [prefs, daily] = await Promise.all([getPrefs(), getDailyProgress()]);
          if (mounted) {
            setNewCardsPerDay(prefs.newCardsPerDay);
            setNewIntroducedToday(daily.newCount ?? 0);
          }
        } catch {}
        if (mounted) setReady(true);
      } catch {
        if (mounted) setStartupError(true);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startupAttempt]);

  const activeDeck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) || decks[0],
    [decks, activeDeckId],
  );

  function getStudyBatch(size = 15, options?: { preferredRegion?: RegionFilterId }) {
    if (!activeDeck) return [] as FlashCard[];
    return buildSessionQueue(activeDeck.cards, {
      size,
      preferredRegion: options?.preferredRegion,
      deckName: activeDeck.name,
      newLimit: Math.max(0, newCardsPerDay - newIntroducedToday),
    });
  }

  async function recordAnswer(
    cardId: string,
    quality: 0 | 1 | 2 | 3 | 4 | 5,
    options?: AnswerOptions,
  ) {
    const identity = options ?? {
      attemptId: createLearningSessionId(),
      sessionId: createLearningSessionId(),
    };
    const result = await commitFlashcardAnswer({ ...identity, cardId, quality });
    if (result) {
      setDecks(result.decks);
      setNewIntroducedToday(result.daily.newCount);
    }
  }

  async function flagCard(cardId: string, flagged: boolean) {
    const next = await mutateDecks((stored) =>
      stored.map((deck) => ({
        ...deck,
        cards: deck.cards.map((card) => (card.id === cardId ? { ...card, flagged } : card)),
      })),
    );
    setDecks(next);
  }

  async function clearAllFlags() {
    const next = await mutateDecks((stored) =>
      stored.map((deck) => ({
        ...deck,
        cards: deck.cards.map((card) => ({ ...card, flagged: false })),
      })),
    );
    setDecks(next);
  }

  async function toggleFavorite(cardId: string) {
    const next = await mutateDecks((stored) =>
      stored.map((deck) => ({
        ...deck,
        cards: deck.cards.map((card) =>
          card.id === cardId ? { ...card, favorite: !card.favorite } : card,
        ),
      })),
    );
    setDecks(next);
  }

  async function updateCardReview(
    cardId: string,
    patch: Partial<Pick<FlashCard, 'back' | 'example' | 'flagged' | 'reviewStatus' | 'reviewedAt'>>,
  ) {
    const snapshot = { ...patch };
    const next = await mutateDecks((stored) =>
      stored.map((deck) => ({
        ...deck,
        cards: deck.cards.map((card) => (card.id === cardId ? { ...card, ...snapshot } : card)),
      })),
    );
    setDecks(next);
  }

  async function addCardToDeck(
    deckId: string,
    newCard: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>,
  ) {
    const card: FlashCard = JSON.parse(
      JSON.stringify({
        ...newCard,
        createdAt: Date.now(),
        due: Date.now(),
        reps: 0,
        interval: 0,
        ease: 2.5,
      }),
    );
    const updated = await mutateDecks((stored) => {
      const target = stored.find((deck) => deck.id === deckId);
      if (!target) throw new Error('Selected deck no longer exists');
      // A recovered create is acknowledged by its original intent identity.
      // Never replace later edits or grading on an already-created card.
      if (target.cards.some((existing) => existing.id === card.id)) return stored;
      if (stored.some((deck) => deck.cards.some((existing) => existing.id === card.id))) {
        throw new Error('Card identity belongs to another deck');
      }
      target.cards.push(card);
      return stored;
    });
    setDecks(updated);
  }

  async function createDeck(
    name: string,
    description?: string,
    intentId?: string,
  ): Promise<Deck | undefined> {
    const id = intentId ?? createLocalId('deck');
    const newDeck: Deck = { id, name: name.trim(), description: description || '', cards: [] };
    const updated = await mutateDecks((stored) =>
      stored.some((deck) => deck.id === id) ? stored : [...stored, newDeck],
    );
    setDecks(updated);
    if (!activeDeckId) setActiveDeckId(id);
    return updated.find((deck) => deck.id === id);
  }

  async function renameDeck(deckId: string, name: string) {
    const updated = await mutateDecks((stored) => {
      if (!stored.some((deck) => deck.id === deckId))
        throw new Error('Selected deck no longer exists');
      return stored.map((deck) => (deck.id === deckId ? { ...deck, name } : deck));
    });
    setDecks(updated);
  }

  async function deleteDeck(deckId: string) {
    await removeDeckById(deckId);
    const updated = await loadDecks();
    setDecks(updated);
    if (activeDeckId === deckId) setActiveDeckId(updated[0]?.id);
  }

  async function resetDeckProgress(deckId: string) {
    await resetDeckProgressById(deckId);
    const updated = await loadDecks();
    setDecks(updated);
  }

  async function reload(options?: { requireFreshBudget?: boolean }) {
    const stored = await loadDecks();
    setDecks(stored);
    try {
      const [prefs, daily] = await Promise.all([getPrefs(), getDailyProgress()]);
      setNewCardsPerDay(prefs.newCardsPerDay);
      setNewIntroducedToday(daily.newCount ?? 0);
    } catch (error) {
      if (options?.requireFreshBudget) throw error;
    }
  }

  const value: Ctx = {
    ready,
    decks,
    activeDeck,
    activeDeckId,
    setActiveDeckId,
    getStudyBatch,
    recordAnswer,
    toggleFavorite,
    flagCard,
    updateCardReview,
    clearAllFlags,
    addCardToDeck,
    createDeck,
    renameDeck,
    deleteDeck,
    resetDeckProgress,
    reload,
  };

  if (startupError)
    return (
      <StorageStatus
        error
        onRetry={() => {
          setStartupError(false);
          setStartupAttempt((value) => value + 1);
        }}
      />
    );
  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeckContext() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeckContext must be used within DeckProvider');
  return ctx;
}
