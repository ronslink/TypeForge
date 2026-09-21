import type { ApiFailure } from './failure';

export type RetryMode = 'none' | 'manual' | 'after_delay' | 'reauthenticate';
export type RetryReason =
  | 'not_recoverable_by_retry'
  | 'reauthentication_required'
  | 'safe_read'
  | 'same_idempotency_key_required'
  | 'unsafe_mutation_without_idempotency';

export interface RetryDecision {
  allowed: boolean;
  mode: RetryMode;
  reason: RetryReason;
  /** Mutations must reuse the exact original key and payload. */
  reuseIdempotencyKey: boolean;
  retryAfterSeconds: number | null;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const RETRYABLE_FAILURES = new Set([
  'offline',
  'timeout',
  'invalid_response',
  'rate_limited',
  'server',
]);
const RETRYABLE_CONFLICT_CODES = new Set(['IDEMPOTENCY_REQUEST_IN_PROGRESS']);

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._-]{7,199}$/;

export function isValidIdempotencyKey(value: string | null): boolean {
  return value !== null && IDEMPOTENCY_KEY_PATTERN.test(value);
}

/**
 * Classify a possible retry. This function never performs a retry. Callers
 * must keep mutations manual and reuse the exact key and payload represented
 * by the original operation.
 */
export function classifyRetry(
  failure: ApiFailure,
  request: { method?: string; headers?: HeadersInit }
): RetryDecision {
  const method = (request.method ?? 'GET').toUpperCase();
  const safeRead = SAFE_METHODS.has(method);
  let idempotencyKey: string | null;
  try {
    idempotencyKey = new Headers(request.headers).get('Idempotency-Key');
  } catch {
    return {
      allowed: false,
      mode: 'none',
      reason: 'not_recoverable_by_retry',
      reuseIdempotencyKey: false,
      retryAfterSeconds: null,
    };
  }

  if (failure.kind === 'unauthenticated') {
    return {
      allowed: true,
      mode: 'reauthenticate',
      reason: 'reauthentication_required',
      reuseIdempotencyKey: !safeRead && isValidIdempotencyKey(idempotencyKey),
      retryAfterSeconds: null,
    };
  }

  const retryable =
    RETRYABLE_FAILURES.has(failure.kind) ||
    (failure.kind === 'conflict' && RETRYABLE_CONFLICT_CODES.has(failure.code));

  if (!retryable) {
    return {
      allowed: false,
      mode: 'none',
      reason: 'not_recoverable_by_retry',
      reuseIdempotencyKey: false,
      retryAfterSeconds: null,
    };
  }

  if (safeRead) {
    return {
      allowed: true,
      mode:
        failure.kind === 'rate_limited' || RETRYABLE_CONFLICT_CODES.has(failure.code)
          ? 'after_delay'
          : 'manual',
      reason: 'safe_read',
      reuseIdempotencyKey: false,
      retryAfterSeconds: failure.retryAfterSeconds,
    };
  }

  if (isValidIdempotencyKey(idempotencyKey)) {
    return {
      allowed: true,
      mode:
        failure.kind === 'rate_limited' || RETRYABLE_CONFLICT_CODES.has(failure.code)
          ? 'after_delay'
          : 'manual',
      reason: 'same_idempotency_key_required',
      reuseIdempotencyKey: true,
      retryAfterSeconds: failure.retryAfterSeconds,
    };
  }

  return {
    allowed: false,
    mode: 'none',
    reason: 'unsafe_mutation_without_idempotency',
    reuseIdempotencyKey: false,
    retryAfterSeconds: null,
  };
}
