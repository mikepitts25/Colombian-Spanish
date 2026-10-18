import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Animated, PanResponder, Dimensions } from 'react-native';
let mockReducedMotion = true;
jest.mock('../../src/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));
import Flashcard from '../../src/components/Flashcard';
import { FlashCard } from '../../src/types';

jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
}));

let mockLanguage: 'es' | 'en' = 'es';

jest.mock('../../src/context/LanguageContext', () => {
  const { translate } = jest.requireActual('../../src/i18n/translations');
  return {
    useLanguage: () => ({
      language: mockLanguage,
      toggleLanguage: jest.fn(),
      setLanguage: jest.fn(),
      t: (key: any, values?: Record<string, string | number>) =>
        translate(mockLanguage, key, values),
    }),
  };
});

import { speakCard } from '../../src/services/tts';

const mockSpeakCard = speakCard as jest.Mock;

// ── Test helpers ──────────────────────────────────────────────────────────────

const NOW = Date.now();

function makeCard(overrides: Partial<FlashCard> = {}): FlashCard {
  return {
    id: 'c001',
    front: 'chimba',
    back: 'awesome / cool',
    example: '¡Eso está chimba! | That is awesome!',
    tags: ['slang'],
    createdAt: NOW,
    due: NOW,
    reps: 0,
    interval: 0,
    ease: 2.5,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

afterEach(() => jest.restoreAllMocks());

beforeEach(() => {
  jest.clearAllMocks();
  mockLanguage = 'es';
  mockReducedMotion = true;
});

describe('Flashcard', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders without crashing with a minimal card', () => {
    const card = makeCard({ example: undefined, tags: undefined, ipa: undefined });
    const onGrade = jest.fn();
    expect(() => render(<Flashcard card={card} onGrade={onGrade} />)).not.toThrow();
  });

  it('renders the card front (Spanish word)', () => {
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('chimba')).toBeTruthy();
  });

  it('renders without crashing when card has no example', () => {
    const card = makeCard({ example: undefined });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  it('renders without crashing when card has no tags', () => {
    const card = makeCard({ tags: undefined });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  it('renders without crashing when card is marked as favorite', () => {
    const card = makeCard({ favorite: true });
    expect(() => render(<Flashcard card={card} onGrade={jest.fn()} />)).not.toThrow();
  });

  it('renders the localized Spanish flip accessibility button by default', () => {
    const { getByLabelText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByLabelText(/Voltear tarjeta: chimba/)).toBeTruthy();
  });

  it('renders the English flip accessibility button when UI language is English', () => {
    mockLanguage = 'en';
    const { getByLabelText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByLabelText(/Flip card: chimba/)).toBeTruthy();
  });

  // ── Card back visibility ───────────────────────────────────────────────────

  it('retains back text for the flip while hiding the inactive face from accessibility', () => {
    // The back face is always rendered; visibility is controlled by CSS rotation.
    const { getByText } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
    expect(getByText('awesome / cool', { includeHiddenElements: true })).toBeTruthy();
  });

  it('renders Spanish example text on the front and English example text on the back', () => {
    const { getByTestId } = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);

    expect(getByTestId('flashcard-front-example').props.children).toEqual([
      '"',
      '¡Eso está chimba!',
      '"',
    ]);
    expect(
      getByTestId('flashcard-back-example', { includeHiddenElements: true }).props.children,
    ).toBe('That is awesome!');
  });

  // ── Card reset on prop change ──────────────────────────────────────────────

  it('resets to front when card prop changes (different id)', () => {
    const onGrade = jest.fn();
    const card1 = makeCard({ id: 'c1', front: 'hola' });
    const card2 = makeCard({ id: 'c2', front: 'gracias' });
    const { getByText, rerender } = render(<Flashcard card={card1} onGrade={onGrade} />);
    expect(getByText('hola')).toBeTruthy();
    rerender(<Flashcard card={card2} onGrade={onGrade} />);
    expect(getByText('gracias')).toBeTruthy();
  });

  it('calls speakCard with the current card when the speaker button is pressed', () => {
    const card = makeCard({ id: '0009', front: 'hola' });
    const { getByText } = render(<Flashcard card={card} onGrade={jest.fn()} />);

    fireEvent.press(getByText('🔊'));

    expect(mockSpeakCard).toHaveBeenCalledWith(card);
  });
});

it('hides the inactive answer from accessibility queries and flips without motion when requested', () => {
  const timing = jest.spyOn(Animated, 'timing');
  const ui = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
  expect(ui.queryByText('awesome / cool')).toBeNull();
  fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
  expect(ui.getByText('awesome / cool')).toBeTruthy();
  expect(ui.queryByText('chimba')).toBeNull();
  expect(timing).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: awesome/ }));
  expect(ui.getByText('chimba')).toBeTruthy();
  timing.mockRestore();
});
it('has an explicit localized audio action and grades with the latest callback after a rerender', () => {
  let handlers: any;
  const original = PanResponder.create;
  const spy = jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => {
    if (!handlers) handlers = config;
    return original(config);
  });
  const first = jest.fn(),
    second = jest.fn();
  const card = makeCard();
  const ui = render(<Flashcard card={card} onGrade={first} />);
  fireEvent.press(ui.getByRole('button', { name: 'Escuchar: chimba' }));
  expect(mockSpeakCard).toHaveBeenCalledWith(card);
  ui.rerender(<Flashcard card={card} onGrade={second} />);
  act(() => handlers.onPanResponderRelease(null, { dx: 100 }));
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledWith(4);
  spy.mockRestore();
});

