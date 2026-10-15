import { Deck } from '../types';
import { MAX_BACKUP_CHARACTERS, validateBackupDecks } from './backupValidation';
import { withStorageTransaction } from './durableStorage';
import {
  LearningEvent,
  readLearningEvents,
  serializeLearningHistoryWrite,
  validateLearningEvents,
} from './learningEvents';

export type BackupInputCode = 'tooLarge' | 'invalidJson' | 'notBackup' | 'invalidBackup';
export class BackupInputError extends Error {
  constructor(public code: BackupInputCode) {
    super(code);
  }
}
export interface BackupSnapshot {
  kind: 'colombian-spanish-backup';
  version?: 1 | 2;
  exportedAt?: string;
  decks: Deck[];
  learningEvents?: LearningEvent[];
}
export function parseBackupText(raw: string): BackupSnapshot {
  if (raw.length > MAX_BACKUP_CHARACTERS) throw new BackupInputError('tooLarge');
  let value: any;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new BackupInputError('invalidJson');
  }
  if (!value || value.kind !== 'colombian-spanish-backup') throw new BackupInputError('notBackup');
  try {
    if (![undefined, 1, 2].includes(value.version)) throw new Error('Unsupported version');
    validateBackupDecks(value.decks);
    if (
      value.exportedAt !== undefined &&
      (typeof value.exportedAt !== 'string' || !Number.isFinite(Date.parse(value.exportedAt)))
    )
      throw new Error('Invalid date');
    return {
      kind: value.kind,
      version: value.version,
      exportedAt: value.exportedAt,
      decks: value.decks,
      ...(value.version === 2
        ? { learningEvents: validateLearningEvents(value.learningEvents) }
        : {}),
    };
  } catch {
    throw new BackupInputError('invalidBackup');
  }
}

/** One coherent supported-state snapshot, serialized against grade/history/restore writes. */
export function captureBackupSnapshot(): Promise<BackupSnapshot> {
  return serializeLearningHistoryWrite(() =>
    withStorageTransaction(async (tx) => {
      const raw = await tx.getItem('SRS_DECKS_V3');
      const decks = raw === null ? [] : JSON.parse(raw);
      validateBackupDecks(decks);
      const snapshot: BackupSnapshot = {
        kind: 'colombian-spanish-backup',
        version: 2,
        exportedAt: new Date().toISOString(),
        decks,
        learningEvents: await readLearningEvents(tx),
      };
      if (JSON.stringify(snapshot).length > MAX_BACKUP_CHARACTERS)
        throw new BackupInputError('tooLarge');
      return snapshot;
    }),
  );
}
