import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  loadDecks,
  saveDecks,
  upsertDeck,
  addCard as addCardStorage,
  removeDeckById,
  renameDeckById,
  resetDeckProgressById,
} from '../storage/storage';
import { Deck, FlashCard } from '../types';
import { nextBatch, gradeCard } from '../utils/srs';

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
  getStudyBatch: (size?: number) => FlashCard[];
  recordAnswer: (cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  toggleFavorite: (cardId: string) => Promise<void>;
  addCardToDeck: (
    deckId: string,
    card: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>,
  ) => Promise<void>;
  createDeck: (name: string, description?: string) => Promise<Deck | undefined>;
  renameDeck: (deckId: string, name: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  resetDeckProgress: (deckId: string) => Promise<void>;
  resetAllDecksProgress: () => Promise<void>;
  reload: () => Promise<void>;
};

const DeckContext = createContext<Ctx | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(undefined);

  async function seedOrMerge() {
    const stored = await loadDecks();
    let working = stored ?? [];
    // Seed on truly empty installs
    if (!working || working.length === 0) {
      if (SEED_DECKS.length > 0) {
        for (const d of SEED_DECKS) {
          await upsertDeck(d);
        }
        working = SEED_DECKS.slice();
      } else {
        working = [];
      }
    } else {
      // Merge in any new seed decks by id
      const present = new Set(working.map((d) => d.id));
      let changed = false;
      for (const d of SEED_DECKS) {
        if (!present.has(d.id)) {
          working.push(d);
          changed = true;
        }
      }
      if (changed) await saveDecks(working);
    }
    setDecks(working);
    if (!activeDeckId && working.length > 0) setActiveDeckId(working[0].id);
  }

  useEffect(() => {
    (async () => {
      await seedOrMerge();
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeDeck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) || decks[0],
    [decks, activeDeckId],
  );

  async function setDeck(updated: Deck) {
    const arr = decks.map((d) => (d.id === updated.id ? updated : d));
    setDecks(arr);
    await saveDecks(arr);
  }

  function getStudyBatch(size = 15) {
    if (!activeDeck) return [] as FlashCard[];
    return nextBatch(activeDeck.cards, size);
  }

  async function recordAnswer(cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) {
    if (!activeDeck) return;
    const deck = { ...activeDeck };
    const idx = deck.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;
    deck.cards[idx] = gradeCard(deck.cards[idx], quality);
    await setDeck(deck);
  }

  async function toggleFavorite(cardId: string) {
    const stored = await loadDecks();
    let changed = false;
    const next = (stored || []).map((d) => {
      const cards = (d.cards || []).map((c) => {
        if (c.id !== cardId) return c;
        changed = true;
        return { ...c, favorite: !c.favorite };
      });
      return { ...d, cards };
    });
    if (changed) {
      await saveDecks(next);
      setDecks(next);
    }
  }

  async function addCardToDeck(
    deckId: string,
    newCard: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>,
  ) {
    const card: FlashCard = {
      ...newCard,
      createdAt: Date.now(),
      due: Date.now(),
      reps: 0,
      interval: 0,
      ease: 2.5,
    } as FlashCard;
    await addCardStorage(deckId, card);
    const updated = await loadDecks();
    setDecks(updated);
  }

  async function createDeck(name: string, description?: string): Promise<Deck | undefined> {
    const id =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();
    const newDeck: Deck = { id, name: name.trim(), description: description || '', cards: [] };
    await upsertDeck(newDeck);
    const updated = await loadDecks();
    setDecks(updated);
    if (!activeDeckId) setActiveDeckId(newDeck.id);
    return newDeck;
  }

  async function renameDeck(deckId: string, name: string) {
    await renameDeckById(deckId, name);
    const updated = await loadDecks();
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

  async function resetAllDecksProgress() {
    for (const deck of decks) {
      await resetDeckProgressById(deck.id);
    }
    const updated = await loadDecks();
    setDecks(updated);
  }

  async function reload() {
    const stored = await loadDecks();
    setDecks(stored);
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
    addCardToDeck,
    createDeck,
    renameDeck,
    deleteDeck,
    resetDeckProgress,
    resetAllDecksProgress,
    reload,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeckContext() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeckContext must be used within DeckProvider');
  return ctx;
}
