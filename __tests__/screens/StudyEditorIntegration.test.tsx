import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudyScreen from '../../src/screens/StudyScreen';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { getDailyProgress, getLastStudySession, loadDecks } from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { Deck, FlashCard } from '../../src/types';

let mockParams: Record<string, unknown> = {};
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: any) => require('react').useEffect(callback, [callback]),
  useNavigation: () => ({
    navigate: jest.fn(),
    setParams: (patch: Record<string, unknown>) => Object.assign(mockParams, patch),
  }),
  useRoute: () => ({ params: mockParams }),
}));
jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [] }));

// Keep the real screen/provider/storage boundary: a mock provider would hide
// membership changes caused by editor writes and new-card insertion.
let current: ReturnType<typeof useDeckContext>;
function Probe() {
  const context = useDeckContext();
  React.useLayoutEffect(() => {
    current = context;
  }, [context]);
  return null;
}
function App() {
  return (
    <DeckProvider>
      <Probe />
      <StudyScreen />
    </DeckProvider>
  );
}
function card(id: string, front: string): FlashCard {
  return { id, front, back: `answer ${id}`, createdAt: 0, due: 0, reps: 0, interval: 0, ease: 2.5 };
}
beforeEach(async () => {
  await AsyncStorage.clear();
  mockParams = { autoStartDeckId: 'editor-qa' };
  const deck: Deck = {
    id: 'editor-qa',
    name: 'Editor QA',
    cards: [card('one', 'saludo uno'), card('two', 'saludo dos')],
  };
  await AsyncStorage.setItem('SRS_DECKS_V3', JSON.stringify([deck]));
});

test.each(['grade-first', 'editor-first'])(
  '%s preserves a real Study queue, current edits and exactly-once evidence across remount',
  async (order) => {
    let screen = render(<App />);
    await screen.findByText('saludo uno');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    const initial = await getLastStudySession();
    expect(initial?.queue?.cardIds).toEqual(['one', 'two']);

    await act(async () => {
      const edit = () =>
        Promise.all([
          current.updateCardReview('one', {
            back: 'corrected first answer',
            reviewStatus: 'reviewed',
          }),
          current.updateCardReview('two', { back: 'corrected second answer', flagged: true }),
          current.addCardToDeck('editor-qa', {
            id: 'three',
            front: 'saludo tres',
            back: 'third answer',
          }),
          current.renameDeck('editor-qa', 'Edited QA'),
        ]);
      if (order === 'grade-first') {
        fireEvent.press(screen.getByText('Bien'));
        await edit();
      } else {
        const editing = edit();
        fireEvent.press(screen.getByText('Bien'));
        await editing;
      }
    });
    await waitFor(() => expect(screen.getByText('saludo dos')).toBeTruthy());
    expect(screen.getByText('1 restantes')).toBeTruthy();
    const after = await getLastStudySession();
    expect(after?.queue?.sessionId).toBe(initial?.queue?.sessionId);
    expect(after?.queue?.cardIds).toEqual(['two']);
    const stored = (await loadDecks())[0];
    expect(stored.name).toBe('Edited QA');
    expect(stored.cards).toHaveLength(3);
    expect(stored.cards[0]).toMatchObject({
      reps: 1,
      back: 'corrected first answer',
      reviewStatus: 'reviewed',
    });
    expect(stored.cards[1]).toMatchObject({
      reps: 0,
      back: 'corrected second answer',
      flagged: true,
    });
    expect(current.activeDeck).toEqual(stored);
    expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
    expect(await getLearningEvents()).toEqual([
      expect.objectContaining({ cardId: 'one', quality: 4 }),
    ]);

    screen.unmount();
    screen = render(<App />);
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('saludo dos');
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect((await getLastStudySession())?.queue?.cardIds).toEqual(['two']);
    await act(async () => fireEvent.press(screen.getByText('Bien')));
    await screen.findByText('Sesión terminada');
    expect((await getLastStudySession())?.queue?.cardIds).toEqual([]);
    expect(await getDailyProgress()).toMatchObject({ count: 2, newCount: 2 });
    expect((await getLearningEvents()).map((event) => event.cardId)).toEqual(['one', 'two']);
    expect((await loadDecks())[0].cards[2]).toMatchObject({ id: 'three', reps: 0 });
  },
);

test('editor recovery of a partial grade keeps the pending retry exactly once', async () => {
  const screen = render(<App />);
  await screen.findByText('saludo uno');
  await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
  const write = AsyncStorage.setItem as jest.Mock;
  const original = write.getMockImplementation()!;
  let fail = true;
  write.mockImplementation(async (key, value) => {
    if (key === 'SRS_SEEN_WORDS_V1' && fail) {
      fail = false;
      throw new Error('QA interrupted grade');
    }
    return original(key, value);
  });
  try {
    await act(async () => fireEvent.press(screen.getByText('Bien')));
    await screen.findByText('Intentar guardar de nuevo');
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).not.toBeNull();
    await act(async () => {
      await current.updateCardReview('two', { back: 'correction after interrupted grade' });
    });
    // The editor transaction first replays the pending journal. The visible
    // grade retry must acknowledge that attempt, never count a second answer.
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
    expect(await getLearningEvents()).toHaveLength(1);
    await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
    await screen.findByText('saludo dos');
    expect(screen.getByText('1 restantes')).toBeTruthy();
    expect(await getDailyProgress()).toMatchObject({ count: 1, newCount: 1 });
    expect(await getLearningEvents()).toHaveLength(1);
    expect((await getLastStudySession())?.queue?.cardIds).toEqual(['two']);
    expect((await loadDecks())[0].cards[1].back).toBe('correction after interrupted grade');
    expect(current.activeDeck).toEqual((await loadDecks())[0]);
  } finally {
    write.mockImplementation(original);
  }
});
