import { Deck } from '../types';
import { validateBackupDecks } from './backupValidation';
import { withStorageTransaction } from './durableStorage';
import {
  mergeEventHistory,
  serializeLearningHistoryWrite,
  validateLearningEvents,
} from './learningEvents';

/** Replace decks and merge history as one recoverable, idempotent restore intent. */
export async function restoreBackup(decks: Deck[], learningEvents?: unknown): Promise<void> {
  // Snapshot validated input so a caller cannot mutate it while it waits in a queue.
  validateBackupDecks(decks);
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
      await tx.setItem('SRS_DECKS_V3', deckJSON);
      if (historyJSON !== undefined) await tx.setItem('SRS_LEARNING_EVENTS_V1', historyJSON);
    }),
  );
}
