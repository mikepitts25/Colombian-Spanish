import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, FlashCard } from '../types';

const KEY = 'SRS_DECKS_V3';

export async function loadDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function saveDecks(decks: Deck[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(decks));
}

export async function upsertDeck(deck: Deck) {
  const decks = await loadDecks();
  const idx = decks.findIndex(d => d.id === deck.id);
  if (idx === -1) decks.push(deck); else decks[idx] = deck;
  await saveDecks(decks);
}

export async function addCard(deckId: string, card: FlashCard) {
  const decks = await loadDecks();
  const d = decks.find(dd => dd.id === deckId);
  if (!d) return;
  d.cards.push(card);
  await saveDecks(decks);
}

export async function removeDeckById(deckId: string) {
  const decks = await loadDecks();
  const next = decks.filter(d => d.id !== deckId);
  await saveDecks(next);
}
