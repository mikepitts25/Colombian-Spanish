import * as Speech from 'expo-speech';
import { speak, stop } from '../../src/services/tts';

const mockSpeak = Speech.speak as jest.Mock;
const mockStop = Speech.stop as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('speak', () => {
  it('calls Speech.speak with the provided text', () => {
    speak('hola');
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith('hola', expect.any(Object));
  });

  it('uses Colombian Spanish locale (es-CO) by default', () => {
    speak('chimba');
    const opts = mockSpeak.mock.calls[0][1];
    expect(opts.language).toBe('es-CO');
  });

  it('uses the correct pitch and rate defaults', () => {
    speak('parcero');
    const opts = mockSpeak.mock.calls[0][1];
    expect(opts.pitch).toBe(1.05);
    expect(opts.rate).toBe(0.98);
  });

  it('uses a custom language when provided', () => {
    speak('hello', 'en-US');
    const opts = mockSpeak.mock.calls[0][1];
    expect(opts.language).toBe('en-US');
  });

  it('can be called multiple times consecutively without throwing', () => {
    expect(() => {
      speak('bacano');
      speak('vaina');
      speak('chevere');
    }).not.toThrow();
    expect(mockSpeak).toHaveBeenCalledTimes(3);
  });

  it('passes the exact text string to Speech.speak', () => {
    const text = '¿Cómo estás, parcero?';
    speak(text);
    expect(mockSpeak.mock.calls[0][0]).toBe(text);
  });
});

describe('stop', () => {
  it('calls Speech.stop()', () => {
    stop();
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  it('does not throw when called multiple times', () => {
    expect(() => {
      stop();
      stop();
    }).not.toThrow();
  });
});