it('finishes an interrupted flip immediately when Reduce Motion becomes enabled', () => {
  let done!: (result: { finished: boolean }) => void;
  const spy = jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (cb: any) => {
      done = cb;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
  mockReducedMotion = false;
  const card = makeCard();
  const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
  expect(ui.queryByText('awesome / cool')).toBeNull();
  mockReducedMotion = true;
  ui.rerender(<Flashcard card={card} onGrade={jest.fn()} />);
  expect(ui.getByText('awesome / cool')).toBeTruthy();
  act(() => done({ finished: true }));
  expect(ui.queryByText('chimba')).toBeNull();
  spy.mockRestore();
});
it('does not grade a later card from a stale swipe completion or start overlapping swipe animations', () => {
  let handlers: any, done!: (result: { finished: boolean }) => void;
  const original = PanResponder.create;
  const responder = jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => {
    handlers = config;
    return original(config);
  });
  const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (cb: any) => {
      done = cb;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
  mockReducedMotion = false;
  const grade = jest.fn(),
    card = makeCard();
  const ui = render(<Flashcard card={card} onGrade={grade} />);
  act(() => {
    handlers.onPanResponderRelease(null, { dx: 100 });
    handlers.onPanResponderRelease(null, { dx: 100 });
  });
  expect(timing).toHaveBeenCalledTimes(1);
  ui.rerender(<Flashcard card={makeCard({ id: 'other', front: 'adiós' })} onGrade={grade} />);
  act(() => done({ finished: true }));
  expect(grade).not.toHaveBeenCalled();
  expect(ui.getByText('adiós')).toBeTruthy();
  timing.mockRestore();
  responder.mockRestore();
});

it('restores a stable card face when a gesture is terminated during a flip', () => {
  let handlers: any;
  const original = PanResponder.create;
  const responder = jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => {
    handlers = config;
    return original(config);
  });
  const timing = jest
    .spyOn(Animated, 'timing')
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() } as any);
  mockReducedMotion = false;
  const ui = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
  act(() => handlers.onPanResponderTerminate());
  expect(ui.getByText('awesome / cool')).toBeTruthy();
  expect(ui.queryByText('chimba')).toBeNull();
  timing.mockRestore();
  responder.mockRestore();
});

