import { StorageAccess } from './durableStorage';

const KEY = 'SRS_LIBRARY_COHORT_V1';
/** Run within the same journaled transaction as first seed/merge. Never export as learning data. */
export async function initializeLibraryCohort(
  tx: StorageAccess,
  hadDecks: boolean,
): Promise<boolean> {
  const raw = await tx.getItem(KEY);
  if (raw !== null) {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.legacy !== 'boolean') {
      throw new Error('Invalid library access migration');
    }
    return value.legacy;
  }
  await tx.setItem(KEY, JSON.stringify({ version: 1, legacy: hadDecks }));
  return hadDecks;
}
