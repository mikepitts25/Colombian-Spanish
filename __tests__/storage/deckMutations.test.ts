import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCard, renameDeckById, loadDecks } from '../../src/storage/storage';
import { commitFlashcardAnswer } from '../../src/storage/flashcardAnswer';
const card = {
  id: 'c1',
  front: 'hola',
  back: 'hello',
  createdAt: 0,
  due: 0,
  reps: 0,
  interval: 0,
  ease: 2.5,
};
const write = AsyncStorage.setItem as jest.Mock;
const originalWrite = write.getMockImplementation()!;
beforeEach(async () => {
  write.mockImplementation(originalWrite);
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([{ id: 'd1', name: 'Old', cards: [card] }]),
  );
});
afterEach(() => write.mockImplementation(originalWrite));
it('preserves both concurrent rename and added card', async () => {
  await Promise.all([renameDeckById('d1', 'New'), addCard('d1', { ...card, id: 'c2' })]);
  expect((await loadDecks())[0]).toMatchObject({
    name: 'New',
    cards: [card, { ...card, id: 'c2' }],
  });
});
it('preserves grading when a rename overlaps', async () => {
  await Promise.all([
    commitFlashcardAnswer({ attemptId: 'a', sessionId: 's', cardId: 'c1', quality: 4 }),
    renameDeckById('d1', 'New'),
  ]);
  expect((await loadDecks())[0]).toMatchObject({ name: 'New', cards: [{ reps: 1 }] });
});
it('rejects malformed stored decks without overwriting them', async () => {
  await AsyncStorage.setItem('SRS_DECKS_V3', 'corrupt');
  await expect(addCard('d1', { ...card, id: 'c2' })).rejects.toThrow();
  expect(await AsyncStorage.getItem('SRS_DECKS_V3')).toBe('corrupt');
});
it('recovers an interrupted rename before adding a card', async () => {
  write.mockImplementationOnce(originalWrite).mockImplementationOnce(async () => {
    throw new Error('disk full');
  });
  await expect(renameDeckById('d1', 'New')).rejects.toThrow('disk full');
  write.mockImplementation(originalWrite);
  await addCard('d1', { ...card, id: 'c2' });
  expect((await loadDecks())[0]).toMatchObject({
    name: 'New',
    cards: [card, { ...card, id: 'c2' }],
  });
  expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
});
