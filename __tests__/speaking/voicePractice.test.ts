import { VoicePractice, VoicePorts } from '../../src/speaking/voicePractice';
function fixture() {
  const ports: VoicePorts = {
    permission: jest.fn(async () => ({ granted: true, canAskAgain: true })),
    prepare: jest.fn(async () => {}),
    begin: jest.fn(),
    stopCapture: jest.fn(async () => {}),
    clip: jest.fn(async () => ({ bytes: 1024, durationMs: 1000 })),
    discard: jest.fn(async () => {}),
    play: jest.fn(async () => {}),
    stopPlayback: jest.fn(),
    restoreMode: jest.fn(async () => {}),
  };
  const voice = new VoicePractice(ports);
  return { ports, voice };
}
function deferred<T>() {
  let resolve!: (v: T) => void;
  return {
    promise: new Promise<T>((r) => {
      resolve = r;
    }),
    resolve: (v: T) => resolve(v),
  };
}
afterEach(() => jest.useRealTimers());
test('permission is explicit; denied capture leaves an idle alternative', async () => {
  const { ports, voice } = fixture();
  expect(ports.permission).not.toHaveBeenCalled();
  (ports.permission as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: false });
  await voice.start();
  expect(voice.state).toMatchObject({ phase: 'denied', canAskAgain: false });
  expect(ports.begin).not.toHaveBeenCalled();
});
test('records, stops, replays and deletes without silent overwrite', async () => {
  const { ports, voice } = fixture();
  await voice.start();
  expect(voice.state.phase).toBe('recording');
  await voice.stop();
  expect(voice.state).toMatchObject({ phase: 'ready', hasTake: true, clip: { bytes: 1024 } });
  await voice.start();
  expect(ports.begin).toHaveBeenCalledTimes(1);
  await voice.play();
  expect(voice.state.phase).toBe('playing');
  await voice.stop();
  expect(voice.state.phase).toBe('ready');
  await voice.discard();
  expect(voice.state).toMatchObject({ phase: 'idle', hasTake: false });
  expect(ports.discard).toHaveBeenCalled();
});
test.each(['permission', 'prepare'] as const)(
  'Stop cancels late %s completion before capture starts',
  async (step) => {
    const { ports, voice } = fixture(),
      wait = deferred<any>();
    (ports[step] as jest.Mock).mockReturnValue(wait.promise);
    const start = voice.start();
    await Promise.resolve();
    const stop = voice.stop();
    wait.resolve(step === 'permission' ? { granted: true, canAskAgain: true } : undefined);
    await Promise.all([start, stop]);
    expect(ports.begin).not.toHaveBeenCalled();
    expect(voice.state.phase).toBe('idle');
  },
);
test('native/JS duration bound stops a take, and background discards active capture', async () => {
  jest.useFakeTimers();
  const { ports, voice } = fixture();
  await voice.start();
  expect(ports.begin).toHaveBeenCalledWith(30);
  await jest.advanceTimersByTimeAsync(30000);
  expect(voice.state.phase).toBe('ready');
  await voice.discard();
  await voice.start();
  await voice.suspend();
  expect(voice.state).toMatchObject({ phase: 'idle', hasTake: false });
});
test('deletion failure retains the take and permits explicit retry without another capture', async () => {
  const { ports, voice } = fixture();
  await voice.start();
  await voice.stop();
  (ports.discard as jest.Mock).mockRejectedValueOnce(new Error('disk'));
  await voice.discard();
  expect(voice.state).toMatchObject({ phase: 'error', hasTake: true });
  await voice.start();
  expect(ports.begin).toHaveBeenCalledTimes(1);
  await voice.discard();
  expect(voice.state).toMatchObject({ phase: 'idle', hasTake: false });
});
test('missing or oversized clips are unavailable and preserve cleanup identity', async () => {
  const { ports, voice } = fixture();
  (ports.clip as jest.Mock).mockResolvedValue({ bytes: 3 * 1024 * 1024, durationMs: 1000 });
  await voice.start();
  await voice.stop();
  expect(voice.state).toMatchObject({ phase: 'error', hasTake: true });
  expect(ports.play).not.toHaveBeenCalled();
  await voice.discard();
});
test('close cancels a late prepare, stops/discards owned resources and never emits later changes', async () => {
  const { ports, voice } = fixture(),
    wait = deferred<void>(),
    changes = jest.fn();
  voice.subscribe(changes);
  (ports.prepare as jest.Mock).mockReturnValue(wait.promise);
  const start = voice.start();
  await Promise.resolve();
  const close = voice.close();
  const count = changes.mock.calls.length;
  wait.resolve(undefined);
  await Promise.all([start, close]);
  expect(ports.begin).not.toHaveBeenCalled();
  expect(ports.discard).toHaveBeenCalled();
  expect(changes).toHaveBeenCalledTimes(count);
});

test('native playback cleanup failure remains recoverable without an unhandled rejection', async () => {
  const { ports, voice } = fixture();
  await voice.start();
  await voice.stop();
  await voice.play();
  (ports.stopPlayback as jest.Mock).mockImplementationOnce(() => {
    throw new Error('native');
  });
  await expect(voice.stop()).resolves.toBeUndefined();
  expect(voice.state).toMatchObject({ phase: 'error', hasTake: true });
  await voice.discard();
  expect(voice.state.phase).toBe('idle');
});

test.each(['stop', 'suspend'] as const)(
  'retries potentially active capture on %s after native Stop fails',
  async (action) => {
    const { ports, voice } = fixture();
    await voice.start();
    (ports.stopCapture as jest.Mock).mockRejectedValueOnce(new Error('native still recording'));
    await voice.stop();
    expect(voice.state).toMatchObject({ phase: 'error', hasTake: true });
    await voice[action]();
    expect(ports.stopCapture).toHaveBeenCalledTimes(2);
    expect(voice.state.phase).toBe(action === 'stop' ? 'ready' : 'idle');
  },
);
test('failed Stop retains the JS duration safety stop', async () => {
  jest.useFakeTimers();
  const { ports, voice } = fixture();
  await voice.start();
  (ports.stopCapture as jest.Mock).mockRejectedValueOnce(new Error('retry'));
  await voice.stop();
  await jest.advanceTimersByTimeAsync(30000);
  expect(ports.stopCapture).toHaveBeenCalledTimes(2);
  expect(voice.state.phase).toBe('ready');
});
test('permission denial remains clear when its native prompt backgrounds the app', async () => {
  const { ports, voice } = fixture(),
    wait = deferred<any>();
  (ports.permission as jest.Mock).mockReturnValue(wait.promise);
  const start = voice.start(),
    background = voice.suspend();
  wait.resolve({ granted: false, canAskAgain: false });
  await Promise.all([start, background]);
  expect(voice.state).toMatchObject({ phase: 'denied', canAskAgain: false });
  expect(ports.begin).not.toHaveBeenCalled();
});
