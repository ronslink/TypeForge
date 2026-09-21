import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestApiJson } from './request';

const REQUEST_ID = 'tsr_d0e66a0d-cb27-4b2b-9bbb-5369e99581b0';

afterEach(() => {
  vi.useRealTimers();
});

describe('central JSON API request boundary', () => {
  it('returns parsed JSON and an opaque response correlation ID', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ requests: [] }, { status: 200, headers: { 'X-Request-Id': REQUEST_ID } })
    ) as unknown as typeof fetch;

    await expect(
      requestApiJson<{ requests: unknown[] }>('/api/v1/privacy/requests', {}, { fetch: fetchImpl })
    ).resolves.toEqual({
      ok: true,
      data: { requests: [] },
      status: 200,
      requestId: REQUEST_ID,
    });
  });

  it('forces same-origin no-redirect dispatch for a reviewed bearer-bearing target', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer session-token');
      expect(init).toMatchObject({
        credentials: 'same-origin',
        mode: 'same-origin',
        redirect: 'error',
      });
      return Response.json({ subject: 'user-a', locale: 'en' });
    }) as unknown as typeof fetch;

    await expect(
      requestApiJson(
        '/api/v1/users/me/locale',
        { method: 'PATCH', headers: { Authorization: 'Bearer session-token' } },
        { fetch: fetchImpl }
      )
    ).resolves.toMatchObject({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['URL object', new URL('https://evil.example/api/v1/progress')],
    ['Request object', new Request('https://evil.example/api/v1/progress')],
    ['absolute URL', 'https://evil.example/api/v1/progress'],
    ['protocol-relative URL', '//evil.example/api/v1/progress'],
    ['query', '/api/v1/progress?subject=other'],
    ['fragment', '/api/v1/progress#secret'],
    ['backslash', '/api/v1\\progress'],
    ['dot segment', '/api/v1/../progress'],
    ['unapproved endpoint', '/api/v1/admin'],
  ] as const)('rejects a bearer-bearing %s before fetch', async (_label, target) => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await requestApiJson(
      target as never,
      { headers: { Authorization: 'Bearer session-token' } },
      { fetch: fetchImpl }
    );

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: false,
      failure: {
        kind: 'client',
        code: 'INVALID_REQUEST',
        status: null,
        requestId: null,
        recovery: 'none',
        outcome: 'verified_rejected',
      },
      retry: { allowed: false, reason: 'not_recoverable_by_retry' },
    });
    expect(JSON.stringify(result)).not.toContain('session-token');
    expect(JSON.stringify(result)).not.toContain(String(target));
  });

  it.each(['https://evil.example/api/v1/progress', 'http://localhost:3000/api/v1/admin'])(
    'rejects a Request-carried bearer before fetch at %s',
    async (url) => {
      const fetchImpl = vi.fn() as unknown as typeof fetch;
      const target = new Request(url, {
        headers: { Authorization: 'Bearer request-owned-secret' },
      });

      const result = await requestApiJson(target as never, {}, { fetch: fetchImpl });

      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        ok: false,
        failure: { kind: 'client', code: 'INVALID_REQUEST' },
        retry: { allowed: false, reason: 'not_recoverable_by_retry' },
      });
      expect(JSON.stringify(result)).not.toContain('request-owned-secret');
      expect(JSON.stringify(result)).not.toContain(url);
    }
  );

  it('rejects a Request subclass that masks its internally carried bearer', async () => {
    class MaskedRequest extends Request {
      override get headers(): Headers {
        return new Headers();
      }
    }
    const target = new MaskedRequest('https://evil.example/api/v1/progress', {
      headers: { Authorization: 'Bearer masked-request-secret' },
    });
    expect(new Request(target).headers.get('Authorization')).toBe('Bearer masked-request-secret');
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await requestApiJson(target as never, {}, { fetch: fetchImpl });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: false,
      failure: { kind: 'client', code: 'INVALID_REQUEST' },
      retry: { allowed: false, reason: 'not_recoverable_by_retry' },
    });
    expect(JSON.stringify(result)).not.toContain('masked-request-secret');
    expect(JSON.stringify(result)).not.toContain('evil.example');
  });

  it('normalizes a non-2xx response and does not copy server prose', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        { error: 'token secret raw typing input', code: 'ELIGIBILITY_REQUIRED' },
        { status: 403, headers: { 'X-Request-Id': REQUEST_ID } }
      )
    ) as unknown as typeof fetch;

    const result = await requestApiJson('/api/v1/progress', {}, { fetch: fetchImpl });

    expect(result).toMatchObject({
      ok: false,
      failure: { kind: 'eligibility_blocked', requestId: REQUEST_ID },
      retry: { allowed: false },
    });
    expect(JSON.stringify(result)).not.toContain('raw typing input');
  });

  it('normalizes invalid JSON even when the status is successful', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response('<html>provider failure</html>', {
          status: 200,
          headers: { 'X-Request-Id': REQUEST_ID },
        })
    ) as unknown as typeof fetch;

    const result = await requestApiJson('/api/v1/progress', {}, { fetch: fetchImpl });

    expect(result).toMatchObject({
      ok: false,
      failure: { kind: 'invalid_response', outcome: 'unverified', requestId: REQUEST_ID },
      retry: { allowed: true, reason: 'safe_read' },
    });
  });

  it('does not authorize a retry after a mutation network rejection without idempotency', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Bearer secret user@example.test');
    }) as unknown as typeof fetch;

    const result = await requestApiJson(
      '/api/v1/privacy/requests',
      { method: 'POST', body: '{"type":"access"}' },
      { fetch: fetchImpl }
    );

    expect(result).toMatchObject({
      ok: false,
      failure: { kind: 'offline', outcome: 'unverified' },
      retry: { allowed: false, reason: 'unsafe_mutation_without_idempotency' },
    });
    expect(JSON.stringify(result)).not.toContain('user@example.test');
  });

  it('requires a same-key retry after an idempotent mutation failure', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json(
        { code: 'INTERNAL_ERROR' },
        { status: 503, headers: { 'X-Request-Id': REQUEST_ID } }
      )
    ) as unknown as typeof fetch;

    const result = await requestApiJson(
      '/api/v1/sessions',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': 'session:create:8b10e7aa-9d09-48df-aa9e-b1c638e0cdcb' },
      },
      { fetch: fetchImpl }
    );

    expect(result).toMatchObject({
      ok: false,
      retry: {
        allowed: true,
        reason: 'same_idempotency_key_required',
        reuseIdempotencyKey: true,
      },
    });
  });

  it('converts an aborted request into a timeout state', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
            once: true,
          });
        })
    ) as unknown as typeof fetch;

    const pending = requestApiJson('/api/v1/progress', { timeoutMs: 100 }, { fetch: fetchImpl });
    await vi.advanceTimersByTimeAsync(100);

    await expect(pending).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'timeout', code: 'REQUEST_TIMEOUT' },
      retry: { allowed: true, reason: 'safe_read' },
    });
  });
});
