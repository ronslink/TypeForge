import { describe, expect, it } from 'vitest';
import type { ApiFailure } from './failure';
import { classifyRetry, isValidIdempotencyKey } from './recovery';

function failure(kind: ApiFailure['kind'], retryAfterSeconds: number | null = null): ApiFailure {
  return {
    kind,
    code: 'SYNTHETIC_FAILURE',
    status: kind === 'offline' || kind === 'timeout' ? null : 503,
    requestId: null,
    retryAfterSeconds,
    recovery: 'retry_manually',
    outcome: 'unverified',
    message: 'Safe message.',
  };
}

describe('API retry safety', () => {
  it('allows a manual retry for an idempotent read', () => {
    expect(classifyRetry(failure('offline'), { method: 'GET' })).toEqual({
      allowed: true,
      mode: 'manual',
      reason: 'safe_read',
      reuseIdempotencyKey: false,
      retryAfterSeconds: null,
    });
  });

  it('prohibits retrying a mutation with an unverified outcome and no key', () => {
    expect(classifyRetry(failure('timeout'), { method: 'POST' })).toMatchObject({
      allowed: false,
      reason: 'unsafe_mutation_without_idempotency',
      reuseIdempotencyKey: false,
    });
  });

  it('permits only a same-key mutation retry when a bounded key exists', () => {
    const decision = classifyRetry(failure('server'), {
      method: 'PATCH',
      headers: { 'Idempotency-Key': 'session:update:8b10e7aa-9d09-48df-aa9e-b1c638e0cdcb' },
    });

    expect(decision).toMatchObject({
      allowed: true,
      mode: 'manual',
      reason: 'same_idempotency_key_required',
      reuseIdempotencyKey: true,
    });
  });

  it('preserves bounded rate-limit delay semantics', () => {
    expect(classifyRetry(failure('rate_limited', 20), { method: 'GET' })).toMatchObject({
      allowed: true,
      mode: 'after_delay',
      retryAfterSeconds: 20,
    });
  });

  it('allows an in-progress idempotent operation to be checked with the same key after delay', () => {
    const inProgress = {
      ...failure('conflict', 1),
      code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS',
    };

    expect(
      classifyRetry(inProgress, {
        method: 'POST',
        headers: { 'Idempotency-Key': 'session:create:valid-123' },
      })
    ).toMatchObject({
      allowed: true,
      mode: 'after_delay',
      reuseIdempotencyKey: true,
      retryAfterSeconds: 1,
    });
  });

  it('never treats conflicts, validation or eligibility denials as blind retries', () => {
    for (const kind of ['conflict', 'client', 'eligibility_blocked'] as const) {
      expect(classifyRetry(failure(kind), { method: 'GET' }).allowed).toBe(false);
    }
  });

  it('fails malformed header values closed without throwing or authorizing a retry', () => {
    expect(
      classifyRetry(failure('server'), {
        method: 'POST',
        headers: { Authorization: 'Bearer invalid\r\nvalue' },
      })
    ).toEqual({
      allowed: false,
      mode: 'none',
      reason: 'not_recoverable_by_retry',
      reuseIdempotencyKey: false,
      retryAfterSeconds: null,
    });
  });

  it('rejects keys that could carry unbounded or unsafe content', () => {
    expect(isValidIdempotencyKey('session:create:valid-123')).toBe(true);
    expect(isValidIdempotencyKey('email@example.test')).toBe(false);
    expect(isValidIdempotencyKey(`session:${'x'.repeat(200)}`)).toBe(false);
  });
});
