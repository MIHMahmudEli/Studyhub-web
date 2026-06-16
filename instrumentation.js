import * as Sentry from '@sentry/nextjs';

// Server / edge Sentry init. No-ops when SENTRY_DSN is unset, so this is safe to
// ship without a configured Sentry project — set the env var to turn it on.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
