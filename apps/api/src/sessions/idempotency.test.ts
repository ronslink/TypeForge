import { describe, expect, it } from 'vitest';
import {
  IDEMPOTENCY_KEY_MAX_LENGTH,
  IDEMPOTENCY_RETENTION_DAYS,
  decideExistingIdempotency,
  fingerprintSessionRequest,
  hashIdempotencyKey,
  idempotencyExpiry,
  idempotencyIdentity,
  normalizeIdempotencyKey,
} from './idempotency.js';

const NOW = new Date('2026-09-21T10:00:00.000Z');
const FUTURE = new Date('2026-09-28T10:00:00.000Z');
const PAST = new Date('2026-09-20T10:00:00.000Z');

describe('idempotency key normalisation', () => {
  it('accepts an opaque key of a reasonable shape', () => {
    expect(normalizeIdempotencyKey('session-3f2504e0-4f89-11d3')).toBe(
      'session-3f2504e0-4f89-11d3'
    );
    expect(normalizeIdempotencyKey('  spaced.key:value  ')).toBe('spaced.key:value');
  });

  it.each([
    ['a non-string', 12345],
    ['null', null],
    ['undefined', undefined],
    ['too short', 'short'],
    ['too long', 'a'.repeat(IDEMPOTENCY_KEY_MAX_LENGTH + 1)],
    ['leading punctuation', '-leading'],
    ['an embedded space', 'has space here'],
    ['a slash', 'path/like/key'],
    ['a newline', 'line\nbreak'],
  ])('refuses %s', (_label, value) => {
    expect(normalizeIdempotencyKey(value)).toBeNull();
  });
});

describe('idempotency identity', () => {
  it('never derives the stored hash from the raw key', () => {
    const hash = hashIdempotencyKey('session-3f2504e0-4f89-11d3');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain('session-3f2504e0');
  });

  it('is deterministic and distinct per key', () => {
    expect(hashIdempotencyKey('key-aaaaaaaa')).toBe(hashIdempotencyKey('key-aaaaaaaa'));
    expect(hashIdempotencyKey('key-aaaaaaaa')).not.toBe(hashIdempotencyKey('key-bbbbbbbb'));
  });

  it('scopes the identity to subject, operation and target', () => {
    expect(
      idempotencyIdentity({
        userId: 'user-1',
        operation: 'create',
        operationTarget: 'sessions',
        key: 'key-aaaaaaaa',
      })
    ).toEqual({
      userId: 'user-1',
      operation: 'create',
      operationTarget: 'sessions',
      keyHash: hashIdempotencyKey('key-aaaaaaaa'),
    });
  });
});

describe('request fingerprinting', () => {
  const base = {
    operation: 'create' as const,
    operationTarget: 'sessions',
    payload: { wpm: 80, accuracy: 97, language: 'en' },
  };

  it('is stable across object key order', () => {
    expect(
      fingerprintSessionRequest({
        ...base,
        payload: { accuracy: 97, language: 'en', wpm: 80 },
      })
    ).toBe(fingerprintSessionRequest(base));
  });

  it('ignores undefined members but not null ones', () => {
    expect(
      fingerprintSessionRequest({ ...base, payload: { wpm: 80, accuracy: 97, language: 'en', lessonId: undefined } })
    ).toBe(fingerprintSessionRequest(base));

    expect(
      fingerprintSessionRequest({ ...base, payload: { wpm: 80, accuracy: 97, language: 'en', lessonId: null } })
    ).not.toBe(fingerprintSessionRequest(base));
  });

  it('changes when the payload or the target changes', () => {
    expect(fingerprintSessionRequest({ ...base, payload: { ...base.payload, wpm: 81 } })).not.toBe(
      fingerprintSessionRequest(base)
    );
    expect(fingerprintSessionRequest({ ...base, operationTarget: 'other' })).not.toBe(
      fingerprintSessionRequest(base)
    );
  });

  it('expires seven days out', () => {
    expect(idempotencyExpiry(NOW).getTime() - NOW.getTime()).toBe(
      IDEMPOTENCY_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );
  });
});

describe('existing record decisions', () => {
  const completed = {
    requestHash: 'a'.repeat(64),
    status: 'completed',
    responseStatus: 201,
    responseBody: { session: { id: 'session-1' }, xpEarned: 10 },
    expiresAt: FUTURE,
  };

  it('replays a completed record for the same request', () => {
    expect(decideExistingIdempotency(completed, 'a'.repeat(64), NOW)).toEqual({
      kind: 'replay',
      responseStatus: 201,
      responseBody: { session: { id: 'session-1' }, xpEarned: 10 },
    });
  });

  it('reports a different payload under the same key as a mismatch', () => {
    expect(decideExistingIdempotency(completed, 'b'.repeat(64), NOW)).toEqual({
      kind: 'mismatch',
    });
  });

  it('reports an expired record as expired', () => {
    expect(
      decideExistingIdempotency({ ...completed, expiresAt: PAST }, 'a'.repeat(64), NOW)
    ).toEqual({ kind: 'expired' });
  });

  it('reports a pending record as in progress', () => {
    expect(
      decideExistingIdempotency(
        { ...completed, status: 'pending', responseStatus: null, responseBody: null },
        'a'.repeat(64),
        NOW
      )
    ).toEqual({ kind: 'in_progress' });
  });

  it.each([
    ['a non-2xx stored status', { responseStatus: 500 }],
    ['a missing stored status', { responseStatus: null }],
    ['a non-object stored body', { responseBody: 'not-an-object' }],
    ['an array stored body', { responseBody: [] }],
  ])('refuses to replay %s', (_label, override) => {
    expect(
      decideExistingIdempotency({ ...completed, ...override }, 'a'.repeat(64), NOW)
    ).toEqual({ kind: 'invalid_replay' });
  });
});
