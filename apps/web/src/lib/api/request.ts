import {
  invalidResponseFailure,
  normalizeRequestId,
  readApiFailure,
  readTransportFailure,
  type ApiFailure,
} from './failure';
import { classifyRetry, type RetryDecision } from './recovery';
import {
  invalidAuthenticatedApiTargetFailure,
  isCanonicalAuthenticatedApiTarget,
  resolvesAgainstCurrentBrowserOrigin,
} from './authenticated-api-target';

export interface ApiRequestSuccess<T> {
  ok: true;
  data: T;
  status: number;
  requestId: string | null;
}

export interface ApiRequestFailure {
  ok: false;
  failure: ApiFailure;
  retry: RetryDecision;
}

export type ApiRequestResult<T> = ApiRequestSuccess<T> | ApiRequestFailure;

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export interface ApiRequestDependencies {
  fetch?: typeof globalThis.fetch;
  setTimeout?: typeof globalThis.setTimeout;
  clearTimeout?: typeof globalThis.clearTimeout;
}

const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 60_000;

function boundedTimeout(timeoutMs: number | undefined): number {
  if (timeoutMs === undefined) return 15_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS) {
    throw new Error(`timeoutMs must be between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS}.`);
  }
  return timeoutMs;
}

/**
 * Central JSON request boundary. It normalizes transport, HTTP and malformed
 * response failures but deliberately does not retry. A page may offer the
 * returned recovery action only after consulting the included retry decision.
 */
export async function requestApiJson<T>(
  input: string,
  options: ApiRequestOptions = {},
  dependencies: ApiRequestDependencies = {}
): Promise<ApiRequestResult<T>> {
  const fetchImpl = dependencies.fetch ?? globalThis.fetch;
  const setTimer = dependencies.setTimeout ?? globalThis.setTimeout;
  const clearTimer = dependencies.clearTimeout ?? globalThis.clearTimeout;
  const timeoutMs = boundedTimeout(options.timeoutMs);
  const controller = new AbortController();
  const { timeoutMs: _timeoutMs, signal: callerSignal, ...requestInit } = options;
  let dispatchInit: RequestInit = requestInit;
  try {
    if (typeof input !== 'string') {
      const failure = invalidAuthenticatedApiTargetFailure();
      return { ok: false, failure, retry: classifyRetry(failure, requestInit) };
    }
    const headers = new Headers(requestInit.headers);
    if (headers.has('Authorization')) {
      if (
        !isCanonicalAuthenticatedApiTarget(input) ||
        !resolvesAgainstCurrentBrowserOrigin(input)
      ) {
        const failure = invalidAuthenticatedApiTargetFailure();
        return { ok: false, failure, retry: classifyRetry(failure, requestInit) };
      }
      dispatchInit = {
        ...requestInit,
        headers,
        credentials: 'same-origin',
        mode: 'same-origin',
        redirect: 'error',
      };
    }
  } catch {
    const failure = invalidAuthenticatedApiTargetFailure();
    return { ok: false, failure, retry: classifyRetry(failure, requestInit) };
  }
  const abortFromCaller = () => controller.abort(callerSignal?.reason);

  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });

  const timer = setTimer(
    () => controller.abort(new DOMException('Request timed out', 'AbortError')),
    timeoutMs
  );

  try {
    const response = await fetchImpl(input, { ...dispatchInit, signal: controller.signal });
    if (!response.ok) {
      const failure = await readApiFailure(response);
      return { ok: false, failure, retry: classifyRetry(failure, dispatchInit) };
    }

    try {
      const data = (await response.json()) as T;
      return {
        ok: true,
        data,
        status: response.status,
        requestId: normalizeRequestId(response.headers.get('x-request-id')),
      };
    } catch {
      const failure = invalidResponseFailure(response);
      return { ok: false, failure, retry: classifyRetry(failure, dispatchInit) };
    }
  } catch (error) {
    const failure = readTransportFailure(error);
    return { ok: false, failure, retry: classifyRetry(failure, dispatchInit) };
  } finally {
    clearTimer(timer);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
}
