import { describe, expect, it } from 'vitest';
import {
  formatFailureMessage,
  invalidResponseFailure,
  normalizeRequestId,
  readApiFailure,
  readTransportFailure,
} from './failure';

describe('API failure recovery contract', () => {
  it('uses bounded structured data and ignores server prose', async () => {
    const response = new Response(
      JSON.stringify({
        error: '<script>unsafe</script>',
        code: 'IDEMPOTENCY_KEY_REUSED',
        requestId: 'tsr_01e139ec-8615-4f44-bc0b-e9f38fa974ab',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );

    const failure = await readApiFailure(response);

    expect(failure).toMatchObject({
      kind: 'conflict',
      code: 'IDEMPOTENCY_KEY_REUSED',
      recovery: 'change_request',
      requestId: 'tsr_01e139ec-8615-4f44-bc0b-e9f38fa974ab',
      outcome: 'verified_rejected',
    });
    expect(formatFailureMessage(failure)).not.toContain('script');
  });

  it('prefers the server response header and bounds retry timing', async () => {
    const response = new Response(JSON.stringify({ retryAfter: 2 }), {
      status: 429,
      headers: {
        'Retry-After': '15',
        'X-Request-Id': 'tsr_966d8dcf-fd23-4751-a06c-d157ed0c63c9',
      },
    });

    const failure = await readApiFailure(response);

    expect(failure.retryAfterSeconds).toBe(15);
    expect(failure.recovery).toBe('retry_after_delay');
  });

  it('does not claim a transport-failed mutation was rejected', () => {
    const failure = readTransportFailure(new TypeError('network failure'));

    expect(failure.kind).toBe('offline');
    expect(failure.message).toContain('outcome is unverified');
    expect(failure.recovery).toBe('retry_manually');
  });

  it('does not expose malformed request identifiers or codes', async () => {
    const response = new Response(
      JSON.stringify({ code: 'raw email@example.test', requestId: '../../etc/passwd' }),
      { status: 503 }
    );

    const failure = await readApiFailure(response);

    expect(failure.code).toBe('HTTP_503');
    expect(failure.requestId).toBeNull();
  });

  it('collapses unknown structured codes so they cannot carry identifiers', async () => {
    const response = new Response(JSON.stringify({ code: 'CUSTOMER_ACCOUNT_123456789' }), {
      status: 409,
    });

    expect((await readApiFailure(response)).code).toBe('HTTP_409');
  });

  it.each([
    'CREATE_FAILED',
    'ALREADY_MEMBER',
    'INVALID_EMAIL',
    'INVALID_ORGANISATION',
    'INVALID_ORG_TYPE',
    'INVALID_ROLE',
    'INVALID_SEAT_COUNT',
    'INVITATION_PENDING',
    'INVITATION_REQUIRED',
    'NOT_STUDENT',
    'NO_SEATS_AVAILABLE',
    'ROLE_ESCALATION',
    'SEATS_IN_USE',
  ])('does not preserve retired institution success-path code %s', async (code) => {
    const failure = await readApiFailure(Response.json({ code }, { status: 503 }));

    expect(failure.code).toBe('HTTP_503');
  });

  it.each([
    [401, 'UNAUTHORIZED', 'unauthenticated', 'reauthenticate'],
    [403, 'ELIGIBILITY_REQUIRED', 'eligibility_blocked', 'resolve_eligibility'],
    [403, 'FORBIDDEN', 'forbidden', 'none'],
    [400, 'VALIDATION_ERROR', 'client', 'change_request'],
    [500, 'INTERNAL_ERROR', 'server', 'retry_manually'],
  ])(
    'normalizes status %i without rendering server prose',
    async (status, code, kind, recovery) => {
      const response = new Response(
        JSON.stringify({ error: 'private raw input and token', code }),
        { status }
      );

      const failure = await readApiFailure(response);

      expect(failure).toMatchObject({ kind, code, recovery, status });
      expect(formatFailureMessage(failure)).not.toContain('private raw input');
    }
  );

  it('marks malformed successful JSON as an unverified response', () => {
    const response = new Response('not json', {
      status: 200,
      headers: { 'X-Request-Id': 'tsr_d0e66a0d-cb27-4b2b-9bbb-5369e99581b0' },
    });

    expect(invalidResponseFailure(response)).toMatchObject({
      kind: 'invalid_response',
      outcome: 'unverified',
      requestId: 'tsr_d0e66a0d-cb27-4b2b-9bbb-5369e99581b0',
    });
  });

  it.each([408, 500, 502, 503])('keeps an HTTP %i operation outcome unverified', async (status) => {
    const failure = await readApiFailure(
      Response.json({ code: status === 500 ? 'INTERNAL_ERROR' : undefined }, { status })
    );

    expect(failure.outcome).toBe('unverified');
  });

  it('accepts only opaque server correlation identifiers', () => {
    expect(normalizeRequestId('tsr_D0E66A0D-CB27-4B2B-9BBB-5369E99581B0')).toBe(
      'tsr_d0e66a0d-cb27-4b2b-9bbb-5369e99581b0'
    );
    expect(normalizeRequestId('tsr_customer@example.test')).toBeNull();
    expect(normalizeRequestId('trace_01e139ec-8615-4f44-bc0b-e9f38fa974ab')).toBeNull();
  });
});
