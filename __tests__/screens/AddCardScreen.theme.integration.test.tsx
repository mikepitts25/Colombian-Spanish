import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeckProvider, useDeckContext } from '../../src/context/DeckContext';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import AddCardScreen from '../../src/screens/AddCardScreen';
import ManageDecksScreen from '../../src/screens/ManageDecksScreen';
import { loadDecks } from '../../src/storage/storage';
const nativeWrite = (AsyncStorage.setItem as jest.Mock).getMockImplementation()!;
let releaseWrite: (() => void) | undefined;
let current: ReturnType<typeof useThemeSelection>;
let deckState: ReturnType<typeof useDeckContext>;
jest.mock('../../src/data/decks', () => ({ ALL_DECKS: [] }));
jest.mock('@react-navigation/native', () => ({
  usePreventRemove: jest.fn(),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, values: any) =>
      require('../../src/i18n/translations').translate('en', key, values),
  }),
}));
function Probe() {
  const selection = useThemeSelection(),
    decks = useDeckContext();
  React.useLayoutEffect(() => {
    current = selection;
    deckState = decks;
  }, [selection, decks]);
  return null;
}
function App({ kind }: { kind: 'create' | 'rename' }) {
  return (
    <ThemeProvider>
      <DeckProvider>
        <Probe />
        {kind === 'create' ? <AddCardScreen /> : <ManageDecksScreen />}
      </DeckProvider>
    </ThemeProvider>
  );
}
beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'SRS_DECKS_V3',
    JSON.stringify([{ id: 'alpha', name: 'Alpha', cards: [] }]),
  );
});
afterEach(() => {
  releaseWrite?.();
  releaseWrite = undefined;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(nativeWrite);
});
test.each(['create', 'rename'] as const)(
  'a real held %s retains its draft and intent across a theme change',
  async (kind) => {
    const ui = render(<App kind={kind} />);
    await waitFor(() => expect(deckState.ready).toBe(true));
    if (kind === 'create') {
      fireEvent.changeText(ui.getByPlaceholderText('¿Qué más pues?'), 'Tema de prueba');
      fireEvent.changeText(ui.getByPlaceholderText('What’s up?'), 'Theme test');
    } else {
      fireEvent.press(ui.getByText('Rename'));
      fireEvent.changeText(ui.getByPlaceholderText('Deck name'), 'Theme test');
    }
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const held = new Promise<void>((resolve) => {
      releaseWrite = resolve;
    });
    let count = 0;
    let exactIntent!: string;
    (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key: string, value: string) => {
      if (key === 'SRS_WRITE_JOURNAL_V1') {
        count++;
        exactIntent = value;
        entered();
        await held;
      }
      return nativeWrite(key, value);
    });
    fireEvent.press(ui.getByText(kind === 'create' ? 'Save card ✓' : 'Save'));
    await act(async () => {
      await started;
    });
    const journal = JSON.parse(exactIntent);
    const intentDecks = JSON.parse(
      journal.entries.find(([key]: [string, string]) => key === 'SRS_DECKS_V3')[1],
    );
    act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
    expect(ui.getByDisplayValue('Theme test')).toHaveStyle({ color: '#18352F' });
    const saveLabel = kind === 'create' ? 'Save card ✓' : 'Save';
    expect(ui.getByRole('button', { name: saveLabel })).toHaveStyle({
      backgroundColor: '#E8E5DD',
      opacity: 1,
    });
    expect(ui.getByText(saveLabel)).toHaveStyle({ color: '#58675E' });
    expect(ui.getByDisplayValue('Theme test')).toHaveProp('keyboardAppearance', 'light');
    expect(JSON.parse((await AsyncStorage.getItem('SRS_DECKS_V3'))!)).toEqual([
      { id: 'alpha', name: 'Alpha', cards: [] },
    ]);
    fireEvent.press(ui.getByText(kind === 'create' ? 'Save card ✓' : 'Save'));
    expect(count).toBe(1);
    await act(async () => {
      releaseWrite!();
      releaseWrite = undefined;
    });
    await waitFor(async () => expect(await loadDecks()).toEqual(intentDecks));
    expect(deckState.decks).toEqual(intentDecks);
    expect(count).toBe(1);
    expect(await AsyncStorage.getItem('SRS_WRITE_JOURNAL_V1')).toBeNull();
    if (kind === 'create')
      expect(intentDecks[0].cards).toEqual([
        expect.objectContaining({ front: 'Tema de prueba', back: 'Theme test', reps: 0 }),
      ]);
    else expect(intentDecks[0].name).toBe('Theme test');
  },
);
