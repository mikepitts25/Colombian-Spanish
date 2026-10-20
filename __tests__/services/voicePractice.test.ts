import { VoicePractice } from '../../src/speaking/voicePractice';
import { createVoicePorts } from '../../src/services/voicePractice';
import {
  createAudioPlayer,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from 'expo-audio';
let mockExists = true,
  mockSize = 1024,
  mockDelete = jest.fn();
jest.mock('expo-file-system', () => ({
  Paths: { cache: { uri: 'file:///cache/' } },
  File: jest.fn().mockImplementation((uri: string) => ({
    uri,
    get exists() {
      return mockExists;
    },
    get size() {
      return mockSize;
    },
    delete: () => mockDelete(),
  })),
}));
jest.mock('../../src/services/tts', () => ({ stop: jest.fn() }));
jest.mock('expo-audio', () => ({
  getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  setAudioModeAsync: jest.fn(async () => {}),
  createAudioPlayer: jest.fn(() => ({
    pause: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(async () => {}),
    play: jest.fn(),
  })),
}));
function recorder(uri = 'file:///cache/Audio/take.m4a') {
  return {
    uri,
    prepareToRecordAsync: jest.fn(async () => {}),
    record: jest.fn(),
    stop: jest.fn(async () => {}),
    isRecording: true,
    getStatus: () => ({ durationMillis: 1200 }),
  } as any;
}
beforeEach(() => {
  jest.clearAllMocks();
  (requestRecordingPermissionsAsync as jest.Mock)
    .mockReset()
    .mockResolvedValue({ granted: true, canAskAgain: true });
  (getRecordingPermissionsAsync as jest.Mock)
    .mockReset()
    .mockResolvedValue({ granted: true, canAskAgain: true });
  mockExists = true;
  mockSize = 1024;
  mockDelete = jest.fn(() => {
    mockExists = false;
  });
});
test('uses explicit permissions, foreground mode and bounded native capture', async () => {
  const rec = recorder(),
    ports = createVoicePorts(rec);
  expect(requestRecordingPermissionsAsync).not.toHaveBeenCalled();
  await ports.permission();
  await ports.prepare();
  ports.begin(30);
  expect(setAudioModeAsync).toHaveBeenCalledWith(
    expect.objectContaining({ allowsRecording: true, shouldPlayInBackground: false }),
  );
  expect(rec.record).toHaveBeenCalledWith({ forDuration: 30 });
  await ports.stopCapture();
  expect(await ports.clip()).toEqual({ bytes: 1024, durationMs: 1200 });
  await ports.play();
  expect(createAudioPlayer).toHaveBeenCalledWith('file:///cache/Audio/take.m4a');
  ports.stopPlayback();
  await ports.discard();
  expect(mockDelete).toHaveBeenCalledTimes(1);
});
test.each([
  'file:///documents/keep.m4a',
  'file:///cache/../documents/keep.m4a',
  'https://example.com/clip',
  'file:///cache/%2e%2e/documents/keep.m4a',
])('refuses non-owned-cache URI %s', async (uri) => {
  const ports = createVoicePorts(recorder(uri));
  await expect(ports.prepare()).rejects.toThrow();
  await ports.discard();
  expect(mockDelete).not.toHaveBeenCalled();
});
test('missing/oversized recordings cannot replay; failed deletion keeps identity for retry', async () => {
  const ports = createVoicePorts(recorder());
  await ports.prepare();
  await ports.stopCapture();
  mockSize = 3 * 1024 * 1024;
  await expect(ports.play()).rejects.toThrow();
  expect(createAudioPlayer).not.toHaveBeenCalled();
  mockSize = 1024;
  mockDelete.mockImplementationOnce(() => {
    throw new Error('denied');
  });
  await expect(ports.discard()).rejects.toThrow();
  await ports.discard();
  expect(mockDelete).toHaveBeenCalledTimes(2);
});
test('a late seek after Stop cannot call native play', async () => {
  let finish!: (v?: unknown) => void;
  const native = {
    pause: jest.fn(),
    remove: jest.fn(),
    play: jest.fn(),
    seekTo: jest.fn(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    ),
  };
  (createAudioPlayer as jest.Mock).mockReturnValueOnce(native);
  const ports = createVoicePorts(recorder());
  await ports.prepare();
  await ports.stopCapture();
  const pending = ports.play();
  await Promise.resolve();
  ports.stopPlayback();
  finish();
  await pending;
  expect(native.play).not.toHaveBeenCalled();
});

test('preserves a native-timed take when Expo resets duration before the JS Stop', async () => {
  jest.useFakeTimers().setSystemTime(1000);
  try {
    const rec = recorder(),
      ports = createVoicePorts(rec);
    await ports.prepare();
    ports.begin(30);
    jest.setSystemTime(31010);
    rec.isRecording = false;
    rec.getStatus = () => ({ durationMillis: 0 });
    await ports.stopCapture();
    expect((await ports.clip()).durationMs).toBe(30000);
  } finally {
    jest.useRealTimers();
  }
});

test('already granted microphone capture does not open Android permission activity and cancel itself', async () => {
  const rec = recorder();
  const voice = new VoicePractice(createVoicePorts(rec));
  // Android permission requests briefly background the Activity even when granted.
  (requestRecordingPermissionsAsync as jest.Mock).mockImplementationOnce(async () => {
    void voice.suspend();
    return { granted: true, canAskAgain: true };
  });
  await voice.start();
  expect(rec.record).toHaveBeenCalledWith({ forDuration: 30 });
  expect(requestRecordingPermissionsAsync).not.toHaveBeenCalled();
  await voice.close();
});
test('ungranted microphone still requests permission only on the explicit recording action', async () => {
  (getRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({
    granted: false,
    canAskAgain: true,
  });
  (requestRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({
    granted: false,
    canAskAgain: false,
  });
  const ports = createVoicePorts(recorder());
  expect(getRecordingPermissionsAsync).not.toHaveBeenCalled();
  expect(requestRecordingPermissionsAsync).not.toHaveBeenCalled();
  await expect(ports.permission()).resolves.toEqual({ granted: false, canAskAgain: false });
  expect(getRecordingPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(requestRecordingPermissionsAsync).toHaveBeenCalledTimes(1);
});
