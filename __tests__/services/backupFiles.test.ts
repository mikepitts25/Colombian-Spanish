const mockList = jest.fn();
const mockFile = {
  uri: 'file:///cache/backup.json',
  exists: true,
  size: 100,
  text: jest.fn(),
  create: jest.fn(),
  write: jest.fn(),
  delete: jest.fn(),
};
jest.mock('expo-file-system', () => ({
  File: jest.fn(() => mockFile),
  Paths: { cache: { uri: 'file:///cache/', list: () => mockList() } },
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
import * as Picker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { pickBackupFile, shareBackupFile } from '../../src/services/backupFiles';
const backup = JSON.stringify({
  kind: 'colombian-spanish-backup',
  version: 2,
  decks: [],
  learningEvents: [],
});
beforeEach(() => {
  jest.clearAllMocks();
  mockList.mockReturnValue([]);
  mockFile.size = 100;
  mockFile.exists = true;
  mockFile.text.mockResolvedValue(backup);
  (Picker.getDocumentAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [{ uri: mockFile.uri }],
  });
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
});
it('treats picker cancellation as no action', async () => {
  (Picker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
  expect(await pickBackupFile()).toBeNull();
  expect(mockFile.text).not.toHaveBeenCalled();
});
it('checks file size before reading and parsing content', async () => {
  mockFile.size = 20_000_001;
  await expect(pickBackupFile()).rejects.toThrow('large');
  expect(mockFile.text).not.toHaveBeenCalled();
});
it('reads a copied JSON file for validation and preview', async () => {
  expect(await pickBackupFile()).toBe(backup);
  expect(Picker.getDocumentAsync).toHaveBeenCalledWith(
    expect.objectContaining({ copyToCacheDirectory: true, multiple: false }),
  );
});
it('retains a handed-off JSON file for asynchronous recipient reads', async () => {
  await shareBackupFile(backup, 'Save backup');
  expect(mockFile.write).toHaveBeenCalledWith(backup);
  expect(Sharing.shareAsync).toHaveBeenCalledWith(
    mockFile.uri,
    expect.objectContaining({ mimeType: 'application/json', UTI: 'public.json' }),
  );
  expect(mockFile.delete).not.toHaveBeenCalled();
});
it('retains a handed-off file even if the share activity reports failure', async () => {
  (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('unavailable'));
  await expect(shareBackupFile(backup, 'Save backup')).rejects.toThrow('unavailable');
  expect(mockFile.delete).not.toHaveBeenCalled();
});
it('does not write a backup if file sharing is unavailable', async () => {
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
  await expect(shareBackupFile(backup, 'Save backup')).rejects.toThrow('unavailable');
  expect(mockFile.write).not.toHaveBeenCalled();
});

it('never deletes the selected source outside the app cache', async () => {
  const saved = mockFile.uri;
  mockFile.uri = 'file:///documents/original.json';
  try {
    await pickBackupFile();
    expect(mockFile.delete).not.toHaveBeenCalled();
  } finally {
    mockFile.uri = saved;
  }
});
it('does not delete an existing file if temporary-file creation fails', async () => {
  mockFile.create.mockImplementationOnce(() => {
    throw new Error('already exists');
  });
  await expect(shareBackupFile(backup, 'Save backup')).rejects.toThrow('already exists');
  expect(mockFile.delete).not.toHaveBeenCalled();
});

it('cleans only owned exports older than one day on a later export', async () => {
  const old = {
    uri: 'file:///cache/colombian-spanish-backup-old.json',
    name: 'colombian-spanish-backup-old.json',
    extension: '.json',
    creationTime: Date.now() - 25 * 60 * 60 * 1000,
    exists: true,
    delete: jest.fn(),
  };
  const fresh = {
    ...old,
    name: 'colombian-spanish-backup-fresh.json',
    creationTime: Date.now(),
    delete: jest.fn(),
  };
  const unrelated = { ...old, name: 'someone-else.json', delete: jest.fn() };
  mockList.mockReturnValue([old, fresh, unrelated]);
  await shareBackupFile(backup, 'Save backup');
  expect(old.delete).toHaveBeenCalledTimes(1);
  expect(fresh.delete).not.toHaveBeenCalled();
  expect(unrelated.delete).not.toHaveBeenCalled();
});
