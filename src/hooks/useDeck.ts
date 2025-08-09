import { useEffect, useMemo, useState } from 'react';
import { addCard as addCardStorage, loadDecks, saveDecks, upsertDeck } from '../storage/storage';
import { Deck, FlashCard } from '../types';
import { ColombianBasicDeck } from '../data/decks/colombian_basic';
import { nextBatch, gradeCard } from '../utils/srs';

export function useDeck() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string>('colombian-basic-1');

  useEffect(() => {
    (async () => {
      const stored = await loadDecks();
      if (!stored || stored.length === 0) {
        await upsertDeck(ColombianBasicDeck);
        setDecks([ColombianBasicDeck]);
      } else {
        setDecks(stored);
      }
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

  async function addCard(newCard: Omit<FlashCard, 'createdAt' | 'due' | 'reps' | 'interval' | 'ease'>) {
    const card: FlashCard = {
      ...newCard,
      createdAt: Date.now(),
      due: Date.now(),
      reps: 0,
      interval: 0,
      ease: 2.5
    };
    await addCardStorage(activeDeckId, card);
    const updated = await loadDecks();
    setDecks(updated);
  }

  return { ready, decks, activeDeck, setActiveDeckId, getStudyBatch, recordAnswer, addCard };
}
