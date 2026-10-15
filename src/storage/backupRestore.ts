import { Deck } from '../types';
import { validateBackupDecks } from './backupValidation';
import { withStorageTransaction } from './durableStorage';
import {
  mergeEventHistory,
  serializeLearningHistoryWrite,
  validateLearningEvents,
} from './learningEvents';

/** Replace decks and merge history as one recoverable, idempotent restore intent. */
export async function restoreBackup(
  decks: Deck[],
  learningEvents?: unknown,
  mode: 'replace' | 'merge-new' = 'replace',
): Promise<void> {
  // Snapshot validated input so a caller cannot mutate it while it waits in a queue.
  validateBackupDecks(decks);
  if (!['replace', 'merge-new'].includes(mode)) throw new Error('Invalid restore mode');
  const deckJSON = JSON.stringify(decks);
  const incoming =
    learningEvents === undefined ? undefined : validateLearningEvents(learningEvents);
  return serializeLearningHistoryWrite(() =>
    withStorageTransaction(async (tx) => {
      // Validate conflicts/current history before buffering or persisting an intent.
      let historyJSON: string | undefined;
      if (incoming !== undefined) {
        const raw = await tx.getItem('SRS_LEARNING_EVENTS_V1');
        const stored = raw === null ? { schemaVersion: 1, events: [] } : JSON.parse(raw);
        if (stored?.schemaVersion !== 1) throw new Error('Unsupported learning history version');
        const current = validateLearningEvents(stored.events);
        historyJSON = JSON.stringify({
          schemaVersion: 1,
          events: mergeEventHistory(current, incoming),
        });
      }
      let restoredJSON = deckJSON;
      if (mode === 'merge-new') {
        const raw = await tx.getItem('SRS_DECKS_V3');
        const current = raw === null ? [] : JSON.parse(raw);
        validateBackupDecks(current);
        const incomingDecks = JSON.parse(deckJSON) as Deck[];
        const ids = new Set(current.flatMap((deck) => deck.cards.map((card) => card.id)));
        for (const incomingDeck of incomingDecks) {
          const newCards = incomingDeck.cards.filter((card) => !ids.has(card.id));
          newCards.forEach((card) => ids.add(card.id));
          const existing = current.find((deck) => deck.id === incomingDeck.id);
          if (existing) existing.cards.push(...newCards);
          else current.push({ ...incomingDeck, cards: newCards });
        }
        restoredJSON = JSON.stringify(current);
      }
      await tx.setItem('SRS_DECKS_V3', restoredJSON);
      if (historyJSON !== undefined) await tx.setItem('SRS_LEARNING_EVENTS_V1', historyJSON);
    }),
  );
}
