import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_AUTHENTICATED_TIMEOUT_MS, createAuthenticatedFetch } from './authenticated-fetch';

const ORG_ID = '11111111-1111-4111-8111-111111111111';
const SESSION_ID = '22222222-2222-4222-8222-222222222222';

function okJson(body: unknown = { ok: true }): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('shared authenticated fetch', () => {
  it('attaches the bearer token for a reviewed target', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    await authFetch('/api/v1/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0]!;
    expect(new Headers(init!.headers).get('Authorization')).toBe('Bearer token-123');
  });

  it('pins dispatch to same-origin, no-redirect and bounded credentials', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    await authFetch('/api/v1/users/me');

    const [, init] = fetchImpl.mock.calls[0]!;
    expect(init!.credentials).toBe('same-origin');
    expect(init!.mode).toBe('same-origin');
    expect(init!.redirect).toBe('error');
    expect(init!.signal).toBeInstanceOf(AbortSignal);
  });

  it('dispatches without Authorization when no token is available', async () => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => null,
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    await authFetch('/api/v1/progress');

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [, init] = fetchImpl.mock.calls[0]!;
    expect(new Headers(init?.headers ?? {}).has('Authorization')).toBe(false);
  });

  it.each([
    ['a non-reviewed same-origin path', '/account/settings'],
    ['an unreviewed api path', '/api/v1/admin'],
    ['a path traversal attempt', '/api/v1/progress/../../admin'],
    ['a malformed organisation identifier', '/api/v1/organisations/not-a-uuid'],
  ])('refuses %s without dispatching', async (_label, target) => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    const response = await authFetch(target);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toMatchObject({ code: 'INVALID_REQUEST' });
  });

  it('refuses a cross-origin target even when the path looks reviewed', async () => {
    vi.stubGlobal('location', { origin: 'https://app.example' });
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    const response = await authFetch('https://evil.example/api/v1/progress');

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it.each([
    ['a parameterised organisation target', `/api/v1/organisations/${ORG_ID}`],
    [
      'a nested organisation member target',
      `/api/v1/organisations/${ORG_ID}/members/${SESSION_ID}/performance`,
    ],
    ['a seat assignment target', `/api/v1/organisations/${ORG_ID}/seats/${SESSION_ID}`],
    ['a session keystroke target', `/api/v1/sessions/${SESSION_ID}/keystrokes`],
    ['a reviewed target with a query string', '/api/v1/progress?subject=other'],
  ])('allows %s', async (_label, target) => {
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => okJson());
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    await authFetch(target);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects a non-positive or out-of-range timeout', () => {
    expect(() => createAuthenticatedFetch({ getToken: async () => null, timeoutMs: 10 })).toThrow(
      /timeoutMs/
    );
    expect(() =>
      createAuthenticatedFetch({ getToken: async () => null, timeoutMs: 120_000 })
    ).toThrow(/timeoutMs/);
  });

  it('defaults the timeout to fifteen seconds', () => {
    expect(DEFAULT_AUTHENTICATED_TIMEOUT_MS).toBe(15_000);
  });

  it('aborts a hanging request when the timeout elapses', async () => {
    const fetchImpl = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
        })
    );
    const authFetch = createAuthenticatedFetch({
      getToken: async () => 'token-123',
      timeoutMs: 100,
      fetch: fetchImpl as unknown as typeof globalThis.fetch,
    });

    await expect(authFetch('/api/v1/progress')).rejects.toThrow();
  });
});
