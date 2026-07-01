import { createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { speak, speakCard, stop } from '../../src/services/tts';

jest.mock('../../src/data/audioManifest', () => ({
  pronunciationAudio: {
    '0009': 1009,
    '0010': 1010,
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

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
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
    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValue(player);
    await speakCard({ id: '0009', front: 'hola' });
    jest.clearAllMocks();

    await speakCard({ id: 'missing-card', front: 'parcero' });

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(player.pause.mock.invocationCallOrder[0]).toBeLessThan(
      mockSpeak.mock.invocationCallOrder[0],
    );
    expect(player.remove.mock.invocationCallOrder[0]).toBeLessThan(
      mockSpeak.mock.invocationCallOrder[0],
    );
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

  it('falls back to Expo Speech when bundled player creation throws after a player is active', async () => {
    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValueOnce(player);
    await speakCard({ id: '0009', front: 'hola' });

    mockCreateAudioPlayer.mockImplementationOnce(() => {
      throw new Error('create failed');
    });

    await speakCard({ id: '0010', front: 'adios' });

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(
      'adios',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('stops queued speech before bundled playback starts', async () => {
    speak('old speech');
    jest.clearAllMocks();

    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValue(player);

    await speakCard({ id: '0009', front: 'hola' });

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockStop.mock.invocationCallOrder[0]).toBeLessThan(
      player.play.mock.invocationCallOrder[0],
    );
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('does not let a stale async speakCard call play or clean up the newer player', async () => {
    const firstSeek = deferred<void>();
    const firstPlayer = makePlayer({
      seekTo: jest.fn(() => firstSeek.promise),
    });
    const secondPlayer = makePlayer();
    mockCreateAudioPlayer
      .mockReturnValueOnce(firstPlayer)
      .mockReturnValueOnce(secondPlayer);

    const firstCall = speakCard({ id: '0009', front: 'hola' });
    await Promise.resolve();
    const secondCall = speakCard({ id: '0010', front: 'adios' });
    await secondCall;
    firstSeek.resolve();
    await firstCall;

    expect(firstPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(secondPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(firstPlayer.play).not.toHaveBeenCalled();
    expect(firstPlayer.remove).toHaveBeenCalledTimes(1);
    expect(secondPlayer.play).toHaveBeenCalledTimes(1);
    expect(secondPlayer.pause).not.toHaveBeenCalled();
    expect(secondPlayer.remove).not.toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('does not resume speech after stop while seekTo is still pending', async () => {
    const seek = deferred<void>();
    const player = makePlayer({
      seekTo: jest.fn(() => seek.promise),
    });
    mockCreateAudioPlayer.mockReturnValue(player);

    const pending = speakCard({ id: '0009', front: 'hola' });
    await Promise.resolve();

    stop();
    seek.reject(new Error('seek failed'));
    await pending;

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
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
    jest.clearAllMocks();

    stop();

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalledTimes(1);
  });
});
