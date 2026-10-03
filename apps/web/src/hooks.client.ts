/**
 * Client-side Sentry initialisation.
 *
 * With no `PUBLIC_SENTRY_DSN` the SDK is disabled, so development and CI send
 * nothing.
 */
import * as Sentry from '@sentry/sveltekit';
import { env as publicEnv } from '$env/dynamic/public';

const dsn = publicEnv.PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: publicEnv.PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
  // Mirrors the server config in hooks.server.ts. The browser is where learner
  // keystrokes and auth cookies live, so headers, bodies, cookies and URL query
  // parameters are all denied; no session replay or feedback widget is enabled
  // either, since those would record typing input.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
  },
});

export const handleError = Sentry.handleErrorWithSentry();
