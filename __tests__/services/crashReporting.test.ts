const mockInit = jest.fn();
const mockCapture = jest.fn();
jest.mock('@sentry/react-native', () => ({ init: mockInit, captureException: mockCapture }));

const originalDSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const originalDev = __DEV__;
function load(dsn: string | undefined, dev = false) {
  if (dsn === undefined) delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  else process.env.EXPO_PUBLIC_SENTRY_DSN = dsn;
  (global as any).__DEV__ = dev;
  let service!: typeof import('../../src/services/crashReporting');
  jest.isolateModules(() => {
    service = require('../../src/services/crashReporting');
  });
  return service;
}
beforeEach(() => jest.clearAllMocks());
afterEach(() => {
  if (originalDSN === undefined) delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  else process.env.EXPO_PUBLIC_SENTRY_DSN = originalDSN;
  (global as any).__DEV__ = originalDev;
});

it.each([
  [undefined, false],
  ['https://public@example.invalid/1', true],
] as const)('does not initialize or capture with DSN %s / dev %s', (dsn, dev) => {
  const service = load(dsn, dev);
  service.initCrashReporting();
  service.reportError(new Error('private text'), { content: 'private' });
  expect(mockInit).not.toHaveBeenCalled();
  expect(mockCapture).not.toHaveBeenCalled();
});

it('disables automatic tracing/session/native capture and strips diagnostic payload content', () => {
  const service = load('https://public@example.invalid/1');
  service.initCrashReporting();
  const config = mockInit.mock.calls[0][0];
  expect(config).toMatchObject({
    sendDefaultPii: false,
    enableAutoPerformanceTracing: false,
    enableStallTracking: false,
    enableUserInteractionTracing: false,
    tracePropagationTargets: [],
    enableAutoSessionTracking: false,
    enableNative: false,
  });
  expect(config.tracesSampleRate).toBeUndefined();
  expect(config.tracesSampler).toBeUndefined();
  expect(config.beforeSend).toEqual(expect.any(Function));
  const output = config.beforeSend({
    event_id: 'a'.repeat(32),
    timestamp: 1000,
    release: '1.0.0',
    dist: '1',
    user: { email: 'private@example.com' },
    request: { url: 'https://example.com/?token=private' },
    message: 'private',
    extra: { componentStack: 'private' },
    contexts: { device: { name: 'private' } },
    breadcrumbs: [{ message: 'private' }],
    tags: { text: 'private' },
    exception: {
      values: [
        {
          type: 'TypeError',
          value: 'private',
          stacktrace: {
            frames: [
              {
                filename: '/Users/private/app.js',
                function: 'private',
                lineno: 12,
                colno: 4,
                vars: { phrase: 'private' },
                pre_context: ['private'],
                context_line: 'private',
              },
            ],
          },
        },
      ],
    },
  });
  expect(JSON.stringify(output)).not.toContain('private');
  expect(output.exception.values[0]).toMatchObject({
    type: 'TypeError',
    value: 'Application error',
    stacktrace: { frames: [{ filename: 'app.bundle', lineno: 12, colno: 4 }] },
  });
  expect(output.event_id).toBe('a'.repeat(32));
  expect(output.release).toBe('1.0.0');
});

it('does not attach caller-provided extras to exceptions', () => {
  const service = load('https://public@example.invalid/1');
  const error = new Error('private');
  service.reportError(error, { phrase: 'private' });
  expect(mockCapture).toHaveBeenCalledWith(error);
});

it('selects no tracing integrations in the installed SDK, unlike numeric zero sampling', () => {
  jest.useFakeTimers();
  try {
    const { getDefaultIntegrations } = jest.requireActual(
      '@sentry/react-native/dist/js/integrations/default',
    );
    const service = load('https://public@example.invalid/1');
    service.initCrashReporting();
    const config = mockInit.mock.calls[0][0];
    const names = (options: any) =>
      getDefaultIntegrations(options).map((integration: any) => integration.name);
    const selected = names(config);
    expect(
      selected.some((name: string) =>
        /Tracing|Stall|TimeToDisplay|AppStart|NativeFrames|Interaction/.test(name),
      ),
    ).toBe(false);
    // Positive control pins the installed SDK behavior that caused the regression.
    expect(names({ ...config, tracesSampleRate: 0, enableAutoPerformanceTracing: true })).toContain(
      'ReactNativeTracing',
    );
  } finally {
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});
