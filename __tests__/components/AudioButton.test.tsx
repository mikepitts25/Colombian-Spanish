import { StyleSheet } from 'react-native';
import { ThemeProvider, useThemeSelection } from '../../src/context/ThemeContext';
import React from 'react';
import { act, render, fireEvent } from '@testing-library/react-native';
import AudioButton from '../../src/components/AudioButton';

// The tts.speak function is called by AudioButton. We spy on the module.
jest.mock('../../src/services/tts', () => ({
  speak: jest.fn(),
  speakCard: jest.fn(),
  stop: jest.fn(),
}));

import { speak, speakCard } from '../../src/services/tts';
const mockSpeak = speak as jest.Mock;
const mockSpeakCard = speakCard as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AudioButton', () => {
  it('renders without crashing', () => {
    expect(() => render(<AudioButton text="hola" />)).not.toThrow();
  });

  it('renders the listen label', () => {
    const { getByText } = render(<AudioButton text="chimba" />);
    expect(getByText('🔊 Escuchar')).toBeTruthy();
  });

  it('calls speak with the provided text when pressed', () => {
    const { getByText } = render(<AudioButton text="parcero" />);
    fireEvent.press(getByText('🔊 Escuchar'));
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith('parcero');
  });

  it('passes the exact text prop value to speak', () => {
    const text = '¿Qué más, parce?';
    const { getByText } = render(<AudioButton text={text} />);
    fireEvent.press(getByText('🔊 Escuchar'));
    expect(mockSpeak.mock.calls[0][0]).toBe(text);
  });

  it('calls speak each time the button is pressed', () => {
    const { getByText } = render(<AudioButton text="vaina" />);
    fireEvent.press(getByText('🔊 Escuchar'));
    fireEvent.press(getByText('🔊 Escuchar'));
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('calls speakCard when card metadata is provided', () => {
    const card = { id: '0009', front: 'hola' };
    const { getByText } = render(<AudioButton text="hola" card={card} />);

    fireEvent.press(getByText('🔊 Escuchar'));

    expect(mockSpeakCard).toHaveBeenCalledWith(card);
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});

it('Barrio audio feedback uses its pressed surface without changing the spoken text', () => {
  let current!: ReturnType<typeof useThemeSelection>;
  function Probe() {
    const next = useThemeSelection();
    React.useLayoutEffect(() => {
      current = next;
    }, [next]);
    return <AudioButton text="hola" />;
  }
  const ui = render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
  act(() => current.applySelection({ themeId: 'barrio', appearanceMode: 'light' }));
  let button = ui.getByText('🔊 Escuchar').parent!;
  while (button.parent && typeof button.props.style !== 'function') button = button.parent;
  const pressedStyle =
    typeof button.props.style === 'function'
      ? button.props.style({ pressed: true })
      : button.props.style;
  expect(StyleSheet.flatten(pressedStyle)).toMatchObject({ backgroundColor: '#E4E9DD' });
  fireEvent.press(ui.getByRole('button', { name: 'Escuchar' }));
  expect(mockSpeak).toHaveBeenCalledWith('hola');
});
