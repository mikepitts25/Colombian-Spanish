import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { loadDecks, saveDecks, upsertDeck, addCard as addCardStorage } from '../storage/storage';
import { Deck, FlashCard } from '../types';
import { nextBatch, gradeCard } from '../utils/srs';
import { ActionsDeck } from '../data/decks/actions';

let SEED_DECKS: Deck[] = [ActionsDeck];
try {
  const decksIndex = require('../data/decks');
  if (decksIndex && Array.isArray(decksIndex.ALL_DECKS) && decksIndex.ALL_DECKS.length > 0) {
    SEED_DECKS = decksIndex.ALL_DECKS as Deck[];
  }
} catch {}

const REMOVED_IDS = new Set<string>(['colombian-basic-1']);

type Ctx = {
  ready: boolean;
  decks: Deck[];
  activeDeck: Deck | undefined;
  activeDeckId: string | undefined;
  setActiveDeckId: (id: string) => void;
  getStudyBatch: (size?: number) => FlashCard[];
  recordAnswer: (cardId: string, quality: 0|1|2|3|4|5) => Promise<void>;
  addCard: (card: Omit<FlashCard, 'createdAt'|'due'|'reps'|'interval'|'ease'>) => Promise<void>;
  reload: () => Promise<void>;
};

const DeckContext = createContext<Ctx | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(undefined);

  async function migrateAndSeed() {
    const stored = (await loadDecks()).filter(d => !REMOVED_IDS.has(d.id));

    if (stored.length === 0) {
      for (const d of SEED_DECKS) {
        await upsertDeck(d);
      }
      setDecks(SEED_DECKS);
      setActiveDeckId(SEED_DECKS[0]?.id);
      return;
    }

    const storedIds = new Set(stored.map(d => d.id));
    let changed = false;
    for (const d of SEED_DECKS) {
      if (!storedIds.has(d.id)) {
        stored.push(d);
        changed = true;
      }
    }
    if (changed) {
      await saveDecks(stored);
    }
    setDecks(stored);
    if (!activeDeckId || !stored.some(d => d.id === activeDeckId)) {
      setActiveDeckId(stored[0]?.id);
    }
  }

  useEffect(() => {
    (async () => {
      await migrateAndSeed();
      setReady(true);
    })();
  }, []);

  const activeDeck = useMemo(() => decks.find(d => d.id === activeDeckId) || decks[0], [decks, activeDeckId]);

  async function setDeck(updated: Deck) {
    const arr = decks.map(d => d.id === updated.id ? updated : d);
    setDecks(arr);
    await saveDecks(arr);
  }

  function getStudyBatch(size = 15) {
    if (!activeDeck) return [] as FlashCard[];
    return nextBatch(activeDeck.cards, size);
  }

  async function recordAnswer(cardId: string, quality: 0|1|2|3|4|5) {
    if (!activeDeck) return;
    const deck = { ...activeDeck };
    const idx = deck.cards.findIndex(c => c.id === cardId);
    if (idx === -1) return;
    deck.cards[idx] = gradeCard(deck.cards[idx], quality);
    await setDeck(deck);
  }

  async function addCard(newCard: Omit<FlashCard, 'createdAt'|'due'|'reps'|'interval'|'ease'>) {
    if (!activeDeck) return;
    const card: FlashCard = {
      ...newCard,
      createdAt: Date.now(),
      due: Date.now(),
      reps: 0,
      interval: 0,
      ease: 2.5
    } as FlashCard;
    await addCardStorage(activeDeck.id, card);
    const updated = await loadDecks();
    setDecks(updated.filter(d => !REMOVED_IDS.has(d.id)));
  }

  async function reload() {
    const stored = await loadDecks();
    setDecks(stored.filter(d => !REMOVED_IDS.has(d.id)));
  }

  const value: Ctx = {
    ready,
    decks,
    activeDeck,
    activeDeckId,
    setActiveDeckId,
    getStudyBatch,
    recordAnswer,
    addCard,
    reload,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeckContext() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeckContext must be used within DeckProvider');
  return ctx;
}
