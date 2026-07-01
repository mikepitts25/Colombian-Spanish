import { createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { speak, speakCard, stop } from '../../src/services/tts';

jest.mock('../../src/data/audioManifest', () => ({
  pronunciationAudio: {
    '0009': 1009,
  },
}));

const mockCreateAudioPlayer = createAudioPlayer as jest.Mock;
const mockSpeak = Speech.speak as jest.Mock;
const mockStop = Speech.stop as jest.Mock;

function makePlayer(overrides = {}) {
  return {
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    remove: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateAudioPlayer.mockReturnValue(makePlayer());
});

afterEach(() => {
  stop();
  jest.clearAllMocks();
});

describe('speakCard', () => {
  it('plays bundled ElevenLabs audio when the card id exists in the manifest', async () => {
    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValue(player);

    await speakCard({ id: '0009', front: 'hola' });

    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(1009);
    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('falls back to Expo Speech when the card id is missing from the manifest', async () => {
    await speakCard({ id: 'missing-card', front: 'parcero' });

    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledWith(
      'parcero',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('falls back to Expo Speech when bundled audio playback throws', async () => {
    const player = makePlayer({
      play: jest.fn(() => {
        throw new Error('playback failed');
      }),
    });
    mockCreateAudioPlayer.mockReturnValue(player);

    await speakCard({ id: '0009', front: 'hola' });

    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(
      'hola',
      expect.objectContaining({ language: 'es-CO' }),
    );
  });
});

describe('speak', () => {
  it('keeps text-only Expo Speech fallback for components without card ids', () => {
    speak('¿qué más?');

    expect(mockSpeak).toHaveBeenCalledWith(
      '¿qué más?',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('uses a custom language when provided', () => {
    speak('hello', 'en-US');

    expect(mockSpeak).toHaveBeenCalledWith(
      'hello',
      expect.objectContaining({ language: 'en-US' }),
    );
  });
});

describe('stop', () => {
  it('removes the current audio player and stops Expo Speech', async () => {
    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValue(player);
    await speakCard({ id: '0009', front: 'hola' });

    stop();

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalledTimes(1);
  });
});
