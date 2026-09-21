import { describe, expect, it } from 'vitest';
import { createSessionSummaryIdempotencyKey, withSessionSummaryIdempotency } from './idempotency';

const uuid = '018f47f8-7f5d-7e70-9f4b-3f1ccf513a20';

describe('session summary idempotency client contract', () => {
  it('creates an opaque bounded key without activity or user content', () => {
    const key = createSessionSummaryIdempotencyKey('practice', () => uuid);
    expect(key).toBe(`session:practice:${uuid}`);
    expect(key.length).toBeLessThanOrEqual(128);
  });

  it('keeps the same caller-owned key across request retries', () => {
    const key = createSessionSummaryIdempotencyKey('onboarding', () => uuid);
    const first = withSessionSummaryIdempotency(undefined, key);
    const retry = withSessionSummaryIdempotency({ headers: { Authorization: 'Bearer test' } }, key);
    expect(new Headers(first.headers).get('Idempotency-Key')).toBe(key);
    expect(new Headers(retry.headers).get('Idempotency-Key')).toBe(key);
    expect(new Headers(retry.headers).get('Authorization')).toBe('Bearer test');
  });

  it('rejects content-bearing or malformed scopes and UUIDs', () => {
    expect(() => createSessionSummaryIdempotencyKey('user@example.com', () => uuid)).toThrow();
    expect(() => createSessionSummaryIdempotencyKey('practice', () => 'predictable')).toThrow();
  });
});
