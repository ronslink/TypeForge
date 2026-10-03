/**
 * Binds the API's error-reporter seam to Sentry.
 *
 * `@typeforge/api` is deliberately vendor-free and exposes an error-reporter
 * seam instead of importing a monitoring SDK. This module is the single place
 * that connects the two.
 *
 * It is kept out of the route file so it can be exercised in a test without
 * importing a SvelteKit server route and its `$env` virtual modules.
 */
import * as Sentry from '@sentry/sveltekit';
import { setApiErrorReporter } from '@typeforge/api';

export function installApiErrorReporter(): void {
  setApiErrorReporter((error, context) => {
    // No request bodies, headers or user identity: the data-collection policy
    // in hooks.server.ts denies those, and this only adds routing context.
    Sentry.captureException(error, {
      tags: { api_method: context.method },
      extra: { api_path: context.path },
    });
  });
}
