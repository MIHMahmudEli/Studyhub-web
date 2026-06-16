import * as Sentry from '@sentry/nextjs';

// Browser Sentry init. No-ops when NEXT_PUBLIC_SENTRY_DSN is unset.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
