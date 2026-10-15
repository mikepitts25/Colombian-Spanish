import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ERROR_TYPES = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
]);

/** Allow only build metadata and numeric stack positions, never app/user content. */
export function sanitizeCrashEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  return {
    type: undefined,
    event_id: /^[a-f0-9]{32}$/i.test(event.event_id ?? '') ? event.event_id : undefined,
    timestamp: event.timestamp,
    platform: 'javascript',
    level: 'error',
    release: event.release,
    dist: event.dist,
    environment: 'production',
    exception: {
      values: (event.exception?.values ?? [{}]).slice(0, 5).map((exception) => ({
        type: ERROR_TYPES.has(exception.type ?? '') ? exception.type : 'Error',
        value: 'Application error',
        stacktrace: exception.stacktrace
          ? {
              frames: exception.stacktrace.frames?.slice(-50).map((frame) => ({
                filename: 'app.bundle',
                lineno:
                  Number.isInteger(frame.lineno) && (frame.lineno ?? -1) >= 0
                    ? frame.lineno
                    : undefined,
                colno:
                  Number.isInteger(frame.colno) && (frame.colno ?? -1) >= 0
                    ? frame.colno
                    : undefined,
              })),
            }
          : undefined,
      })),
    },
  };
}

export function initCrashReporting() {
  if (!dsn || __DEV__) return;
  Sentry.init({
    dsn,
    enabled: true,
    sendDefaultPii: false,
    enableAutoPerformanceTracing: false,
    enableStallTracking: false,
    enableUserInteractionTracing: false,
    tracePropagationTargets: [],
    sendClientReports: false,
    enableLogs: false,
    enableAutoSessionTracking: false,
    // Keep all captured errors on the JS path protected by beforeSend.
    // Native diagnostics require a separate payload audit before being enabled.
    enableNative: false,
    beforeSend: sanitizeCrashEvent,
  });
}

export function reportError(error: Error, _extra?: Record<string, unknown>) {
  if (!dsn || __DEV__) return;
  Sentry.captureException(error);
}
