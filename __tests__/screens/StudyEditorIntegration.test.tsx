import { revealStudyCard } from '../../testFixtures/revealStudyCard';
import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StudyScreen from '../../src/screens/StudyScreen';
import ReviewScreen from '../../src/screens/ReviewScreen';
import AddCardScreen from '../../src/screens/AddCardScreen';
import ManageDecksScreen from '../../src/screens/ManageDecksScreen';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { getDailyProgress, getLastStudySession, loadDecks } from '../../src/storage/storage';
import { getLearningEvents } from '../../src/storage/learningEvents';
import { Deck, FlashCard } from '../../src/types';

let mockParams: Record<string, unknown> = {};
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: jest.fn(),
  useFocusEffect: (callback: any) => require('react').useEffect(callback, [callback]),
  useNavigation: () => ({
    navigate: jest.fn(),
    setParams: (patch: Record<string, unknown>) => Object.assign(mockParams, patch),
  }),
  useRoute: () => ({ params: mockParams }),
}));
jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [] }));
jest.mock('../../src/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

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
function App({ screen = 'study' }: { screen?: 'study' | 'add' | 'manage' } = {}) {
  const Screen = { study: StudyScreen, add: AddCardScreen, manage: ManageDecksScreen }[screen];
  return (
    <DeckProvider>
      <Probe />
      <Screen />
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
    expect(screen.queryByText('Bien')).toBeNull();
    await revealStudyCard(screen);
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
    // The answer changed while the original grade waited behind editorial IO.
    // It must be shown again before a fresh answer can earn credit.
    await screen.findByText(
      'La tarjeta o la sesión cambió. Recarga las tarjetas antes de continuar.',
    );
    expect(await getLearningEvents()).toEqual([]);
    expect((await getLastStudySession())?.queue).toEqual(initial?.queue);
    await act(async () => {
      fireEvent.press(screen.getByText('Recargar tarjetas'));
    });
    fireEvent.press(await screen.findByText('Continuar'));
    await screen.findByText('saludo uno');
    await revealStudyCard(screen);
    await waitFor(() => expect(screen.getByText('Bien')).not.toBeDisabled());
    expect(current.activeDeck?.cards[0].back).toBe('corrected first answer');
    await act(async () => {
      fireEvent.press(screen.getByText('Bien'));
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
    await revealStudyCard(screen);
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
  await revealStudyCard(screen);
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

test.each(['Sin revisar', 'Marcadas', 'Revisión nativa', 'Falta ejemplo EN'])(
  'saving removes the current row from %s without skipping its successor',
  async (filter) => {
    const cards = [
      card('one', 'saludo uno'),
      card('two', 'saludo dos'),
      card('three', 'saludo tres'),
    ].map((value) => ({
      ...value,
      flagged: true,
      ...(filter === 'Revisión nativa' ? { reviewStatus: 'needs_native' as const } : {}),
    }));
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([{ id: 'editor-qa', name: 'Editor QA', cards }]),
    );
    const screen = render(
      <DeckProvider>
        <Probe />
        <ReviewScreen />
      </DeckProvider>,
    );
    await screen.findByText('saludo uno');
    fireEvent.press(screen.getByText(filter));
    fireEvent.changeText(
      screen.getByPlaceholderText('Ejemplo con inglés después de |'),
      'Hola. | Hello.',
    );
    await act(async () => fireEvent.press(screen.getByText('Guardar y seguir')));
    await waitFor(() => expect(screen.getByText('saludo dos')).toBeTruthy());
    expect((await loadDecks())[0].cards[0]).toMatchObject({
      reviewStatus: 'reviewed',
      flagged: false,
      example: 'Hola. | Hello.',
    });
    expect((await loadDecks())[0].cards[1].reps).toBe(0);
    expect(await getLearningEvents()).toEqual([]);
  },
);

test.each([false, true])(
  'saving a retained editorial row advances normally (flagged filter: %s)',
  async (flagged) => {
    const cards = [
      card('one', 'saludo uno'),
      card('two', 'saludo dos'),
      card('three', 'saludo tres'),
    ].map((value) => ({ ...value, flagged: true }));
    await AsyncStorage.setItem(
      'SRS_DECKS_V3',
      JSON.stringify([{ id: 'editor-qa', name: 'Editor QA', cards }]),
    );
    const screen = render(
      <DeckProvider>
        <Probe />
        <ReviewScreen />
      </DeckProvider>,
    );
    await screen.findByText('saludo uno');
    if (flagged) fireEvent.press(screen.getByText('Marcadas'));
    await act(async () =>
      fireEvent.press(screen.getByText(flagged ? 'Necesita revisión nativa' : 'Guardar y seguir')),
    );
    await screen.findByText('saludo dos');
    expect((await loadDecks())[0].cards[0].reviewStatus).toBe(
      flagged ? 'needs_native' : 'reviewed',
    );
  },
);

test('failed filtered editor save retains its row and draft after another transaction recovers the journal', async () => {
  const screen = render(
    <DeckProvider>
      <Probe />
      <ReviewScreen />
    </DeckProvider>,
  );
  await screen.findByText('saludo uno');
  fireEvent.press(screen.getByText('Sin revisar'));
  fireEvent.changeText(screen.getByPlaceholderText('Traducción en inglés'), 'correction to retain');
  const remove = AsyncStorage.removeItem as jest.Mock;
  const original = remove.getMockImplementation()!;
  let fail = true;
  remove.mockImplementation(async (key) => {
    if (key === 'SRS_WRITE_JOURNAL_V1' && fail) {
      fail = false;
      throw new Error('QA acknowledgement failure');
    }
    return original(key);
  });
  try {
    await act(async () => fireEvent.press(screen.getByText('Guardar y seguir')));
    await screen.findByText('No se pudieron guardar los cambios. Reintenta antes de continuar.');
    const persisted = JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)[0].cards[0];
    await act(async () => current.renameDeck('editor-qa', 'Recovered editor QA'));
    expect(current.activeDeck?.cards[0].reviewStatus).toBe('reviewed');
    expect(screen.getByText('saludo uno')).toBeTruthy();
    expect(screen.getByPlaceholderText('Traducción en inglés')).toHaveProp(
      'value',
      'correction to retain',
    );
    expect(screen.getByText('Saltar')).toBeDisabled();
    await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
    await screen.findByText('saludo dos');
    expect((await loadDecks())[0].cards[0]).toMatchObject({
      back: 'correction to retain',
      reviewedAt: persisted.reviewedAt,
      reps: 0,
    });
    expect((await getDailyProgress()).count).toBe(0);
    expect(await getLearningEvents()).toEqual([]);
  } finally {
    remove.mockImplementation(original);
  }
});

test('reopens the card after creating and renaming its deck and canceling a reset', async () => {
  const ui = render(<App screen="add" />);
  fireEvent.changeText(await ui.findByLabelText('Frente (español colombiano)'), 'Un cafecito');
  fireEvent.changeText(ui.getByLabelText('Reverso (inglés)'), 'A little coffee');
  fireEvent.press(ui.getByRole('button', { name: 'Elegir deck' }));
  fireEvent.press(ui.getByRole('button', { name: 'Crear deck' }));
  fireEvent.changeText(ui.getByPlaceholderText('Nombre (ej., Colombianismos)'), 'Café');
  fireEvent.press(ui.getByRole('button', { name: 'Crear' }));
  await ui.findByText('Café');
  fireEvent.press(ui.getByRole('button', { name: 'Guardar tarjeta' }));

  await waitFor(() =>
    expect(Alert.alert).toHaveBeenCalledWith('Agregada', 'Tarjeta agregada a Café'),
  );
  const saved = (await loadDecks()).find((deck) => deck.name === 'Café')!;
  expect(saved.cards).toEqual([
    expect.objectContaining({ front: 'Un cafecito', back: 'A little coffee' }),
  ]);

  ui.rerender(<App screen="manage" />);
  fireEvent.press(ui.getByRole('button', { name: 'Acciones del deck Café' }));
  fireEvent.press(ui.getByRole('button', { name: 'Renombrar: Café' }));
  fireEvent.changeText(ui.getByPlaceholderText('Nombre del deck'), 'Pedidos de café');
  fireEvent.press(ui.getByRole('button', { name: 'Guardar' }));
  fireEvent.press(await ui.findByRole('button', { name: 'Reiniciar progreso: Pedidos de café' }));
  const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls.at(-1)!;
  expect(title).toBe('¿Reiniciar progreso?');
  expect(message).toContain('Pedidos de café');
  const cancel = buttons.find((button: { style?: string }) => button.style === 'cancel');
  expect(cancel.text).toBe('Cancelar');
  cancel.onPress?.();
  expect((await loadDecks()).find((deck) => deck.id === saved.id)).toEqual({
    ...saved,
    name: 'Pedidos de café',
  });

  mockParams = { autoStartDeckId: saved.id };
  ui.rerender(<App />);
  await ui.findByText('Un cafecito');
  expect(current.activeDeck?.id).toBe(saved.id);
});
