import React from 'react';
import { AppState, Animated } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Flashcard from '../../src/components/Flashcard';
import * as prefs from '../../src/storage/prefs';
import { speakCard, stop } from '../../src/services/tts';
import { FlashCard } from '../../src/types';
let mockBlur: any;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) =>
    require('react').useEffect(() => {
      mockBlur = cb();
      return mockBlur;
    }, [cb]),
}));
let mockReducedMotion = true;
jest.mock('../../src/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));
jest.mock('../../src/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: any, v: any) => require('../../src/i18n/translations').translate('en', key, v),
  }),
}));
jest.mock('../../src/services/tts', () => ({
  speakCard: jest.fn(async () => ({ source: 'generated', loop: false })),
  stop: jest.fn(),
}));
const card: FlashCard = {
  id: 'c1',
  front: 'hola',
  back: 'hello',
  createdAt: 1,
  due: 1,
  reps: 0,
  interval: 0,
  ease: 2.5,
};
beforeEach(async () => {
  jest.clearAllMocks();
  mockReducedMotion = true;
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());
test('default reveal is silent; opt-in plays once per explicit reveal without grading', async () => {
  const onGrade = jest.fn(),
    ui = render(<Flashcard card={card} onGrade={onGrade} />);
  expect(ui.queryByRole('button', { name: 'Stop audio' })).toBeNull();
  expect(speakCard).not.toHaveBeenCalled();
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
  await act(async () => {});
  expect(speakCard).not.toHaveBeenCalled();
  await prefs.setPrefs({ autoSpeak: true });
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hello/ }));
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
  await waitFor(() => expect(speakCard).toHaveBeenCalledTimes(1));
  ui.rerender(<Flashcard card={{ ...card, favorite: true }} onGrade={onGrade} />);
  expect(speakCard).toHaveBeenCalledTimes(1);
  expect(onGrade).not.toHaveBeenCalled();
});

test('exposes Stop only for a pronunciation request and hides it when playback finishes', async () => {
  const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: 'Listen: hola' }));
  expect(ui.getByRole('button', { name: 'Stop audio' })).toBeTruthy();
  const playback = (speakCard as jest.Mock).mock.calls[0][1];
  await act(async () => playback.onPlaybackEnd());
  expect(ui.queryByRole('button', { name: 'Stop audio' })).toBeNull();
});
test.each(['stop', 'flip', 'blur', 'unmount'])(
  '%s cancels an unresolved opt-in read',
  async (action) => {
    let release!: (v: any) => void;
    jest.spyOn(prefs, 'getPrefs').mockImplementationOnce(
      () =>
        new Promise((r) => {
          release = r;
        }),
    );
    const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
    fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
    if (action === 'stop') fireEvent.press(ui.getByRole('button', { name: 'Stop audio' }));
    if (action === 'flip') fireEvent.press(ui.getByRole('button', { name: /Flip card: hello/ }));
    if (action === 'blur') act(() => mockBlur());
    if (action === 'unmount') ui.unmount();
    await act(async () => release({ autoSpeak: true }));
    expect(speakCard).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  },
);
test('background cancels pending speech and foreground does not replay a revealed card', async () => {
  let change!: (s: any) => void, release!: (v: any) => void;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, cb: any) => {
    change = cb;
    return { remove: jest.fn() };
  });
  jest.spyOn(prefs, 'getPrefs').mockImplementationOnce(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
  act(() => change('background'));
  await act(async () => release({ autoSpeak: true }));
  act(() => change('active'));
  expect(speakCard).not.toHaveBeenCalled();
});

test('Stop during an animated reveal prevents speech when that animation completes', async () => {
  mockReducedMotion = false;
  let finish!: (v: any) => void;
  jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (cb: any) => {
      finish = cb;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
  await prefs.setPrefs({ autoSpeak: true });
  const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
  fireEvent.press(ui.getByRole('button', { name: 'Stop audio' }));
  await act(async () => finish({ finished: true }));
  expect(ui.getByText('hello')).toBeTruthy();
  expect(speakCard).not.toHaveBeenCalled();
});

test('settles a reveal once when Reduce Motion interrupts the flip', async () => {
  mockReducedMotion = false;
  let finish!: (result: { finished: boolean }) => void;
  jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (callback: typeof finish) => {
      finish = callback;
    },
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
  await prefs.setPrefs({ autoSpeak: true });
  const onReveal = jest.fn();
  const onGrade = jest.fn();
  const ui = render(<Flashcard card={card} onGrade={onGrade} onReveal={onReveal} />);
  fireEvent.press(ui.getByTestId('study-reveal'));
  expect(onReveal).not.toHaveBeenCalled();

  mockReducedMotion = true;
  ui.rerender(<Flashcard card={card} onGrade={onGrade} onReveal={onReveal} />);
  expect(ui.getByText('hello')).toBeTruthy();
  expect(ui.queryByRole('button', { name: 'Stop audio' })).toBeNull();
  await act(async () => finish({ finished: true }));
  expect(onReveal).toHaveBeenCalledTimes(1);
  expect(speakCard).not.toHaveBeenCalled();
});
test('flipping back cancels a pending preference read before its animation completes', async () => {
  let release!: (v: any) => void;
  jest.spyOn(prefs, 'getPrefs').mockImplementationOnce(
    () =>
      new Promise((r) => {
        release = r;
      }),
  );
  const ui = render(<Flashcard card={card} onGrade={jest.fn()} />);
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hola/ }));
  mockReducedMotion = false;
  ui.rerender(<Flashcard card={card} onGrade={jest.fn()} />);
  jest
    .spyOn(Animated, 'timing')
    .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() } as any);
  fireEvent.press(ui.getByRole('button', { name: /Flip card: hello/ }));
  await act(async () => release({ autoSpeak: true }));
  expect(speakCard).not.toHaveBeenCalled();
});
