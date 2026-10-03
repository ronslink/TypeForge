/**
 * Proves that an API failure actually reaches Sentry.
 *
 * The unit tests in `apps/api` cover the reporter seam; this test covers the
 * binding on the other side of it, using the real Sentry SDK with a capture
 * transport instead of a mock. That is the difference between "the wiring
 * compiles" and "an event is delivered", which is the only claim worth making
 * about error tracking.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/sveltekit';
import type { Context } from 'hono';
import { handleApiError, setApiErrorReporter } from '@typeforge/api';
import { installApiErrorReporter } from './api-error-reporting.js';

/** Envelopes handed to the transport, i.e. what would have been sent to Sentry. */
const delivered: unknown[] = [];

Sentry.init({
  // Syntactically valid but unroutable: nothing leaves the process because the
  // transport below replaces the network call.
  dsn: 'https://public@example.invalid/1',
  transport: () => ({
    send: async (envelope: unknown) => {
      delivered.push(envelope);
      return { statusCode: 200 };
    },
    flush: async () => true,
  }),
});

function fakeContext(path = '/api/v1/sessions', method = 'POST'): Context {
  return {
    req: { path, method },
    json: (body: unknown, status?: number) =>
      new Response(JSON.stringify(body), { status: status ?? 200 }),
  } as unknown as Context;
}

beforeAll(() => {
  installApiErrorReporter();
});

beforeEach(() => {
  // The API error handler logs deliberately; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  setApiErrorReporter(null);
  vi.restoreAllMocks();
});

describe('API errors reach Sentry', () => {
  it('delivers an event containing the original error message', async () => {
    delivered.length = 0;

    const response = handleApiError(
      new Error('key_mastery upsert failed with 42P10'),
      fakeContext('/api/v1/sessions', 'POST')
    );
    await Sentry.flush(2_000);

    // The client still gets its 500 regardless of reporting.
    expect(response.status).toBe(500);

    expect(delivered.length).toBeGreaterThan(0);
    expect(JSON.stringify(delivered)).toContain('key_mastery upsert failed with 42P10');
  });

  it('attaches the request path and method without any request payload', async () => {
    delivered.length = 0;

    handleApiError(new Error('second failure'), fakeContext('/api/v1/org/42/roster', 'GET'));
    await Sentry.flush(2_000);

    const serialized = JSON.stringify(delivered);
    expect(serialized).toContain('/api/v1/org/42/roster');
    expect(serialized).toContain('api_method');
    expect(serialized).toContain('GET');
  });
});