it.each([
  [100, 4],
  [-100, 2],
])('captures swipe direction before native resets dx=%s', (dx, quality) => {
  let handlers: any, done!: (result: { finished: boolean }) => void;
  const original = PanResponder.create;
  const responder = jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => {
    handlers = config;
    return original(config);
  });
  const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (cb: any) => {
      done = cb;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
  mockReducedMotion = false;
  const grade = jest.fn();
  render(<Flashcard card={makeCard()} onGrade={grade} />);
  const gesture = { dx };
  act(() => handlers.onPanResponderRelease(null, gesture));
  gesture.dx = 0;
  act(() => done({ finished: true }));
  expect(grade).toHaveBeenCalledTimes(1);
  expect(grade).toHaveBeenCalledWith(quality);
  timing.mockRestore();
  responder.mockRestore();
});

// Enlarged cards must use an immediate, single-face layout without losing reveal state.
test('large text flips immediately and keeps the revealed face across live size changes', () => {
  const window = Dimensions.get('window'),
    screen = Dimensions.get('screen');
  mockReducedMotion = false;
  act(() =>
    Dimensions.set({ window: { ...window, fontScale: 3 }, screen: { ...screen, fontScale: 3 } }),
  );
  const timing = jest.spyOn(Animated, 'timing');
  const onGrade = jest.fn();
  const ui = render(<Flashcard card={makeCard()} onGrade={onGrade} expandForLargeText />);
  try {
    fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
    expect(timing).not.toHaveBeenCalled();
    expect(ui.getByRole('button', { name: /Voltear tarjeta: awesome/ })).toBeTruthy();
    expect(ui.queryByText('chimba', { includeHiddenElements: true })).toBeNull();
    act(() =>
      Dimensions.set({
        window: { ...window, fontScale: 3.5 },
        screen: { ...screen, fontScale: 3.5 },
      }),
    );
    expect(ui.getByRole('button', { name: /Voltear tarjeta: awesome/ })).toBeTruthy();
    expect(onGrade).not.toHaveBeenCalled();
  } finally {
    ui.unmount();
    act(() => Dimensions.set({ window, screen }));
  }
});

test('keeps the existing card presentation for consumers that have not enabled expanded layout', () => {
  const window = Dimensions.get('window'),
    screen = Dimensions.get('screen');
  mockReducedMotion = false;
  act(() =>
    Dimensions.set({ window: { ...window, fontScale: 3 }, screen: { ...screen, fontScale: 3 } }),
  );
  const timing = jest.spyOn(Animated, 'timing');
  const ui = render(<Flashcard card={makeCard()} onGrade={jest.fn()} />);
  try {
    fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
    expect(timing).toHaveBeenCalled();
  } finally {
    ui.unmount();
    act(() => Dimensions.set({ window, screen }));
  }
});

import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
it('keeps the revealed face and grade callback while applying Barrio and returning to Classic', () => {
  let selection!: ReturnType<typeof useThemeSelection>;
  const grade = jest.fn();
  function Controller() {
    const next = useThemeSelection();
    React.useLayoutEffect(() => {
      selection = next;
    }, [next]);
    return <Flashcard card={makeCard()} onGrade={grade} />;
  }
  const ui = render(
    <ThemeProvider>
      <Controller />
    </ThemeProvider>,
  );
  fireEvent.press(ui.getByRole('button', { name: /Voltear tarjeta: chimba/ }));
  expect(ui.getByText('awesome / cool')).toHaveStyle({ color: '#f8fafc' });
  act(() => selection.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  expect(ui.getByText('awesome / cool')).toHaveStyle({ color: '#18352F' });
  expect(ui.queryByText('chimba')).toBeNull();
  act(() => selection.applySelection({ themeId: 'classic', appearanceMode: 'light' }));
  expect(ui.getByText('awesome / cool')).toHaveStyle({ color: '#f8fafc' });
  expect(grade).not.toHaveBeenCalled();
});
