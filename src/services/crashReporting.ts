import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initCrashReporting() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enabled: !__DEV__,
  });
}

export function reportError(error: Error, extra?: Record<string, unknown>) {
  if (!dsn) return;
  Sentry.captureException(error, extra ? { extra } : undefined);
}
