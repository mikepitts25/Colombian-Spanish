import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AudioButton from '../../src/components/AudioButton';

// The tts.speak function is called by AudioButton. We spy on the module.
jest.mock('../../src/services/tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

import { speak } from '../../src/services/tts';
const mockSpeak = speak as jest.Mock;

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
});
