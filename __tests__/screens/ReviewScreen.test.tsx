import { renderWithTheme } from '../../testFixtures/renderWithTheme';
import React from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { HeaderHeightContext } from '@react-navigation/elements';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewScreen from '../../src/screens/ReviewScreen';
import { Deck, FlashCard } from '../../src/types';
import { useDeck } from '../../src/hooks/useDeck';

jest.mock('../../src/hooks/useDeck', () => ({
  useDeck: jest.fn(),
}));

const mockUseDeck = useDeck as jest.Mock;
const NOW = 1_700_000_000_000;

function makeCard(id: string, overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id,
    front: id,
    back: `translation-${id}`,
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

const DECK: Deck = {
  id: 'deck-a',
  name: 'Slang',
  cards: [
    makeCard('parce', {
      front: 'parce',
      back: 'dude',
      example: 'Hola, parce. | Hi, dude.',
    }),
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function renderReviewScreen(overrides = {}) {
  const updateCardReview = jest.fn().mockResolvedValue(undefined);
  mockUseDeck.mockReturnValue({
    ready: true,
    decks: [DECK],
    updateCardReview,
    ...overrides,
  });

  const screen = renderWithTheme(<ReviewScreen />);
  return { ...screen, updateCardReview };
}

describe('ReviewScreen review queue', () => {
  it('accounts for the native header when keeping editor actions above the keyboard', async () => {
    mockUseDeck.mockReturnValue({ ready: true, decks: [DECK], updateCardReview: jest.fn() });
    const ui = renderWithTheme(
      <HeaderHeightContext.Provider value={74}>
        <ReviewScreen />
      </HeaderHeightContext.Provider>,
    );
    const avoiding = ui.UNSAFE_getByType(KeyboardAvoidingView);
    await act(async () => {
      fireEvent(avoiding.findByType(View), 'layout', {
        persist: () => {},
        nativeEvent: { layout: { x: 0, y: 20, width: 375, height: 573 } },
      });
      DeviceEventEmitter.emit('keyboardWillShow', {
        duration: 0,
        endCoordinates: { screenX: 0, screenY: 407, width: 375, height: 260 },
      });
    });
    // The header plus local y20 starts the viewport at screen y94: 313pt fit above y407.
    const padding = StyleSheet.flatten(avoiding.findByType(View).props.style).paddingBottom;
    expect(573 - padding).toBe(313);
  });

  it('saves inline edits as reviewed', async () => {
    const { getByPlaceholderText, getByText, updateCardReview } = renderReviewScreen();

    fireEvent.changeText(getByPlaceholderText('Traducción en inglés'), 'buddy / friend');
    fireEvent.changeText(
      getByPlaceholderText('Ejemplo con inglés después de |'),
      'Hola, parce. | Hi, buddy.',
    );

    await act(async () => {
      fireEvent.press(getByText('Guardar y seguir'));
    });

    expect(updateCardReview).toHaveBeenCalledWith('parce', {
      back: 'buddy / friend',
      example: 'Hola, parce. | Hi, buddy.',
      flagged: false,
      reviewStatus: 'reviewed',
      reviewedAt: NOW,
    });
  });

  it('marks a card as needing a native check', async () => {
    const { getByText, updateCardReview } = renderReviewScreen();

    await act(async () => {
      fireEvent.press(getByText('Necesita revisión nativa'));
    });

    expect(updateCardReview).toHaveBeenCalledWith('parce', {
      back: 'dude',
      example: 'Hola, parce. | Hi, dude.',
      flagged: true,
      reviewStatus: 'needs_native',
      reviewedAt: NOW,
    });
  });

  it('filters to cards missing an English example', async () => {
    const missingExampleDeck: Deck = {
      ...DECK,
      cards: [
        makeCard('needs-example', {
          front: 'listo',
          back: 'ready',
          example: 'Listo.',
        }),
        makeCard('complete-example', {
          front: 'chévere',
          back: 'cool',
          example: 'Qué chévere. | How cool.',
        }),
      ],
    };

    const { getByText, queryByText } = renderReviewScreen({ decks: [missingExampleDeck] });

    fireEvent.press(getByText('Falta ejemplo EN'));

    await waitFor(() => expect(getByText('listo')).toBeTruthy());
    expect(queryByText('chévere')).toBeNull();
  });
});

it('submits one editorial intent and blocks conflicting controls while saving', async () => {
  let finish!: () => void;
  const updateCardReview = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const screen = renderReviewScreen({ updateCardReview });
  fireEvent.changeText(screen.getByPlaceholderText('Traducción en inglés'), 'retained correction');
  fireEvent.press(screen.getByText('Guardar y seguir'));
  fireEvent.press(screen.getByText('Necesita revisión nativa'));
  expect(updateCardReview).toHaveBeenCalledTimes(1);
  screen.applyTheme({ themeId: 'barrio', appearanceMode: 'light' });
  expect(screen.getByDisplayValue('retained correction')).toHaveStyle({ color: '#18352F' });
  expect(screen.getByText('Saltar')).toBeDisabled();
  expect(screen.getByText('Sin revisar')).toBeDisabled();
  expect(screen.getByPlaceholderText('Traducción en inglés')).toHaveProp('editable', false);
  await act(async () => finish());
  expect(screen.getByText('Guardar y seguir')).not.toBeDisabled();
});

it('keeps a failed editorial draft and retries the exact original intent', async () => {
  const updateCardReview = jest
    .fn()
    .mockRejectedValueOnce(new Error('disk full'))
    .mockResolvedValue(undefined);
  const screen = renderReviewScreen({ updateCardReview });
  fireEvent.changeText(screen.getByPlaceholderText('Traducción en inglés'), 'retained correction');
  await act(async () => fireEvent.press(screen.getByText('Necesita revisión nativa')));
  await screen.findByText('No se pudieron guardar los cambios. Reintenta antes de continuar.');
  expect(screen.getByPlaceholderText('Traducción en inglés')).toHaveProp(
    'value',
    'retained correction',
  );
  expect(screen.getByText('Saltar')).toBeDisabled();
  expect(screen.getByText('Guardar y seguir')).toBeDisabled();
  const original = updateCardReview.mock.calls[0];
  jest.spyOn(Date, 'now').mockReturnValue(NOW + 10000);
  await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
  expect(updateCardReview).toHaveBeenCalledTimes(2);
  expect(updateCardReview.mock.calls[1]).toEqual(original);
  expect(
    screen.queryByText('No se pudieron guardar los cambios. Reintenta antes de continuar.'),
  ).toBeNull();
});

test('retains the failed save intent across a live text-size change', async () => {
  const window = Dimensions.get('window');
  const screenMetrics = Dimensions.get('screen');
  const updateCardReview = jest
    .fn()
    .mockRejectedValueOnce(new Error('disk full'))
    .mockResolvedValue(undefined);
  const screen = renderReviewScreen({ updateCardReview });
  try {
    fireEvent.changeText(screen.getByPlaceholderText('Traducción en inglés'), 'retained draft');
    await act(async () => fireEvent.press(screen.getByText('Guardar y seguir')));
    const original = updateCardReview.mock.calls[0];
    await act(async () =>
      Dimensions.set({
        window: { ...window, fontScale: 3 },
        screen: { ...screenMetrics, fontScale: 3 },
      }),
    );
    screen.applyTheme({ themeId: 'barrio', appearanceMode: 'dark' });
    expect(screen.getByDisplayValue('retained draft')).toHaveStyle({ color: '#F7F3EA' });
    expect(
      screen.getByText('No se pudieron guardar los cambios. Reintenta antes de continuar.'),
    ).toBeTruthy();
    expect(updateCardReview).toHaveBeenCalledTimes(1);
    await act(async () => fireEvent.press(screen.getByText('Intentar guardar de nuevo')));
    expect(updateCardReview.mock.calls[1]).toEqual(original);
  } finally {
    screen.unmount();
    act(() => Dimensions.set({ window, screen: screenMetrics }));
  }
});

test('Barrio selected filters use on-fill ink and preserve Classic white', () => {
  const screen = renderReviewScreen();
  screen.applyTheme({ themeId: 'barrio', appearanceMode: 'dark' });
  for (const label of ['Todas', 'Todos los decks']) {
    const labels = screen.getAllByText(label);
    expect(labels[labels.length - 1]).toHaveStyle({ color: '#14291F' });
  }
  screen.applyTheme({ themeId: 'classic', appearanceMode: 'dark' });
  const labels = screen.getAllByText('Todas');
  expect(labels[labels.length - 1]).toHaveStyle({ color: '#fff' });
});
test('Barrio filter viewports fit full 48-point chips plus focus rings while Classic retains 38', () => {
  const screen = renderReviewScreen();
  screen.applyTheme({ themeId: 'barrio', appearanceMode: 'dark' });
  const rows = screen.UNSAFE_getAllByType(ScrollView).filter((row) => row.props.horizontal);
  expect(rows).toHaveLength(2);
  for (const row of rows) expect(StyleSheet.flatten(row.props.style).height).toBe(56);
  screen.applyTheme({ themeId: 'classic', appearanceMode: 'dark' });
  for (const row of screen.UNSAFE_getAllByType(ScrollView).filter((row) => row.props.horizontal)) {
    expect(StyleSheet.flatten(row.props.style).height).toBe(38);
  }
});
