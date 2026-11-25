import { StorageAccess } from './durableStorage';
import { validateBackupDecks } from './backupValidation';

const KEY = 'SRS_LIBRARY_COHORT_V1';
/** Run within the same journaled transaction as first seed/merge. Never export as learning data. */
export async function initializeLibraryCohort(
  tx: StorageAccess,
  hadDecks?: boolean,
): Promise<boolean> {
  const raw = await tx.getItem(KEY);
  if (raw !== null) {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.legacy !== 'boolean') {
      throw new Error('Invalid library access migration');
    }
    return value.legacy;
  }
  const legacy = hadDecks ?? (await hasExistingLocalDecks(tx));
  await tx.setItem(KEY, JSON.stringify({ version: 1, legacy }));
  return legacy;
}

async function hasExistingLocalDecks(tx: StorageAccess): Promise<boolean> {
  const raw = await tx.getItem('SRS_DECKS_V3');
  if (raw === null) return false;
  try {
    const decks: unknown = JSON.parse(raw);
    validateBackupDecks(decks);
    return decks.length > 0;
  } catch {
    // A replacement backup can still recover an unreadable local deck file.
    return false;
  }
}
