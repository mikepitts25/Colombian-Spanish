import { waitFor } from '@testing-library/react-native';
import { createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { getPrefs } from '../../src/storage/prefs';
jest.mock('../../src/storage/prefs', () => ({
  getPrefs: jest.fn(async () => ({ speechRate: 0.98 })),
}));
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
    setPlaybackRate: jest.fn(),
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
    expect(mockSpeak).toHaveBeenCalledWith('hola', expect.objectContaining({ language: 'es-CO' }));
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
    await speak('old speech');
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

  it('interrupts bundled playback before direct text speech starts', async () => {
    const player = makePlayer();
    mockCreateAudioPlayer.mockReturnValue(player);

    await speakCard({ id: '0009', front: 'hola' });
    jest.clearAllMocks();

    await speak('text fallback');

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(player.pause.mock.invocationCallOrder[0]).toBeLessThan(
      mockSpeak.mock.invocationCallOrder[0],
    );
    expect(player.remove.mock.invocationCallOrder[0]).toBeLessThan(
      mockSpeak.mock.invocationCallOrder[0],
    );
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(
      'text fallback',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('does not let a stale async speakCard call play or clean up the newer player', async () => {
    const firstSeek = deferred<void>();
    const firstPlayer = makePlayer({
      seekTo: jest.fn(() => firstSeek.promise),
    });
    const secondPlayer = makePlayer();
    mockCreateAudioPlayer.mockReturnValueOnce(firstPlayer).mockReturnValueOnce(secondPlayer);

    const firstCall = speakCard({ id: '0009', front: 'hola' });
    await waitFor(() => expect(firstPlayer.seekTo).toHaveBeenCalledWith(0));
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

  it('prevents a pending bundled speakCard from playing after direct text speech starts', async () => {
    const seek = deferred<void>();
    const player = makePlayer({
      seekTo: jest.fn(() => seek.promise),
    });
    mockCreateAudioPlayer.mockReturnValue(player);

    const pending = speakCard({ id: '0009', front: 'hola' });
    await waitFor(() => expect(player.seekTo).toHaveBeenCalledWith(0));

    await speak('manual fallback');
    seek.resolve();
    await pending;

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(player.play).not.toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledWith(
      'manual fallback',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('does not resume speech after stop while seekTo is still pending', async () => {
    const seek = deferred<void>();
    const player = makePlayer({
      seekTo: jest.fn(() => seek.promise),
    });
    mockCreateAudioPlayer.mockReturnValue(player);

    const pending = speakCard({ id: '0009', front: 'hola' });
    await waitFor(() => expect(player.seekTo).toHaveBeenCalledWith(0));

    stop();
    seek.reject(new Error('seek failed'));
    await pending;

    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.remove).toHaveBeenCalledTimes(1);
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});

describe('speak', () => {
  it('keeps text-only Expo Speech fallback for components without card ids', async () => {
    await speak('¿qué más?');

    expect(mockSpeak).toHaveBeenCalledWith(
      '¿qué más?',
      expect.objectContaining({ language: 'es-CO', pitch: 1.05, rate: 0.98 }),
    );
  });

  it('uses a custom language when provided', async () => {
    await speak('hello', 'en-US');

    expect(mockSpeak).toHaveBeenCalledWith('hello', expect.objectContaining({ language: 'en-US' }));
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

describe('saved playback preferences', () => {
  it('applies saved speed, pitch correction and explicit clip looping', async () => {
    (getPrefs as jest.Mock).mockResolvedValueOnce({ speechRate: 0.75 });
    const player = makePlayer({ setPlaybackRate: jest.fn() });
    mockCreateAudioPlayer.mockReturnValue(player);
    const result = await speakCard({ id: '0009', front: 'hola' }, { loop: true });
    expect(player.setPlaybackRate).toHaveBeenCalledWith(0.75, 'high');
    expect(player).toMatchObject({ loop: true, shouldCorrectPitch: true });
    expect(result).toMatchObject({ source: 'generated', loop: true });
  });
  it('uses saved speed for device fallback and honestly reports one-shot playback', async () => {
    (getPrefs as jest.Mock).mockResolvedValueOnce({ speechRate: 1.25 });
    expect(await speakCard({ id: 'missing', front: 'hola' }, { loop: true })).toEqual({
      source: 'device',
      loop: false,
    });
    expect(mockSpeak).toHaveBeenCalledWith('hola', expect.objectContaining({ rate: 1.25 }));
  });
  it('does not revive playback after stop while preferences are loading', async () => {
    const wait = deferred<any>();
    (getPrefs as jest.Mock).mockReturnValueOnce(wait.promise);
    const call = speakCard({ id: '0009', front: 'hola' });
    stop();
    wait.resolve({ speechRate: 0.75 });
    expect(await call).toEqual({ source: 'cancelled', loop: false });
    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    expect(mockSpeak).not.toHaveBeenCalled();
  });
  it('preserves defaults on failed reads without writing preferences', async () => {
    (getPrefs as jest.Mock).mockRejectedValueOnce(new Error('read failed'));
    await speakCard({ id: 'missing', front: 'hola' });
    expect(mockSpeak).toHaveBeenCalledWith('hola', expect.objectContaining({ rate: 0.98 }));
  });
});

describe('preference read concurrency', () => {
  it('honors saved text-speech speed and cancels text speech still waiting on preferences', async () => {
    (getPrefs as jest.Mock).mockResolvedValueOnce({ speechRate: 1.25 });
    await speak('hola');
    expect(mockSpeak).toHaveBeenLastCalledWith('hola', expect.objectContaining({ rate: 1.25 }));
    const wait = deferred<any>();
    (getPrefs as jest.Mock).mockReturnValueOnce(wait.promise);
    const call = speak('old text');
    stop();
    wait.resolve({ speechRate: 0.75 });
    expect((await call).source).toBe('cancelled');
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });
  it('newer requests win while older preferences are delayed and snapshot caller input', async () => {
    const wait = deferred<any>();
    (getPrefs as jest.Mock).mockReturnValueOnce(wait.promise);
    const card = { id: '0009', front: 'hola' };
    const older = speakCard(card);
    card.id = 'missing';
    card.front = 'changed';
    await speakCard({ id: '0010', front: 'buenos días' }, { rate: 1 });
    wait.resolve({ speechRate: 0.75 });
    expect((await older).source).toBe('cancelled');
    expect(mockCreateAudioPlayer).toHaveBeenCalledTimes(1);
    expect(mockCreateAudioPlayer).toHaveBeenCalledWith(1010);
    expect(mockSpeak).not.toHaveBeenCalled();
  });
  it('rejects invalid playback controls before interrupting current playback', async () => {
    await speakCard({ id: '0009', front: 'hola' });
    jest.clearAllMocks();
    for (const options of [{ rate: NaN }, { rate: 0 }, { rate: 2 }, { loop: 'yes' }])
      await expect(speakCard({ id: '0009', front: 'hola' }, options as any)).rejects.toThrow(
        'Invalid',
      );
    expect(mockStop).not.toHaveBeenCalled();
    expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
  });
});

describe('assessed bundled playback', () => {
  it('rejects missing clips without speaking the hidden transcript', async () => {
    await expect(
      speakCard({ id: 'missing', front: 'hidden' }, { requireBundled: true }),
    ).rejects.toThrow('bundled');
    expect(mockSpeak).not.toHaveBeenCalled();
  });
  it('does not substitute device speech after a bundled player failure', async () => {
    mockCreateAudioPlayer.mockImplementationOnce(() => {
      throw new Error('player failed');
    });
    await expect(
      speakCard({ id: '0009', front: 'hidden' }, { requireBundled: true }),
    ).rejects.toThrow('bundled');
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
