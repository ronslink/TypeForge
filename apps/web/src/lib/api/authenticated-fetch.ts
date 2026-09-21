import {
  isReviewedAuthenticatedApiTarget,
  resolvesAgainstCurrentBrowserOrigin,
} from './authenticated-api-target';

export type AuthenticatedTokenProvider = () => Promise<string | null | undefined>;

export interface AuthenticatedFetchOptions {
  /** Resolves the current provider token. Called once per request. */
  getToken: AuthenticatedTokenProvider;
  /** Bounded request timeout in milliseconds. Defaults to 15s. */
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
  setTimeout?: typeof globalThis.setTimeout;
  clearTimeout?: typeof globalThis.clearTimeout;
}

const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 60_000;
export const DEFAULT_AUTHENTICATED_TIMEOUT_MS = 15_000;

const REFUSED_BODY = Object.freeze({
  error: 'This authenticated request could not be sent safely.',
  code: 'INVALID_REQUEST',
});

function boundedTimeout(timeoutMs: number | undefined): number {
  if (timeoutMs === undefined) return DEFAULT_AUTHENTICATED_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS) {
    throw new Error(`timeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}.`);
  }
  return timeoutMs;
}

/**
 * Builds the authenticated fetch handed to `createApiClient`. It keeps the
 * standard `typeof fetch` contract so typed RPC call sites are unchanged, and
 * adds the controls every page previously re-implemented by hand:
 *
 * - the bearer token is attached only for an exactly reviewed target that
 *   resolves to the current origin, so a token can never follow a cross-origin
 *   document base;
 * - dispatch is pinned to same-origin, no-redirect, with a bounded timeout.
 *
 * A refused target produces a synthetic 403 rather than dispatching, so the
 * caller sees an ordinary HTTP failure and no request leaves the browser.
 */
export function createAuthenticatedFetch(
  options: AuthenticatedFetchOptions
): typeof globalThis.fetch {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const setTimer = options.setTimeout ?? globalThis.setTimeout;
  const clearTimer = options.clearTimeout ?? globalThis.clearTimeout;
  const timeoutMs = boundedTimeout(options.timeoutMs);

  const authenticatedFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const token = await options.getToken();

    // Without a credential there is nothing to protect: dispatch unchanged so
    // anonymous and signed-out reads keep behaving as they do today.
    if (!token) return fetchImpl(input, init);

    if (!isReviewedAuthenticatedApiTarget(input) || !resolvesAgainstCurrentBrowserOrigin(input)) {
      return new Response(JSON.stringify(REFUSED_BODY), {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-store',
        },
      });
    }

    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);

    const controller = new AbortController();
    const callerSignal = init?.signal ?? null;
    const abortFromCaller = () => controller.abort(callerSignal?.reason);

    if (callerSignal?.aborted) abortFromCaller();
    else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });

    const timer = setTimer(
      () => controller.abort(new DOMException('Request timed out', 'AbortError')),
      timeoutMs
    );

    try {
      return await fetchImpl(input, {
        ...init,
        headers,
        credentials: 'same-origin',
        mode: 'same-origin',
        redirect: 'error',
        signal: controller.signal,
      });
    } finally {
      clearTimer(timer);
      callerSignal?.removeEventListener('abort', abortFromCaller);
    }
  };

  return authenticatedFetch as typeof globalThis.fetch;
}
