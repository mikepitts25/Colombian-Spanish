import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { MAX_BACKUP_CHARACTERS } from '../storage/backupValidation';

export const MAX_BACKUP_FILE_BYTES = 20_000_000;
export class BackupFileError extends Error {
  constructor(public code: 'tooLarge' | 'unavailable') {
    super(code === 'tooLarge' ? 'Backup file is too large' : 'File sharing is unavailable');
  }
}
function cleanup(file: File) {
  try {
    if (file.exists) file.delete();
  } catch {
    /* OS cache cleanup may still be needed. */
  }
}
export async function pickBackupFile(): Promise<string | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (picked.canceled) return null;
  const file = new File(picked.assets[0].uri);
  try {
    if (!file.exists) throw new Error('Backup file is unavailable');
    if (file.size > MAX_BACKUP_FILE_BYTES) throw new BackupFileError('tooLarge');
    const raw = await file.text();
    if (raw.length > MAX_BACKUP_CHARACTERS) throw new BackupFileError('tooLarge');
    return raw;
  } finally {
    // Only remove the app cache copy; never delete the user's selected source file.
    const cache = Paths.cache.uri.replace(/\/?$/, '/');
    if (file.uri.startsWith(cache)) cleanup(file);
  }
}
function cleanupExpiredExports() {
  try {
    const cache = Paths.cache.uri.replace(/\/?$/, '/');
    for (const entry of Paths.cache.list()) {
      if (
        !('extension' in entry) ||
        !entry.name.startsWith('colombian-spanish-backup-') ||
        entry.extension !== '.json' ||
        !entry.uri.startsWith(cache)
      )
        continue;
      const time = entry.creationTime ?? entry.modificationTime;
      if (
        typeof time === 'number' &&
        Number.isFinite(time) &&
        Date.now() - time >= 24 * 60 * 60 * 1000
      )
        cleanup(entry);
    }
  } catch {
    /* Cleanup is best effort; never delete unknown paths or fresh hand-offs. */
  }
}
export async function shareBackupFile(raw: string, dialogTitle: string): Promise<void> {
  if (raw.length > MAX_BACKUP_CHARACTERS) throw new BackupFileError('tooLarge');
  if (!(await Sharing.isAvailableAsync())) throw new BackupFileError('unavailable');
  cleanupExpiredExports();
  const name = `colombian-spanish-backup-${new Date().toISOString().replace(/:/g, '-')}-${Math.random().toString(36).slice(2, 8)}.json`;
  const file = new File(Paths.cache, name);
  let created = false;
  let handedOff = false;
  try {
    file.create();
    created = true;
    file.write(raw);
    if (file.size > MAX_BACKUP_FILE_BYTES) throw new BackupFileError('tooLarge');
    // The Android chooser can return before the recipient opens its content URI.
    handedOff = true;
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle,
    });
  } finally {
    if (created && !handedOff) cleanup(file);
  }
}
