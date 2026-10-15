import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureBackupSnapshot, parseBackupText } from '../../src/storage/backupSnapshot';
import { commitFlashcardAnswer } from '../../src/storage/flashcardAnswer';
const deck = {
  id: 'd1',
  name: 'Local',
  cards: [
    {
      id: 'c1',
      front: 'hola',
      back: 'hello',
      createdAt: 0,
      due: 0,
      reps: 0,
      interval: 0,
      ease: 2.5,
    },
  ],
};
beforeEach(async () => {
  await AsyncStorage.clear();
});
it.each([undefined, 1, 2])('parses supported version %s and retains custom content', (version) => {
  const text = JSON.stringify({
    kind: 'colombian-spanish-backup',
    version,
    decks: [deck],
    ...(version === 2 ? { learningEvents: [] } : {}),
  });
  expect(parseBackupText(text).decks).toEqual([deck]);
});
it.each([
  '{broken',
  '{}',
  JSON.stringify({ kind: 'colombian-spanish-backup', version: 99, decks: [] }),
  JSON.stringify({
    kind: 'colombian-spanish-backup',
    version: 2,
    decks: [],
    learningEvents: [],
    exportedAt: 'bad-date',
  }),
  JSON.stringify({ kind: 'colombian-spanish-backup', version: 2, decks: [] }),
])('rejects malformed or unsupported input %s', (raw) => {
  expect(() => parseBackupText(raw)).toThrow();
});
it('does not silently create an empty snapshot from corrupt local decks', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', '{broken');
  await expect(captureBackupSnapshot()).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe('{broken');
});
it('captures a coherent deck/history state after a concurrent grade', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([deck]));
  const [, snapshot] = await Promise.all([
    commitFlashcardAnswer({ attemptId: 'grade1', sessionId: 'study1', cardId: 'c1', quality: 4 }),
    captureBackupSnapshot(),
  ]);
  expect(snapshot.decks[0].cards[0].reps).toBe(1);
  expect(snapshot.learningEvents).toHaveLength(1);
  expect(parseBackupText(JSON.stringify(snapshot))).toEqual(snapshot);
});
